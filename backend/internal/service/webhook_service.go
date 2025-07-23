package service

import (
	"context"
	"iam-saas/internal/domain"
	"iam-saas/internal/entities"
	"iam-saas/pkg/app_error"
	"iam-saas/pkg/utils"

	"gorm.io/gorm"
)

type webhookService struct {
	db          *gorm.DB
	webhookRepo domain.WebhookRepository
}

func NewWebhookService(db *gorm.DB, webhookRepo domain.WebhookRepository) domain.WebhookService {
	return &webhookService{db, webhookRepo}
}

func (s *webhookService) CreateWebhook(ctx context.Context, tenantID int64, url, secret string, events []string, status string) (*entities.Webhook, error) {
	if secret == "" {
		generatedSecret, err := utils.GenerateRandomString(32)
		if err != nil {
			return nil, app_error.NewInternalServerError(err)
		}
		secret = generatedSecret
	}

	hashedSecret, err := utils.HashPassword(secret)
	if err != nil {
		return nil, app_error.NewInternalServerError(err)
	}

	newWebhook := &entities.Webhook{
		TenantID: tenantID,
		URL:      url,
		Secret:   hashedSecret,
		Events:   events,
		Status:   status,
	}

	if err := s.webhookRepo.Create(ctx, nil, newWebhook); err != nil {
		return nil, app_error.NewInternalServerError(err)
	}

	return newWebhook, nil
}

func (s *webhookService) GetWebhook(ctx context.Context, id int64) (*entities.Webhook, error) {
	webhook, err := s.webhookRepo.FindByID(ctx, id)
	if err != nil {
		return nil, app_error.NewInternalServerError(err)
	}
	if webhook == nil {
		return nil, app_error.NewNotFoundError("Webhook not found")
	}
	return webhook, nil
}

func (s *webhookService) ListWebhooks(ctx context.Context, tenantID int64) ([]entities.Webhook, error) {
	return s.webhookRepo.ListWebhooks(ctx, tenantID)
}

func (s *webhookService) UpdateWebhook(ctx context.Context, id int64, url, secret string, events []string, status string) (*entities.Webhook, error) {
	webhook, err := s.webhookRepo.FindByID(ctx, id)
	if err != nil {
		return nil, app_error.NewInternalServerError(err)
	}
	if webhook == nil {
		return nil, app_error.NewNotFoundError("Webhook not found")
	}

	hashedSecret := webhook.Secret
	if secret != "" {
		hashedSecret, err = utils.HashPassword(secret)
		if err != nil {
			return nil, app_error.NewInternalServerError(err)
		}
	}

	webhook.URL = url
	webhook.Secret = hashedSecret
	webhook.Events = events
	webhook.Status = status

	if err := s.webhookRepo.Update(ctx, webhook); err != nil {
		return nil, app_error.NewInternalServerError(err)
	}

	return webhook, nil
}

func (s *webhookService) DeleteWebhook(ctx context.Context, id int64) error {
	return s.webhookRepo.Delete(ctx, id)
}
