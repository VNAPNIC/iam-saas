package domain

import (
	"context"
	"iam-saas/internal/entities"

	"gorm.io/gorm"
)

type IntegrationRepository interface {
	Create(ctx context.Context, tx *gorm.DB, integration *entities.Integration) error
	FindByID(ctx context.Context, id int64) (*entities.Integration, error)
	FindByTenantAndType(ctx context.Context, tenantID int64, integrationType string) (*entities.Integration, error)
	ListByTenant(ctx context.Context, tenantID int64) ([]entities.Integration, error)
	Update(ctx context.Context, integration *entities.Integration) error
	Delete(ctx context.Context, id int64) error
}

type IntegrationService interface {
	// SCIM operations
	GetSCIMSettings(ctx context.Context, tenantID int64) (*entities.SCIMConfig, error)
	UpdateSCIMSettings(ctx context.Context, tenantID int64, config *entities.SCIMConfig) error
	GenerateSCIMToken(ctx context.Context, tenantID int64) (string, error)

	// SIEM operations
	GetSIEMSettings(ctx context.Context, tenantID int64) (*entities.SIEMConfig, error)
	UpdateSIEMSettings(ctx context.Context, tenantID int64, config *entities.SIEMConfig) error
	TestSIEMConnection(ctx context.Context, tenantID int64, config *entities.SIEMConfig) error

	// General integration operations
	ListIntegrations(ctx context.Context, tenantID int64) ([]entities.Integration, error)
	GetIntegration(ctx context.Context, tenantID int64, integrationType string) (*entities.Integration, error)
	UpdateIntegrationStatus(ctx context.Context, tenantID int64, integrationType, status string) error
}

type SIEMForwarder interface {
	ForwardLogs(ctx context.Context, tenantID int64, logs []entities.AuditLog) error
	TestConnection(ctx context.Context, config *entities.SIEMConfig) error
}