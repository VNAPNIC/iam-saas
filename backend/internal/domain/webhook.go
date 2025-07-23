package domain

import (
	"context"
	"iam-saas/internal/entities"

	"gorm.io/gorm"
)

type WebhookRepository interface {
	Create(ctx context.Context, tx *gorm.DB, webhook *entities.Webhook) error
	FindByID(ctx context.Context, id int64) (*entities.Webhook, error)
	ListWebhooks(ctx context.Context, tenantID int64) ([]entities.Webhook, error)
	Update(ctx context.Context, webhook *entities.Webhook) error
	Delete(ctx context.Context, id int64) error
}

type WebhookService interface {
	CreateWebhook(ctx context.Context, tenantID int64, url, secret string, events []string, status string) (*entities.Webhook, error)
	GetWebhook(ctx context.Context, id int64) (*entities.Webhook, error)
	ListWebhooks(ctx context.Context, tenantID int64) ([]entities.Webhook, error)
	UpdateWebhook(ctx context.Context, id int64, url, secret string, events []string, status string) (*entities.Webhook, error)
	DeleteWebhook(ctx context.Context, id int64) error
}
