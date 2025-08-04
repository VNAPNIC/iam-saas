package postgres

import (
	"context"
	"iam-saas/internal/domain"
	"iam-saas/internal/entities"

	"gorm.io/gorm"
)

type integrationRepository struct {
	db *gorm.DB
}

func NewIntegrationRepository(db *gorm.DB) domain.IntegrationRepository {
	return &integrationRepository{db}
}

func (r *integrationRepository) Create(ctx context.Context, tx *gorm.DB, integration *entities.Integration) error {
	db := r.db
	if tx != nil {
		db = tx
	}
	query := `
		INSERT INTO integrations (tenant_id, type, name, status, config, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
		RETURNING id, created_at, updated_at;
	`
	row := db.WithContext(ctx).Raw(query, integration.TenantID, integration.Type, integration.Name, integration.Status, integration.Config).Row()
	return row.Scan(&integration.ID, &integration.CreatedAt, &integration.UpdatedAt)
}

func (r *integrationRepository) FindByID(ctx context.Context, id int64) (*entities.Integration, error) {
	var integration entities.Integration
	query := `SELECT id, tenant_id, type, name, status, config, created_at, updated_at FROM integrations WHERE id = $1`
	rows, err := r.db.WithContext(ctx).Raw(query, id).Rows()
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	if rows.Next() {
		err := rows.Scan(&integration.ID, &integration.TenantID, &integration.Type, &integration.Name, &integration.Status, &integration.Config, &integration.CreatedAt, &integration.UpdatedAt)
		if err != nil {
			return nil, err
		}
		return &integration, nil
	}

	return nil, gorm.ErrRecordNotFound
}

func (r *integrationRepository) FindByTenantAndType(ctx context.Context, tenantID int64, integrationType string) (*entities.Integration, error) {
	var integration entities.Integration
	query := `SELECT id, tenant_id, type, name, status, config, created_at, updated_at FROM integrations WHERE tenant_id = $1 AND type = $2`
	rows, err := r.db.WithContext(ctx).Raw(query, tenantID, integrationType).Rows()
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	if rows.Next() {
		err := rows.Scan(&integration.ID, &integration.TenantID, &integration.Type, &integration.Name, &integration.Status, &integration.Config, &integration.CreatedAt, &integration.UpdatedAt)
		if err != nil {
			return nil, err
		}
		return &integration, nil
	}

	return nil, gorm.ErrRecordNotFound
}

func (r *integrationRepository) ListByTenant(ctx context.Context, tenantID int64) ([]entities.Integration, error) {
	var integrations []entities.Integration
	query := `SELECT id, tenant_id, type, name, status, config, created_at, updated_at FROM integrations WHERE tenant_id = $1 ORDER BY created_at DESC`
	rows, err := r.db.WithContext(ctx).Raw(query, tenantID).Rows()
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	for rows.Next() {
		var integration entities.Integration
		err := rows.Scan(&integration.ID, &integration.TenantID, &integration.Type, &integration.Name, &integration.Status, &integration.Config, &integration.CreatedAt, &integration.UpdatedAt)
		if err != nil {
			return nil, err
		}
		integrations = append(integrations, integration)
	}

	return integrations, nil
}

func (r *integrationRepository) Update(ctx context.Context, integration *entities.Integration) error {
	query := `UPDATE integrations SET name = $1, status = $2, config = $3, updated_at = NOW() WHERE id = $4`
	return r.db.WithContext(ctx).Exec(query, integration.Name, integration.Status, integration.Config, integration.ID).Error
}

func (r *integrationRepository) Delete(ctx context.Context, id int64) error {
	query := `DELETE FROM integrations WHERE id = $1`
	return r.db.WithContext(ctx).Exec(query, id).Error
}