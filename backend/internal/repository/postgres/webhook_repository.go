package postgres

import (
	"context"
	"iam-saas/internal/domain"
	"iam-saas/internal/entities"

	"gorm.io/gorm"
)

type webhookRepository struct {
	db *gorm.DB
}

func NewWebhookRepository(db *gorm.DB) domain.WebhookRepository {
	return &webhookRepository{db}
}

func (r *webhookRepository) Create(ctx context.Context, tx *gorm.DB, webhook *entities.Webhook) error {
	db := r.db
	if tx != nil {
		db = tx
	}
	query := `
		INSERT INTO webhooks (tenant_id, url, secret, events, status, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
		RETURNING id, created_at, updated_at;
	`
	row := db.WithContext(ctx).Raw(query, webhook.TenantID, webhook.URL, webhook.Secret, webhook.Events, webhook.Status).Row()
	return row.Scan(&webhook.ID, &webhook.CreatedAt, &webhook.UpdatedAt)
}

func (r *webhookRepository) FindByID(ctx context.Context, id int64) (*entities.Webhook, error) {
	var webhook entities.Webhook
	query := `
		SELECT id, tenant_id, url, secret, events, status, created_at, updated_at
		FROM webhooks
		WHERE id = $1;
	`
	rows, err := r.db.WithContext(ctx).Raw(query, id).Rows()
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	if rows.Next() {
		err := rows.Scan(&webhook.ID, &webhook.TenantID, &webhook.URL, &webhook.Secret, &webhook.Events, &webhook.Status, &webhook.CreatedAt, &webhook.UpdatedAt)
		if err != nil {
			return nil, err
		}
		return &webhook, nil
	}
	return nil, nil
}

func (r *webhookRepository) ListWebhooks(ctx context.Context, tenantID int64) ([]entities.Webhook, error) {
	var webhooks []entities.Webhook
	query := `
		SELECT id, tenant_id, url, events, status, created_at, updated_at
		FROM webhooks
		WHERE tenant_id = $1
		ORDER BY created_at DESC;
	`
	rows, err := r.db.WithContext(ctx).Raw(query, tenantID).Rows()
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	for rows.Next() {
		var webhook entities.Webhook
		err := rows.Scan(&webhook.ID, &webhook.TenantID, &webhook.URL, &webhook.Events, &webhook.Status, &webhook.CreatedAt, &webhook.UpdatedAt)
		if err != nil {
			return nil, err
		}
		webhooks = append(webhooks, webhook)
	}
	return webhooks, nil
}

func (r *webhookRepository) Update(ctx context.Context, webhook *entities.Webhook) error {
	query := `UPDATE webhooks SET url = ?, secret = ?, events = ?, status = ?, updated_at = NOW() WHERE id = ?`
	return r.db.WithContext(ctx).Exec(query, webhook.URL, webhook.Secret, webhook.Events, webhook.Status, webhook.ID).Error
}

func (r *webhookRepository) Delete(ctx context.Context, id int64) error {
	query := `DELETE FROM webhooks WHERE id = ?`
	return r.db.WithContext(ctx).Exec(query, id).Error
}
