package domain

import (
	"context"
	"iam-saas/internal/entities"
	"time"

	"gorm.io/gorm"
)

type SubscriptionRepository interface {
	Create(ctx context.Context, tx *gorm.DB, subscription *entities.Subscription) error
	FindByTenantID(ctx context.Context, tenantID int64) (*entities.Subscription, error)
	Update(ctx context.Context, subscription *entities.Subscription) error
}

type SubscriptionService interface {
	CreateSubscription(ctx context.Context, tenantID, planID int64, stripeCustomerID, stripeSubscriptionID, status string, currentPeriodEnd time.Time) (*entities.Subscription, error)
	GetSubscriptionByTenantID(ctx context.Context, tenantID int64) (*entities.Subscription, error)
	UpdateSubscriptionStatus(ctx context.Context, tenantID int64, status string) (*entities.Subscription, error)
}
