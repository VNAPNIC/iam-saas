package service

import (
	"context"
	"iam-saas/internal/domain"
	"iam-saas/internal/entities"
	"iam-saas/pkg/app_error"
	"iam-saas/pkg/utils"

	"gorm.io/gorm"
)

type ssoService struct {
	db      *gorm.DB
	ssoRepo domain.SsoRepository
}

func NewSsoService(db *gorm.DB, ssoRepo domain.SsoRepository) domain.SsoService {
	return &ssoService{db, ssoRepo}
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
	}

	return ssoConfig, nil
}

func (s *ssoService) DeleteSsoConfig(ctx context.Context, tenantID int64) error {
	return s.ssoRepo.Delete(ctx, tenantID)
}

func (s *ssoService) TestSsoConnection(ctx context.Context, tenantID int64) error {
	// This would involve making an actual call to the IdP's metadata URL or a test endpoint.
	// For now, it's a placeholder.
	return nil
}
