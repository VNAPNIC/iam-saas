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

func NewTenantRepository(db *gorm.DB) domain.TenantRepository {
	return &tenantRepository{db}
}

func (r *tenantRepository) Create(ctx context.Context, tx *gorm.DB, tenant *entities.Tenant) error {
	db := r.db
	if tx != nil {
		db = tx
	}

	query := `
		INSERT INTO tenants (plan_id, domain, domain_verified, name, status, user_quota, logo_url, primary_color, allow_public_signup, is_onboarded, email_provider, email_config, password_policy, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, NOW(), NOW())
		RETURNING id`

	var id int64
	row := db.WithContext(ctx).Raw(query, tenant.PlanID, tenant.Domain, tenant.DomainVerified,
		tenant.Name, tenant.Status, tenant.UserQuota, tenant.LogoURL, tenant.PrimaryColor, 
		tenant.AllowPublicSignup, tenant.IsOnboarded, tenant.EmailProvider, tenant.EmailConfig, 
		tenant.PasswordPolicy).Row()

	if err := row.Scan(&id); err != nil {
		return err
	}

	tenant.ID = id
	return nil
}

func (r *tenantRepository) FindByID(ctx context.Context, id int64) (*entities.Tenant, error) {
	query := `
		SELECT id, plan_id, key, domain, domain_verified, name, status, user_quota, logo_url, primary_color, allow_public_signup, is_onboarded, created_at, updated_at
		FROM tenants
		WHERE id = $1`

	tenant := &entities.Tenant{}
	row := r.db.WithContext(ctx).Raw(query, id).Row()

	err := row.Scan(&tenant.ID, &tenant.PlanID, &tenant.Key, &tenant.Domain, &tenant.DomainVerified, &tenant.Name, &tenant.Status, &tenant.UserQuota,
		&tenant.LogoURL, &tenant.PrimaryColor, &tenant.AllowPublicSignup, &tenant.IsOnboarded, &tenant.CreatedAt, &tenant.UpdatedAt)

	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, nil
		}
		return nil, err
	}

	// Set default values for missing fields
	tenant.EmailProvider = "console"
	tenant.EmailConfig = make(map[string]interface{})
	tenant.PasswordPolicy = make(map[string]interface{})

	return tenant, nil
}

func (r *tenantRepository) FindByDomain(ctx context.Context, domain string) (*entities.Tenant, error) {
	query := `
		SELECT id, plan_id, key, domain, domain_verified, name, status, user_quota, logo_url, primary_color, allow_public_signup, is_onboarded, created_at, updated_at
		FROM tenants
		WHERE domain = $1`

	tenant := &entities.Tenant{}
	row := r.db.WithContext(ctx).Raw(query, domain).Row()

	err := row.Scan(&tenant.ID, &tenant.PlanID, &tenant.Key, &tenant.Domain, &tenant.DomainVerified, &tenant.Name, &tenant.Status, &tenant.UserQuota,
		&tenant.LogoURL, &tenant.PrimaryColor, &tenant.AllowPublicSignup, &tenant.IsOnboarded, &tenant.CreatedAt, &tenant.UpdatedAt)

	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, nil
		}
		return nil, err
	}

	// Set default values for missing fields
	tenant.EmailProvider = "console"
	tenant.EmailConfig = make(map[string]interface{})
	tenant.PasswordPolicy = make(map[string]interface{})

	return tenant, nil
}

func (r *tenantRepository) FindByKey(ctx context.Context, key string) (*entities.Tenant, error) {
	query := `
		SELECT id, plan_id, key, domain, domain_verified, name, status, user_quota, logo_url, primary_color, allow_public_signup, is_onboarded, created_at, updated_at
		FROM tenants
		WHERE key = $1`

	tenant := &entities.Tenant{}
	row := r.db.WithContext(ctx).Raw(query, key).Row()

	err := row.Scan(&tenant.ID, &tenant.PlanID, &tenant.Key, &tenant.Domain, &tenant.DomainVerified, &tenant.Name, &tenant.Status, &tenant.UserQuota,
		&tenant.LogoURL, &tenant.PrimaryColor, &tenant.AllowPublicSignup, &tenant.IsOnboarded, &tenant.CreatedAt, &tenant.UpdatedAt)

	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, nil
		}
		return nil, err
	}

	// Set default values for missing fields
	tenant.EmailProvider = "console"
	tenant.EmailConfig = make(map[string]interface{})
	tenant.PasswordPolicy = make(map[string]interface{})

	return tenant, nil
}

func (r *tenantRepository) Update(ctx context.Context, tenant *entities.Tenant) error {
	query := `
		UPDATE tenants
		SET plan_id = $1, domain = $2, domain_verified = $3, name = $4, status = $5, user_quota = $6, logo_url = $7, primary_color = $8,
		    allow_public_signup = $9, is_onboarded = $10, updated_at = NOW()
		WHERE id = $11`

	return r.db.WithContext(ctx).Exec(query, tenant.PlanID, tenant.Domain, tenant.DomainVerified, tenant.Name, tenant.Status, tenant.UserQuota,
		tenant.LogoURL, tenant.PrimaryColor, tenant.AllowPublicSignup, tenant.IsOnboarded, tenant.ID).Error
}

func (r *tenantRepository) UpdateBranding(ctx context.Context, tenant *entities.Tenant) error {
	query := `
		UPDATE tenants
		SET logo_url = $1, primary_color = $2, allow_public_signup = $3, is_onboarded = $4, updated_at = NOW()
		WHERE id = $5`

	return r.db.WithContext(ctx).Exec(query, tenant.LogoURL, tenant.PrimaryColor, tenant.AllowPublicSignup, tenant.IsOnboarded, tenant.ID).Error
}

func (r *tenantRepository) UpdateEmailSettings(ctx context.Context, tenant *entities.Tenant) error {
	query := `UPDATE tenants SET email_provider = $1, email_config = $2, updated_at = NOW() WHERE id = $3`
	return r.db.WithContext(ctx).Exec(query, tenant.EmailProvider, tenant.EmailConfig, tenant.ID).Error
}

// UpdatePasswordPolicy updates the password policy for a tenant
func (r *tenantRepository) UpdatePasswordPolicy(ctx context.Context, tenant *entities.Tenant) error {
	query := `UPDATE tenants SET password_policy = $1, updated_at = NOW() WHERE id = $2`
	return r.db.WithContext(ctx).Exec(query, tenant.PasswordPolicy, tenant.ID).Error
}

// UpdateDomain updates the domain and domain verification status for a tenant
func (r *tenantRepository) UpdateDomain(ctx context.Context, tenant *entities.Tenant) error {
	query := `UPDATE tenants SET domain = $1, domain_verified = $2, updated_at = NOW() WHERE id = $3`
	return r.db.WithContext(ctx).Exec(query, tenant.Domain, tenant.DomainVerified, tenant.ID).Error
}

// VerifyDomain sets the domain as verified for a tenant
func (r *tenantRepository) VerifyDomain(ctx context.Context, tenantID int64) error {
	query := `UPDATE tenants SET domain_verified = TRUE, updated_at = NOW() WHERE id = $1`
	return r.db.WithContext(ctx).Exec(query, tenantID).Error
}

func (r *tenantRepository) Delete(ctx context.Context, id int64) error {
	query := `DELETE FROM tenants WHERE id = $1`
	return r.db.WithContext(ctx).Exec(query, id).Error
}

func (r *tenantRepository) ListTenants(ctx context.Context) ([]entities.Tenant, error) {
	query := `
		SELECT id, plan_id, key, domain, domain_verified, name, status, user_quota, logo_url, primary_color, allow_public_signup, is_onboarded, created_at, updated_at
		FROM tenants
		ORDER BY created_at DESC`

	rows, err := r.db.WithContext(ctx).Raw(query).Rows()
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var tenants []entities.Tenant
	for rows.Next() {
		var tenant entities.Tenant
		err := rows.Scan(&tenant.ID, &tenant.PlanID, &tenant.Key, &tenant.Domain, &tenant.DomainVerified, &tenant.Name, &tenant.Status, &tenant.UserQuota,
			&tenant.LogoURL, &tenant.PrimaryColor, &tenant.AllowPublicSignup, &tenant.IsOnboarded, &tenant.CreatedAt, &tenant.UpdatedAt)
		if err != nil {
			return nil, err
		}
		
		// Set default values for missing fields
		tenant.EmailProvider = "console"
		tenant.EmailConfig = make(map[string]interface{})
		tenant.PasswordPolicy = make(map[string]interface{})
		
		tenants = append(tenants, tenant)
	}

	return tenants, nil
}

func (r *tenantRepository) UpdateTenantName(ctx context.Context, id int64, name string) (*entities.Tenant, error) {
	query := `UPDATE tenants SET name = $1, updated_at = NOW() WHERE id = $2 RETURNING id, plan_id, key, domain, domain_verified, name, status, user_quota, logo_url, primary_color, allow_public_signup, is_onboarded, created_at, updated_at`

	tenant := &entities.Tenant{}
	row := r.db.WithContext(ctx).Raw(query, name, id).Row()

	err := row.Scan(&tenant.ID, &tenant.PlanID, &tenant.Key, &tenant.Domain, &tenant.DomainVerified, &tenant.Name, &tenant.Status, &tenant.UserQuota,
		&tenant.LogoURL, &tenant.PrimaryColor, &tenant.AllowPublicSignup, &tenant.IsOnboarded, &tenant.CreatedAt, &tenant.UpdatedAt)

	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, nil
		}
		return nil, err
	}

	// Set default values for missing fields
	tenant.EmailProvider = "console"
	tenant.EmailConfig = make(map[string]interface{})
	tenant.PasswordPolicy = make(map[string]interface{})

	return tenant, nil
}

func (r *tenantRepository) SuspendTenant(ctx context.Context, id int64) error {
	query := `UPDATE tenants SET status = 'suspended', updated_at = NOW() WHERE id = $1`
	return r.db.WithContext(ctx).Exec(query, id).Error
}