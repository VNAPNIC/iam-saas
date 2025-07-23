package domain

import (
	"context"
	"iam-saas/internal/entities"

	"gorm.io/gorm"
)

type SsoRepository interface {
	Create(ctx context.Context, tx *gorm.DB, ssoConfig *entities.SsoConfig) error
	FindByTenantID(ctx context.Context, tenantID int64) (*entities.SsoConfig, error)
	Update(ctx context.Context, ssoConfig *entities.SsoConfig) error
	Delete(ctx context.Context, tenantID int64) error
}

type SsoService interface {
	GetSsoConfig(ctx context.Context, tenantID int64) (*entities.SsoConfig, error)
	UpdateSsoConfig(ctx context.Context, tenantID int64, provider, metadataURL, clientID, clientSecret string, status bool) (*entities.SsoConfig, error)
	DeleteSsoConfig(ctx context.Context, tenantID int64) error
	TestSsoConnection(ctx context.Context, tenantID int64) error
}
