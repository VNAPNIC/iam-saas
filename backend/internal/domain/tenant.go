package domain

import (
	"context"
	"iam-saas/internal/entities"

	"gorm.io/gorm"
)

type TenantRepository interface {
	Create(ctx context.Context, tx *gorm.DB, tenant *entities.Tenant) error
	FindByID(ctx context.Context, id int64) (*entities.Tenant, error)
	FindByKey(ctx context.Context, key string) (*entities.Tenant, error)
	UpdateBranding(ctx context.Context, tenant *entities.Tenant) error
	ListTenants(ctx context.Context) ([]entities.Tenant, error)
	GetTenantDetails(ctx context.Context, tenantID int64) (*entities.Tenant, error)
	SuspendTenant(ctx context.Context, tenantID int64) error
	DeleteTenant(ctx context.Context, tenantID int64) error
}

type TenantService interface {
	CreateTenant(ctx context.Context, name, key string) (*entities.Tenant, error)
	GetTenantConfig(ctx context.Context, tenantKey string) (*entities.Tenant, error)
	UpdateTenantBranding(ctx context.Context, tenantID int64, logoURL, primaryColor *string, allowPublicSignup bool) (*entities.Tenant, error)
	ListTenants(ctx context.Context, tenantID int64) ([]entities.Tenant, error)
	GetTenantDetails(ctx context.Context, tenantID int64) (*entities.Tenant, error)
	SuspendTenant(ctx context.Context, tenantID int64) error
	DeleteTenant(ctx context.Context, tenantID int64) error
}
