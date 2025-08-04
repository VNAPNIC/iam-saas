package service

import (
	"context"
	"crypto/tls"
	"encoding/json"
	"encoding/xml"
	"fmt"
	"iam-saas/internal/domain"
	"iam-saas/internal/entities"
	"iam-saas/internal/events"
	"iam-saas/pkg/app_error"
	"iam-saas/pkg/utils"
	"io"
	"net/http"
	"net/url"
	"strings"
	"time"

	"gorm.io/gorm"
)

type ssoService struct {
	db       *gorm.DB
	ssoRepo  domain.SsoRepository
	eventBus *events.EventBus
}

func NewSsoService(db *gorm.DB, ssoRepo domain.SsoRepository, eventBus *events.EventBus) domain.SsoService {
	return &ssoService{db, ssoRepo, eventBus}
}

func (s *ssoService) GetSsoConfig(ctx context.Context, tenantID int64) (*entities.SsoConfig, error) {
	return s.ssoRepo.FindByTenantID(ctx, tenantID)
}

func (s *ssoService) UpdateSsoConfig(ctx context.Context, tenantID int64, provider, metadataURL, clientID, clientSecret string, status bool) (*entities.SsoConfig, error) {
	existingConfig, err := s.ssoRepo.FindByTenantID(ctx, tenantID)
	if err != nil {
		return nil, app_error.NewInternalServerError(err)
	}

	hashedClientSecret, err := utils.HashPassword(clientSecret)
	if err != nil {
		return nil, app_error.NewInternalServerError(err)
	}

	var ssoConfig *entities.SsoConfig
	var eventType string
	
	if existingConfig == nil {
		ssoConfig = &entities.SsoConfig{
			TenantID:     tenantID,
			Provider:     provider,
			MetadataURL:  metadataURL,
			ClientID:     clientID,
			ClientSecret: hashedClientSecret,
			Status:       "enabled", // Default to enabled on creation
		}
		if err := s.ssoRepo.Create(ctx, nil, ssoConfig); err != nil {
			return nil, app_error.NewInternalServerError(err)
		}
		eventType = events.EventSSOProviderCreated
	} else {
		ssoConfig = existingConfig
		ssoConfig.Provider = provider
		ssoConfig.MetadataURL = metadataURL
		ssoConfig.ClientID = clientID
		ssoConfig.ClientSecret = hashedClientSecret
		ssoConfig.Status = "enabled"
		if !status {
			ssoConfig.Status = "disabled"
		}
		if err := s.ssoRepo.Update(ctx, ssoConfig); err != nil {
			return nil, app_error.NewInternalServerError(err)
		}
		eventType = events.EventSSOProviderUpdated
	}

	// Publish real-time event
	if s.eventBus != nil {
		eventData := map[string]interface{}{
			"tenant_id":     tenantID,
			"provider":      ssoConfig.Provider,
			"provider_id":   ssoConfig.ID,
			"status":        ssoConfig.Status,
			"metadata_url":  ssoConfig.MetadataURL,
			"client_id":     ssoConfig.ClientID,
		}
		_ = s.eventBus.Publish(events.Event{
			Type:     eventType,
			TenantID: fmt.Sprintf("%d", tenantID),
			Data:     eventData,
		})
	}

	return ssoConfig, nil
}

func (s *ssoService) DeleteSsoConfig(ctx context.Context, tenantID int64) error {
	return s.ssoRepo.Delete(ctx, tenantID)
}

func (s *ssoService) TestSsoConnection(ctx context.Context, tenantID int64) error {
	ssoConfig, err := s.GetSsoConfig(ctx, tenantID)
	if err != nil {
		return err
	}

	// Validate that config exists and has required fields
	if ssoConfig.MetadataURL == "" || ssoConfig.ClientID == "" {
		return app_error.NewInvalidInputError("SSO configuration is incomplete")
	}

	// Test connection to metadata URL
	client := &http.Client{
		Timeout: 10 * time.Second,
		Transport: &http.Transport{
			TLSClientConfig: &tls.Config{InsecureSkipVerify: false},
		},
	}

	resp, err := client.Get(ssoConfig.MetadataURL)
	if err != nil {
		return app_error.NewInvalidInputError(fmt.Sprintf("Failed to connect to metadata URL: %v", err))
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return app_error.NewInvalidInputError(fmt.Sprintf("Metadata URL returned status: %d", resp.StatusCode))
	}

	return nil
}

// SSO Provider Types
const (
	ProviderSAML     = "saml"
	ProviderOAuth2   = "oauth2"
	ProviderOIDC     = "oidc"
	ProviderAzureAD  = "azure_ad"
	ProviderGoogle   = "google"
	ProviderOkta     = "okta"
	ProviderAuth0    = "auth0"
)

// OIDC Discovery Document
type OIDCDiscovery struct {
	Issuer                string   `json:"issuer"`
	AuthorizationEndpoint string   `json:"authorization_endpoint"`
	TokenEndpoint         string   `json:"token_endpoint"`
	UserInfoEndpoint      string   `json:"userinfo_endpoint"`
	JWKSUri               string   `json:"jwks_uri"`
	ScopesSupported       []string `json:"scopes_supported"`
	ResponseTypesSupported []string `json:"response_types_supported"`
}

// Enhanced SSO Configuration
type EnhancedSSOConfig struct {
	*entities.SsoConfig
	ProviderMetadata map[string]interface{} `json:"provider_metadata"`
	ValidationStatus string                 `json:"validation_status"`
	LastTested       *time.Time             `json:"last_tested"`
	TestResults      map[string]interface{} `json:"test_results"`
}

// CreateSSOProvider creates a new SSO provider with enhanced validation
func (s *ssoService) CreateSSOProvider(ctx context.Context, tenantID int64, config *EnhancedSSOConfig) (*EnhancedSSOConfig, error) {
	// Validate provider type
	if !s.isValidProviderType(config.Provider) {
		return nil, app_error.NewInvalidInputError(fmt.Sprintf("Unsupported provider type: %s", config.Provider))
	}

	// Validate provider-specific configuration
	if err := s.validateProviderConfig(ctx, config); err != nil {
		return nil, err
	}

	// Hash client secret if provided
	if config.ClientSecret != "" {
		hashedSecret, err := utils.HashPassword(config.ClientSecret)
		if err != nil {
			return nil, app_error.NewInternalServerError(err)
		}
		config.ClientSecret = hashedSecret
	}

	// Set initial status
	config.TenantID = tenantID
	config.ValidationStatus = "pending"
	now := time.Now()
	config.LastTested = &now

	// Create in database
	if err := s.ssoRepo.Create(ctx, nil, config.SsoConfig); err != nil {
		return nil, app_error.NewInternalServerError(err)
	}

	// Publish real-time event
	if s.eventBus != nil {
		eventData := map[string]interface{}{
			"tenant_id":         tenantID,
			"provider":          config.Provider,
			"provider_id":       config.ID,
			"validation_status": config.ValidationStatus,
		}
		_ = s.eventBus.Publish(events.Event{
			Type:     events.EventSSOProviderCreated,
			TenantID: fmt.Sprintf("%d", tenantID),
			Data:     eventData,
		})
	}

	return config, nil
}

// ValidateSAMLProvider validates SAML provider configuration
func (s *ssoService) ValidateSAMLProvider(ctx context.Context, metadataURL string) (*entities.SAMLMetadata, error) {
	client := &http.Client{
		Timeout: 30 * time.Second,
		Transport: &http.Transport{
			TLSClientConfig: &tls.Config{InsecureSkipVerify: false},
		},
	}

	resp, err := client.Get(metadataURL)
	if err != nil {
		return nil, app_error.NewInvalidInputError(fmt.Sprintf("Failed to fetch SAML metadata: %v", err))
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, app_error.NewInvalidInputError(fmt.Sprintf("SAML metadata endpoint returned status: %d", resp.StatusCode))
	}

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, app_error.NewInternalServerError(err)
	}

	var metadata entities.SAMLMetadata
	if err := xml.Unmarshal(body, &metadata); err != nil {
		return nil, app_error.NewInvalidInputError(fmt.Sprintf("Invalid SAML metadata XML: %v", err))
	}

	// Validate required fields
	if metadata.EntityID == "" {
		return nil, app_error.NewInvalidInputError("SAML metadata missing EntityID")
	}

	if len(metadata.IDPSSODescriptor.SingleSignOnService) == 0 {
		return nil, app_error.NewInvalidInputError("SAML metadata missing SingleSignOnService")
	}

	return &metadata, nil
}

// ValidateOIDCProvider validates OIDC provider configuration
func (s *ssoService) ValidateOIDCProvider(ctx context.Context, issuerURL string) (*OIDCDiscovery, error) {
	// Construct discovery URL
	discoveryURL := strings.TrimSuffix(issuerURL, "/") + "/.well-known/openid_configuration"

	client := &http.Client{
		Timeout: 30 * time.Second,
		Transport: &http.Transport{
			TLSClientConfig: &tls.Config{InsecureSkipVerify: false},
		},
	}

	resp, err := client.Get(discoveryURL)
	if err != nil {
		return nil, app_error.NewInvalidInputError(fmt.Sprintf("Failed to fetch OIDC discovery document: %v", err))
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, app_error.NewInvalidInputError(fmt.Sprintf("OIDC discovery endpoint returned status: %d", resp.StatusCode))
	}

	var discovery OIDCDiscovery
	if err := json.NewDecoder(resp.Body).Decode(&discovery); err != nil {
		return nil, app_error.NewInvalidInputError(fmt.Sprintf("Invalid OIDC discovery document: %v", err))
	}

	// Validate required fields
	if discovery.Issuer == "" {
		return nil, app_error.NewInvalidInputError("OIDC discovery document missing issuer")
	}

	if discovery.AuthorizationEndpoint == "" {
		return nil, app_error.NewInvalidInputError("OIDC discovery document missing authorization_endpoint")
	}

	if discovery.TokenEndpoint == "" {
		return nil, app_error.NewInvalidInputError("OIDC discovery document missing token_endpoint")
	}

	return &discovery, nil
}

// isValidProviderType checks if the provider type is supported
func (s *ssoService) isValidProviderType(provider string) bool {
	validProviders := map[string]bool{
		ProviderSAML:    true,
		ProviderOAuth2:  true,
		ProviderOIDC:    true,
		ProviderAzureAD: true,
		ProviderGoogle:  true,
		ProviderOkta:    true,
		ProviderAuth0:   true,
	}
	return validProviders[provider]
}

// validateProviderConfig validates provider-specific configuration
func (s *ssoService) validateProviderConfig(ctx context.Context, config *EnhancedSSOConfig) error {
	switch config.Provider {
	case ProviderSAML:
		return s.validateSAMLConfig(ctx, config)
	case ProviderOIDC, ProviderAzureAD, ProviderGoogle, ProviderOkta, ProviderAuth0:
		return s.validateOIDCConfig(ctx, config)
	case ProviderOAuth2:
		return s.validateOAuth2Config(ctx, config)
	default:
		return app_error.NewInvalidInputError(fmt.Sprintf("Unknown provider type: %s", config.Provider))
	}
}

// validateSAMLConfig validates SAML-specific configuration
func (s *ssoService) validateSAMLConfig(ctx context.Context, config *EnhancedSSOConfig) error {
	if config.MetadataURL == "" {
		return app_error.NewInvalidInputError("SAML provider requires metadata URL")
	}

	// Validate metadata URL format
	if _, err := url.Parse(config.MetadataURL); err != nil {
		return app_error.NewInvalidInputError("Invalid metadata URL format")
	}

	// Fetch and validate SAML metadata
	metadata, err := s.ValidateSAMLProvider(ctx, config.MetadataURL)
	if err != nil {
		return err
	}

	// Store metadata for later use
	if config.ProviderMetadata == nil {
		config.ProviderMetadata = make(map[string]interface{})
	}
	config.ProviderMetadata["saml_metadata"] = metadata

	return nil
}

// validateOIDCConfig validates OIDC-specific configuration
func (s *ssoService) validateOIDCConfig(ctx context.Context, config *EnhancedSSOConfig) error {
	if config.MetadataURL == "" {
		return app_error.NewInvalidInputError("OIDC provider requires issuer URL")
	}

	if config.ClientID == "" {
		return app_error.NewInvalidInputError("OIDC provider requires client ID")
	}

	if config.ClientSecret == "" {
		return app_error.NewInvalidInputError("OIDC provider requires client secret")
	}

	// Validate issuer URL format
	if _, err := url.Parse(config.MetadataURL); err != nil {
		return app_error.NewInvalidInputError("Invalid issuer URL format")
	}

	// Fetch and validate OIDC discovery document
	discovery, err := s.ValidateOIDCProvider(ctx, config.MetadataURL)
	if err != nil {
		return err
	}

	// Store discovery document for later use
	if config.ProviderMetadata == nil {
		config.ProviderMetadata = make(map[string]interface{})
	}
	config.ProviderMetadata["oidc_discovery"] = discovery

	return nil
}

// validateOAuth2Config validates OAuth2-specific configuration
func (s *ssoService) validateOAuth2Config(ctx context.Context, config *EnhancedSSOConfig) error {
	if config.ClientID == "" {
		return app_error.NewInvalidInputError("OAuth2 provider requires client ID")
	}

	if config.ClientSecret == "" {
		return app_error.NewInvalidInputError("OAuth2 provider requires client secret")
	}

	// OAuth2 requires authorization and token endpoints
	if config.ProviderMetadata == nil {
		return app_error.NewInvalidInputError("OAuth2 provider requires authorization and token endpoints")
	}

	authEndpoint, hasAuth := config.ProviderMetadata["authorization_endpoint"]
	tokenEndpoint, hasToken := config.ProviderMetadata["token_endpoint"]

	if !hasAuth || authEndpoint == "" {
		return app_error.NewInvalidInputError("OAuth2 provider requires authorization endpoint")
	}

	if !hasToken || tokenEndpoint == "" {
		return app_error.NewInvalidInputError("OAuth2 provider requires token endpoint")
	}

	return nil
}
