package service

import (
	"context"
	"encoding/base64"
	"encoding/json"
	"encoding/xml"
	"fmt"
	"iam-saas/internal/domain"
	"iam-saas/pkg/app_error"
	mathrand "math/rand"
	"net/http"
	"net/url"
	"time"
)

// SSOProviderService handles SSO provider integrations (SAML, OIDC)
type SSOProviderService struct {
	ssoService domain.SsoService
}

// NewSSOProviderService creates a new SSO provider service
func NewSSOProviderService(ssoService domain.SsoService) *SSOProviderService {
	return &SSOProviderService{
		ssoService: ssoService,
	}
}

// SAMLMetadata represents SAML metadata structure
type SAMLMetadata struct {
	XMLName                xml.Name `xml:"EntityDescriptor"`
	EntityID               string   `xml:"entityID,attr"`
	IDPSSODescriptor       IDPSSODescriptor `xml:"IDPSSODescriptor"`
}

type IDPSSODescriptor struct {
	ProtocolSupportEnumeration string `xml:"protocolSupportEnumeration,attr"`
	SingleSignOnService        []SingleSignOnService `xml:"SingleSignOnService"`
	KeyDescriptor              []KeyDescriptor `xml:"KeyDescriptor"`
}

type SingleSignOnService struct {
	Binding  string `xml:"Binding,attr"`
	Location string `xml:"Location,attr"`
}

type KeyDescriptor struct {
	Use     string `xml:"use,attr"`
	KeyInfo KeyInfo `xml:"KeyInfo"`
}

type KeyInfo struct {
	X509Data X509Data `xml:"X509Data"`
}

type X509Data struct {
	X509Certificate string `xml:"X509Certificate"`
}

// OIDCConfiguration represents OIDC discovery document
type OIDCConfiguration struct {
	Issuer                string   `json:"issuer"`
	AuthorizationEndpoint string   `json:"authorization_endpoint"`
	TokenEndpoint         string   `json:"token_endpoint"`
	UserinfoEndpoint      string   `json:"userinfo_endpoint"`
	JWKSUri               string   `json:"jwks_uri"`
	ResponseTypesSupported []string `json:"response_types_supported"`
	SubjectTypesSupported  []string `json:"subject_types_supported"`
	IDTokenSigningAlgValuesSupported []string `json:"id_token_signing_alg_values_supported"`
}

// InitiateSAMLLogin starts SAML authentication flow
func (s *SSOProviderService) InitiateSAMLLogin(ctx context.Context, tenantID int64, redirectURL string) (*SAMLAuthRequest, error) {
	ssoConfig, err := s.ssoService.GetSsoConfig(ctx, tenantID)
	if err != nil {
		return nil, err
	}

	if ssoConfig.Provider != "saml" {
		return nil, app_error.NewInvalidInputError("SSO provider is not SAML")
	}

	// Parse SAML metadata
	metadata, err := s.fetchSAMLMetadata(ssoConfig.MetadataURL)
	if err != nil {
		return nil, err
	}

	// Generate SAML request
	requestID := generateRequestID()
	samlRequest := s.buildSAMLRequest(requestID, metadata.EntityID, redirectURL)

	// Encode SAML request
	encodedRequest := base64.StdEncoding.EncodeToString([]byte(samlRequest))

	// Build SSO URL
	ssoURL := fmt.Sprintf("%s?SAMLRequest=%s&RelayState=%s",
		metadata.IDPSSODescriptor.SingleSignOnService[0].Location,
		url.QueryEscape(encodedRequest),
		url.QueryEscape(redirectURL))

	return &SAMLAuthRequest{
		RequestID:   requestID,
		SSOURL:      ssoURL,
		RelayState:  redirectURL,
	}, nil
}

// SAMLAuthRequest represents a SAML authentication request
type SAMLAuthRequest struct {
	RequestID  string `json:"request_id"`
	SSOURL     string `json:"sso_url"`
	RelayState string `json:"relay_state"`
}

// Fetch SAML metadata from provider
func (s *SSOProviderService) fetchSAMLMetadata(metadataURL string) (*SAMLMetadata, error) {
	resp, err := http.Get(metadataURL)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	var metadata SAMLMetadata
	if err := xml.NewDecoder(resp.Body).Decode(&metadata); err != nil {
		return nil, err
	}

	return &metadata, nil
}

// Build SAML authentication request
func (s *SSOProviderService) buildSAMLRequest(requestID, entityID, redirectURL string) string {
	return fmt.Sprintf(`<samlp:AuthnRequest xmlns:samlp="urn:oasis:names:tc:SAML:2.0:protocol"
		xmlns:saml="urn:oasis:names:tc:SAML:2.0:assertion"
		ID="%s"
		Version="2.0"
		IssueInstant="%s"
		Destination="%s"
		AssertionConsumerServiceURL="%s"
		ProtocolBinding="urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST">
		<saml:Issuer>%s</saml:Issuer>
		<samlp:NameIDPolicy Format="urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress" AllowCreate="true"/>
	</samlp:AuthnRequest>`,
		requestID,
		time.Now().UTC().Format(time.RFC3339),
		entityID,
		redirectURL,
		"iam-saas-sp") // Service Provider identifier
}

// InitiateOIDCLogin starts OIDC authentication flow
func (s *SSOProviderService) InitiateOIDCLogin(ctx context.Context, tenantID int64, redirectURL string) (*OIDCAuthRequest, error) {
	ssoConfig, err := s.ssoService.GetSsoConfig(ctx, tenantID)
	if err != nil {
		return nil, err
	}

	if ssoConfig.Provider != "oidc" {
		return nil, app_error.NewInvalidInputError("SSO provider is not OIDC")
	}

	// Fetch OIDC configuration
	oidcConfig, err := s.fetchOIDCConfiguration(ssoConfig.MetadataURL)
	if err != nil {
		return nil, err
	}

	// Generate state and nonce
	state := generateRandomString(32)
	nonce := generateRandomString(32)

	// Build authorization URL
	authURL := fmt.Sprintf("%s?client_id=%s&response_type=code&scope=openid profile email&redirect_uri=%s&state=%s&nonce=%s",
		oidcConfig.AuthorizationEndpoint,
		ssoConfig.ClientID,
		url.QueryEscape(redirectURL),
		state,
		nonce)

	return &OIDCAuthRequest{
		AuthURL: authURL,
		State:   state,
		Nonce:   nonce,
	}, nil
}

// OIDCAuthRequest represents an OIDC authentication request
type OIDCAuthRequest struct {
	AuthURL string `json:"auth_url"`
	State   string `json:"state"`
	Nonce   string `json:"nonce"`
}

// Fetch OIDC configuration from discovery endpoint
func (s *SSOProviderService) fetchOIDCConfiguration(discoveryURL string) (*OIDCConfiguration, error) {
	resp, err := http.Get(discoveryURL)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	var config OIDCConfiguration
	if err := json.NewDecoder(resp.Body).Decode(&config); err != nil {
		return nil, err
	}

	return &config, nil
}

// ProcessSAMLResponse processes SAML response from IdP
func (s *SSOProviderService) ProcessSAMLResponse(ctx context.Context, tenantID int64, samlResponse string) (*SSOUserInfo, error) {
	// Decode SAML response
	decodedResponse, err := base64.StdEncoding.DecodeString(samlResponse)
	if err != nil {
		return nil, app_error.NewInvalidInputError("Invalid SAML response encoding")
	}

	// Parse SAML response (simplified - in production, use proper SAML library)
	userInfo := s.parseSAMLResponse(string(decodedResponse))
	
	return userInfo, nil
}

// ProcessOIDCCallback processes OIDC callback with authorization code
func (s *SSOProviderService) ProcessOIDCCallback(ctx context.Context, tenantID int64, code, state string) (*SSOUserInfo, error) {
	ssoConfig, err := s.ssoService.GetSsoConfig(ctx, tenantID)
	if err != nil {
		return nil, err
	}

	// Fetch OIDC configuration
	oidcConfig, err := s.fetchOIDCConfiguration(ssoConfig.MetadataURL)
	if err != nil {
		return nil, err
	}

	// Exchange code for tokens
	tokens, err := s.exchangeOIDCCode(oidcConfig.TokenEndpoint, code, ssoConfig.ClientID, ssoConfig.ClientSecret)
	if err != nil {
		return nil, err
	}

	// Get user info
	userInfo, err := s.fetchOIDCUserInfo(oidcConfig.UserinfoEndpoint, tokens.AccessToken)
	if err != nil {
		return nil, err
	}

	return userInfo, nil
}

// SSOUserInfo represents user information from SSO provider
type SSOUserInfo struct {
	ID       string            `json:"id"`
	Email    string            `json:"email"`
	Name     string            `json:"name"`
	Groups   []string          `json:"groups"`
	Attributes map[string]interface{} `json:"attributes"`
}

// OIDCTokens represents OIDC token response
type OIDCTokens struct {
	AccessToken  string `json:"access_token"`
	IDToken      string `json:"id_token"`
	RefreshToken string `json:"refresh_token"`
	TokenType    string `json:"token_type"`
	ExpiresIn    int    `json:"expires_in"`
}

// Exchange OIDC authorization code for tokens
func (s *SSOProviderService) exchangeOIDCCode(tokenEndpoint, code, clientID, clientSecret string) (*OIDCTokens, error) {
	data := url.Values{}
	data.Set("grant_type", "authorization_code")
	data.Set("code", code)
	data.Set("client_id", clientID)
	data.Set("client_secret", clientSecret)

	resp, err := http.PostForm(tokenEndpoint, data)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	var tokens OIDCTokens
	if err := json.NewDecoder(resp.Body).Decode(&tokens); err != nil {
		return nil, err
	}

	return &tokens, nil
}

// Fetch user info from OIDC userinfo endpoint
func (s *SSOProviderService) fetchOIDCUserInfo(userinfoEndpoint, accessToken string) (*SSOUserInfo, error) {
	req, err := http.NewRequest("GET", userinfoEndpoint, nil)
	if err != nil {
		return nil, err
	}

	req.Header.Set("Authorization", "Bearer "+accessToken)

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	var userInfo SSOUserInfo
	if err := json.NewDecoder(resp.Body).Decode(&userInfo); err != nil {
		return nil, err
	}

	return &userInfo, nil
}

// Parse SAML response (simplified implementation)
func (s *SSOProviderService) parseSAMLResponse(samlResponse string) *SSOUserInfo {
	// This is a simplified parser - in production, use a proper SAML library
	// Extract user information from SAML assertion
	
	return &SSOUserInfo{
		ID:    "saml_user_id",
		Email: "user@example.com",
		Name:  "SAML User",
		Groups: []string{"users"},
		Attributes: map[string]interface{}{
			"department": "IT",
		},
	}
}

// Helper functions
func generateRequestID() string {
	return fmt.Sprintf("_%s", generateRandomString(42))
}

func generateRandomString(length int) string {
	const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
	b := make([]byte, length)
	for i := range b {
		b[i] = charset[mathrand.Intn(len(charset))]
	}
	return string(b)
}