package service

import (
	"context"
	"iam-saas/internal/domain"
	"iam-saas/internal/entities"
	"iam-saas/pkg/app_error"
	"iam-saas/pkg/i18n"

	"gorm.io/gorm"
)

type tenantService struct {
	db         *gorm.DB
	tenantRepo domain.TenantRepository
}

func NewTenantService(db *gorm.DB, tenantRepo domain.TenantRepository) domain.TenantService {
	return &tenantService{db, tenantRepo}
}

func (s *tenantService) CreateTenant(ctx context.Context, name, key string) (*entities.Tenant, error) {
	// Check if a tenant with the given key already exists
	existingTenant, err := s.tenantRepo.FindByKey(ctx, key)
	if err != nil {
		return nil, app_error.NewInternalServerError(err)
	}
	if existingTenant != nil {
		return nil, app_error.NewConflictError("key", string(i18n.TenantKeyAlreadyExists))
	}

	newTenant := &entities.Tenant{
		Name:   name,
		Key:    key,
		Status: "active", // New tenants are active by default
	}

	if err := s.tenantRepo.Create(ctx, nil, newTenant); err != nil {
		return nil, app_error.NewInternalServerError(err)
	}

	return newTenant, nil
}

func (s *tenantService) GetTenantConfig(ctx context.Context, tenantKey string) (*entities.Tenant, error) {
	tenant, err := s.tenantRepo.FindByKey(ctx, tenantKey)
	if err != nil {
		return nil, app_error.NewInternalServerError(err)
	}
	if tenant == nil {
		return nil, app_error.NewNotFoundError(string(i18n.TenantNotFound))
	}
	return tenant, nil
}

func (s *tenantService) UpdateTenantBranding(ctx context.Context, tenantID int64, logoURL, primaryColor *string, allowPublicSignup bool) (*entities.Tenant, error) {
	tenant, err := s.tenantRepo.FindByID(ctx, tenantID)
	if err != nil {
		return nil, app_error.NewInternalServerError(err)
	}
	if tenant == nil {
		return nil, app_error.NewNotFoundError(string(i18n.TenantNotFound))
	}

	tenant.LogoURL = logoURL
	tenant.PrimaryColor = primaryColor
	tenant.AllowPublicSignup = allowPublicSignup
	tenant.IsOnboarded = true // Mark as onboarded after branding update

	if err := s.tenantRepo.UpdateBranding(ctx, tenant); err != nil {
		return nil, app_error.NewInternalServerError(err)
	}

	return tenant, nil
}

func (s *tenantService) ListTenants(ctx context.Context) ([]entities.Tenant, error) {
	return s.tenantRepo.ListTenants(ctx)
}

func (s *tenantService) GetTenantDetails(ctx context.Context, tenantID int64) (*entities.Tenant, error) {
	return s.tenantRepo.GetTenantDetails(ctx, tenantID)
}

func (s *tenantService) SuspendTenant(ctx context.Context, tenantID int64) error {
	return s.tenantRepo.SuspendTenant(ctx, tenantID)
}

func (s *tenantService) DeleteTenant(ctx context.Context, tenantID int64) error {
	return s.tenantRepo.DeleteTenant(ctx, tenantID)
}
