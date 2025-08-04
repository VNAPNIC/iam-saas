package domain

import (
	"context"
	"iam-saas/internal/entities"
	"gorm.io/gorm"
)

// TenantRepository defines the contract for the Tenant repository layer.
type TenantRepository interface {
	Create(ctx context.Context, tx *gorm.DB, tenant *entities.Tenant) error
	FindByID(ctx context.Context, id int64) (*entities.Tenant, error)
	FindByDomain(ctx context.Context, domain string) (*entities.Tenant, error)
	FindByKey(ctx context.Context, key string) (*entities.Tenant, error)
	Update(ctx context.Context, tenant *entities.Tenant) error
	UpdateBranding(ctx context.Context, tenant *entities.Tenant) error
	UpdateEmailSettings(ctx context.Context, tenant *entities.Tenant) error
	UpdatePasswordPolicy(ctx context.Context, tenant *entities.Tenant) error
	UpdateDomain(ctx context.Context, tenant *entities.Tenant) error
	VerifyDomain(ctx context.Context, tenantID int64) error
	Delete(ctx context.Context, id int64) error
	ListTenants(ctx context.Context) ([]entities.Tenant, error)
	UpdateTenantName(ctx context.Context, id int64, name string) (*entities.Tenant, error)
	SuspendTenant(ctx context.Context, id int64) error
}

// TenantService defines the contract for the Tenant service layer.
type TenantService interface {
	CreateTenant(ctx context.Context, name, domain string) (*entities.Tenant, error)
	GetTenantConfig(ctx context.Context, keyOrDomain string) (*entities.Tenant, error)
	GetTenantDetails(ctx context.Context, tenantID int64) (*entities.Tenant, error)
	UpdateTenantBranding(ctx context.Context, tenantID int64, logoURL, primaryColor *string, allowPublicSignup bool) (*entities.Tenant, error)
	UpdateTenantName(ctx context.Context, tenantID int64, name string) (*entities.Tenant, error)
	ListTenants(ctx context.Context) ([]entities.Tenant, error)
	SuspendTenant(ctx context.Context, tenantID int64) error
	DeleteTenant(ctx context.Context, tenantID int64) error
	UpdateEmailSettings(ctx context.Context, tenantID int64, provider string, config map[string]interface{}) (*entities.Tenant, error)
	UpdatePasswordPolicy(ctx context.Context, tenantID int64, policy map[string]interface{}) (*entities.Tenant, error)
	UpdateDomain(ctx context.Context, tenantID int64, domain string) (*entities.Tenant, error)
	VerifyDomain(ctx context.Context, tenantID int64, verificationMethod string) (*entities.Tenant, error)
	UpdateTenant(ctx context.Context, tenantID int64, name *string, logoURL, primaryColor *string, allowPublicSignup *bool) (*entities.Tenant, error)
	CompleteOnboarding(ctx context.Context, tenantID int64) error
}
