package postgres

import (
	"context"
	"iam-saas/internal/domain"
	"iam-saas/internal/entities"

	"gorm.io/gorm"
)

type tenantRepository struct {
	db *gorm.DB
}

func NewtenantRepository(db *gorm.DB) domain.TenantRepository {
	return &tenantRepository{db}
}

func (r *tenantRepository) Create(ctx context.Context, tx *gorm.DB, tenant *entities.Tenant) error {
	db := r.db
	if tx != nil {
		db = tx
	}
	return db.WithContext(ctx).Create(tenant).Error
}

func (r *tenantRepository) FindByID(ctx context.Context, id int64) (*entities.Tenant, error) {
	var tenant entities.Tenant
	query := `
		SELECT id, plan_id, name, status, logo_url, primary_color, allow_public_signup, key, is_onboarded, created_at, updated_at
		FROM tenants
		WHERE id = $1;
	`
	rows, err := r.db.WithContext(ctx).Raw(query, id).Rows()
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	if rows.Next() {
		err := rows.Scan(&tenant.ID, &tenant.PlanID, &tenant.Name, &tenant.Status, &tenant.LogoURL, &tenant.PrimaryColor, &tenant.AllowPublicSignup, &tenant.Key, &tenant.IsOnboarded, &tenant.CreatedAt, &tenant.UpdatedAt)
		if err != nil {
			return nil, err
		}
		return &tenant, nil
	}
	return nil, nil
}

func (r *tenantRepository) FindByKey(ctx context.Context, key string) (*entities.Tenant, error) {
	var tenant entities.Tenant
	query := `
		SELECT id, plan_id, name, status, logo_url, primary_color, allow_public_signup, key, is_onboarded, created_at, updated_at
		FROM tenants
		WHERE key = $1;
	`
	rows, err := r.db.WithContext(ctx).Raw(query, key).Rows()
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	if rows.Next() {
		err := rows.Scan(&tenant.ID, &tenant.PlanID, &tenant.Name, &tenant.Status, &tenant.LogoURL, &tenant.PrimaryColor, &tenant.AllowPublicSignup, &tenant.Key, &tenant.IsOnboarded, &tenant.CreatedAt, &tenant.UpdatedAt)
		if err != nil {
			return nil, err
		}
		return &tenant, nil
	}
	return nil, nil
}

func (r *tenantRepository) UpdateBranding(ctx context.Context, tenant *entities.Tenant) error {
	query := `UPDATE tenants SET logo_url = ?, primary_color = ?, allow_public_signup = ?, is_onboarded = ?, updated_at = NOW() WHERE id = ?`
	return r.db.WithContext(ctx).Exec(query, tenant.LogoURL, tenant.PrimaryColor, tenant.AllowPublicSignup, tenant.IsOnboarded, tenant.ID).Error
}

func (r *tenantRepository) ListTenants(ctx context.Context) ([]entities.Tenant, error) {
	var tenants []entities.Tenant
	query := `
		SELECT id, plan_id, name, status, logo_url, primary_color, allow_public_signup, key, is_onboarded, created_at, updated_at
		FROM tenants
		ORDER BY name ASC;
	`
	rows, err := r.db.WithContext(ctx).Raw(query).Rows()
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	for rows.Next() {
		var tenant entities.Tenant
		err := rows.Scan(&tenant.ID, &tenant.PlanID, &tenant.Name, &tenant.Status, &tenant.LogoURL, &tenant.PrimaryColor, &tenant.AllowPublicSignup, &tenant.Key, &tenant.IsOnboarded, &tenant.CreatedAt, &tenant.UpdatedAt)
		if err != nil {
			return nil, err
		}
		tenants = append(tenants, tenant)
	}
	return tenants, nil
}

func (r *tenantRepository) GetTenantDetails(ctx context.Context, tenantID int64) (*entities.Tenant, error) {
	var tenant entities.Tenant
	query := `
		SELECT id, plan_id, name, status, logo_url, primary_color, allow_public_signup, key, is_onboarded, created_at, updated_at
		FROM tenants
		WHERE id = $1;
	`
	rows, err := r.db.WithContext(ctx).Raw(query, tenantID).Rows()
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	if rows.Next() {
		err := rows.Scan(&tenant.ID, &tenant.PlanID, &tenant.Name, &tenant.Status, &tenant.LogoURL, &tenant.PrimaryColor, &tenant.AllowPublicSignup, &tenant.Key, &tenant.IsOnboarded, &tenant.CreatedAt, &tenant.UpdatedAt)
		if err != nil {
			return nil, err
		}
		return &tenant, nil
	}
	return nil, nil
}

func (r *tenantRepository) SuspendTenant(ctx context.Context, tenantID int64) error {
	query := `UPDATE tenants SET status = 'suspended', updated_at = NOW() WHERE id = ?`
	return r.db.WithContext(ctx).Exec(query, tenantID).Error
}

func (r *tenantRepository) DeleteTenant(ctx context.Context, tenantID int64) error {
	query := `DELETE FROM tenants WHERE id = ?`
	return r.db.WithContext(ctx).Exec(query, tenantID).Error
}