package postgres

import (
	"context"
	"iam-saas/internal/domain"
	"iam-saas/internal/entities"

	"gorm.io/gorm"
)

type ssoRepository struct {
	db *gorm.DB
}

func NewSsoRepository(db *gorm.DB) domain.SsoRepository {
	return &ssoRepository{db}
}

func (r *ssoRepository) Create(ctx context.Context, tx *gorm.DB, ssoConfig *entities.SsoConfig) error {
	db := r.db
	if tx != nil {
		db = tx
	}
	return db.WithContext(ctx).Create(ssoConfig).Error
}

func (r *ssoRepository) FindByTenantID(ctx context.Context, tenantID int64) (*entities.SsoConfig, error) {
	var ssoConfig entities.SsoConfig
	query := `
		SELECT id, tenant_id, provider, metadata_url, client_id, client_secret, status, created_at, updated_at
		FROM sso_configs
		WHERE tenant_id = $1;
	`
	rows, err := r.db.WithContext(ctx).Raw(query, tenantID).Rows()
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	if rows.Next() {
		err := rows.Scan(&ssoConfig.ID, &ssoConfig.TenantID, &ssoConfig.Provider, &ssoConfig.MetadataURL, &ssoConfig.ClientID, &ssoConfig.ClientSecret, &ssoConfig.Status, &ssoConfig.CreatedAt, &ssoConfig.UpdatedAt)
		if err != nil {
			return nil, err
		}
		return &ssoConfig, nil
	}
	return nil, nil
}

func (r *ssoRepository) Update(ctx context.Context, ssoConfig *entities.SsoConfig) error {
	query := `UPDATE sso_configs SET provider = ?, metadata_url = ?, client_id = ?, client_secret = ?, status = ?, updated_at = NOW() WHERE id = ?`
	return r.db.WithContext(ctx).Exec(query, ssoConfig.Provider, ssoConfig.MetadataURL, ssoConfig.ClientID, ssoConfig.ClientSecret, ssoConfig.Status, ssoConfig.ID).Error
}

func (r *ssoRepository) Delete(ctx context.Context, tenantID int64) error {
	query := `DELETE FROM sso_configs WHERE tenant_id = ?`
	return r.db.WithContext(ctx).Exec(query, tenantID).Error
}
