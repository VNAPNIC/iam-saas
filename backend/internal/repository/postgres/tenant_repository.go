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

	query := `
		INSERT INTO "tenants" (name, status, allow_public_signup, created_at, updated_at)
		VALUES ($1, $2, $3, NOW(), NOW())
		RETURNING id, status, allow_public_signup, created_at, updated_at;
	`
	row := db.WithContext(ctx).Raw(query, tenant.Name, "pending_verification", false).Row()
	return row.Scan(&tenant.ID, &tenant.Status, &tenant.AllowPublicSignup, &tenant.CreatedAt, &tenant.UpdatedAt)
}

func (r *tenantRepository) FindByID(ctx context.Context, id int64) (*entities.Tenant, error) {
	var tenant entities.Tenant
	query := `
		SELECT id, plan_id, name, status, logo_url, primary_color, allow_public_signup, created_at, updated_at
		FROM "tenants"
		WHERE id = $1;
	`
	result := r.db.WithContext(ctx).Raw(query, id).First(&tenant)
	if result.Error != nil {
		if result.Error == gorm.ErrRecordNotFound {
			return nil, nil
		}
		return nil, result.Error
	}
	return &tenant, nil
}

func (r *tenantRepository) UpdateBranding(ctx context.Context, tenant *entities.Tenant) error {
	query := `UPDATE "tenants" SET logo_url = $1, primary_color = $2, updated_at = now() WHERE id = $3`
	result := r.db.WithContext(ctx).Exec(query, tenant.LogoURL, tenant.PrimaryColor, tenant.ID)
	return result.Error
}
