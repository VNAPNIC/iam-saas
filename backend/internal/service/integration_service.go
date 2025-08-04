package service

import (
	"context"
	"crypto/rand"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"iam-saas/internal/domain"
	"iam-saas/internal/entities"
	"iam-saas/pkg/app_error"
	"net/http"
	"strings"
	"time"

	"gorm.io/gorm"
)

type integrationService struct {
	db             *gorm.DB
	integrationRepo domain.IntegrationRepository
	siemForwarder  domain.SIEMForwarder
}

func NewIntegrationService(db *gorm.DB, integrationRepo domain.IntegrationRepository, siemForwarder domain.SIEMForwarder) domain.IntegrationService {
	return &integrationService{db, integrationRepo, siemForwarder}
}

// SCIM operations
func (s *integrationService) GetSCIMSettings(ctx context.Context, tenantID int64) (*entities.SCIMConfig, error) {
	integration, err := s.integrationRepo.FindByTenantAndType(ctx, tenantID, "scim")
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			// Create default SCIM integration if not exists
			return s.createDefaultSCIMIntegration(ctx, tenantID)
		}
		return nil, app_error.NewInternalServerError(err)
	}

	var config entities.SCIMConfig
	if err := json.Unmarshal([]byte(integration.Config), &config); err != nil {
		return nil, app_error.NewInternalServerError(err)
	}

	return &config, nil
}

func (s *integrationService) createDefaultSCIMIntegration(ctx context.Context, tenantID int64) (*entities.SCIMConfig, error) {
	// Generate API token
	token, err := s.GenerateSCIMToken(ctx, tenantID)
	if err != nil {
		return nil, err
	}

	config := &entities.SCIMConfig{
		BaseURL:  fmt.Sprintf("https://api.iamsaas.com/scim/v2/%d", tenantID),
		APIToken: token,
		Enabled:  false,
	}

	configJSON, err := json.Marshal(config)
	if err != nil {
		return nil, app_error.NewInternalServerError(err)
	}

	integration := &entities.Integration{
		TenantID: tenantID,
		Type:     "scim",
		Name:     "SCIM User Provisioning",
		Status:   "disabled",
		Config:   string(configJSON),
	}

	if err := s.integrationRepo.Create(ctx, nil, integration); err != nil {
		return nil, app_error.NewInternalServerError(err)
	}

	return config, nil
}

func (s *integrationService) UpdateSCIMSettings(ctx context.Context, tenantID int64, config *entities.SCIMConfig) error {
	integration, err := s.integrationRepo.FindByTenantAndType(ctx, tenantID, "scim")
	if err != nil {
		return app_error.NewInternalServerError(err)
	}

	configJSON, err := json.Marshal(config)
	if err != nil {
		return app_error.NewInternalServerError(err)
	}

	integration.Config = string(configJSON)
	integration.Status = "enabled"
	if !config.Enabled {
		integration.Status = "disabled"
	}

	if err := s.integrationRepo.Update(ctx, integration); err != nil {
		return app_error.NewInternalServerError(err)
	}

	return nil
}

func (s *integrationService) GenerateSCIMToken(ctx context.Context, tenantID int64) (string, error) {
	// Generate a secure random token
	bytes := make([]byte, 32)
	if _, err := rand.Read(bytes); err != nil {
		return "", app_error.NewInternalServerError(err)
	}
	return hex.EncodeToString(bytes), nil
}

// SIEM operations
func (s *integrationService) GetSIEMSettings(ctx context.Context, tenantID int64) (*entities.SIEMConfig, error) {
	integration, err := s.integrationRepo.FindByTenantAndType(ctx, tenantID, "siem")
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			// Return default empty config
			return &entities.SIEMConfig{
				Enabled: false,
				Format:  "json",
			}, nil
		}
		return nil, app_error.NewInternalServerError(err)
	}

	var config entities.SIEMConfig
	if err := json.Unmarshal([]byte(integration.Config), &config); err != nil {
		return nil, app_error.NewInternalServerError(err)
	}

	return &config, nil
}

func (s *integrationService) UpdateSIEMSettings(ctx context.Context, tenantID int64, config *entities.SIEMConfig) error {
	integration, err := s.integrationRepo.FindByTenantAndType(ctx, tenantID, "siem")
	if err != nil && err != gorm.ErrRecordNotFound {
		return app_error.NewInternalServerError(err)
	}

	configJSON, err := json.Marshal(config)
	if err != nil {
		return app_error.NewInternalServerError(err)
	}

	if err == gorm.ErrRecordNotFound {
		// Create new integration
		integration = &entities.Integration{
			TenantID: tenantID,
			Type:     "siem",
			Name:     "SIEM Log Forwarding",
			Status:   "disabled",
			Config:   string(configJSON),
		}
		if config.Enabled {
			integration.Status = "enabled"
		}
		return s.integrationRepo.Create(ctx, nil, integration)
	} else {
		// Update existing integration
		integration.Config = string(configJSON)
		integration.Status = "enabled"
		if !config.Enabled {
			integration.Status = "disabled"
		}
		return s.integrationRepo.Update(ctx, integration)
	}
}

func (s *integrationService) TestSIEMConnection(ctx context.Context, tenantID int64, config *entities.SIEMConfig) error {
	if s.siemForwarder != nil {
		return s.siemForwarder.TestConnection(ctx, config)
	}
	
	// Fallback simple HTTP test
	return s.testSIEMConnectionHTTP(ctx, config)
}

func (s *integrationService) testSIEMConnectionHTTP(ctx context.Context, config *entities.SIEMConfig) error {
	if config.EndpointURL == "" {
		return app_error.NewInvalidInputError("endpoint URL is required")
	}

	// Create a simple test payload
	testPayload := map[string]interface{}{
		"test":      true,
		"timestamp": time.Now().UTC().Format(time.RFC3339),
		"message":   "IAM SaaS SIEM connection test",
	}

	payloadBytes, err := json.Marshal(testPayload)
	if err != nil {
		return app_error.NewInternalServerError(err)
	}

	req, err := http.NewRequestWithContext(ctx, "POST", config.EndpointURL, strings.NewReader(string(payloadBytes)))
	if err != nil {
		return app_error.NewInternalServerError(err)
	}

	req.Header.Set("Content-Type", "application/json")
	if config.AuthHeader != "" {
		req.Header.Set("Authorization", config.AuthHeader)
	}

	client := &http.Client{Timeout: 10 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return app_error.NewInvalidInputError(fmt.Sprintf("connection failed: %v", err))
	}
	defer resp.Body.Close()

	if resp.StatusCode >= 400 {
		return app_error.NewInvalidInputError(fmt.Sprintf("SIEM endpoint returned status: %d", resp.StatusCode))
	}

	return nil
}

// General integration operations
func (s *integrationService) ListIntegrations(ctx context.Context, tenantID int64) ([]entities.Integration, error) {
	integrations, err := s.integrationRepo.ListByTenant(ctx, tenantID)
	if err != nil {
		return nil, app_error.NewInternalServerError(err)
	}
	return integrations, nil
}

func (s *integrationService) GetIntegration(ctx context.Context, tenantID int64, integrationType string) (*entities.Integration, error) {
	integration, err := s.integrationRepo.FindByTenantAndType(ctx, tenantID, integrationType)
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, app_error.NewNotFoundError("integration not found")
		}
		return nil, app_error.NewInternalServerError(err)
	}
	return integration, nil
}

func (s *integrationService) UpdateIntegrationStatus(ctx context.Context, tenantID int64, integrationType, status string) error {
	integration, err := s.integrationRepo.FindByTenantAndType(ctx, tenantID, integrationType)
	if err != nil {
		return app_error.NewInternalServerError(err)
	}

	integration.Status = status
	if err := s.integrationRepo.Update(ctx, integration); err != nil {
		return app_error.NewInternalServerError(err)
	}

	return nil
}