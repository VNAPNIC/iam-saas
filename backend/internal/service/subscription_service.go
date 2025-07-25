package service

import (
	"context"
	"iam-saas/internal/domain"
	"iam-saas/internal/entities"
	"iam-saas/pkg/app_error"
	"time"

	"gorm.io/gorm"
)

type subscriptionService struct {
	db               *gorm.DB
	subscriptionRepo domain.SubscriptionRepository
}

func NewSubscriptionService(db *gorm.DB, subscriptionRepo domain.SubscriptionRepository) domain.SubscriptionService {
	return &subscriptionService{db, subscriptionRepo}
}

func (s *subscriptionService) CreateSubscription(ctx context.Context, tenantID, planID int64, stripeCustomerID, stripeSubscriptionID, status string, currentPeriodEnd time.Time) (*entities.Subscription, error) {
	subscription := &entities.Subscription{
		TenantID:             tenantID,
		PlanID:               planID,
		StripeCustomerID:     stripeCustomerID,
		StripeSubscriptionID: stripeSubscriptionID,
		Status:               status,
		CurrentPeriodEnd:     currentPeriodEnd,
	}

	if err := s.subscriptionRepo.Create(ctx, nil, subscription); err != nil {
		return nil, app_error.NewInternalServerError(err)
	}
	return subscription, nil
}

func (s *subscriptionService) GetSubscriptionByTenantID(ctx context.Context, tenantID int64) (*entities.Subscription, error) {
	subscription, err := s.subscriptionRepo.FindByTenantID(ctx, tenantID)
	if err != nil {
		return nil, app_error.NewInternalServerError(err)
	}
	if subscription == nil {
		return nil, app_error.NewNotFoundError("subscription not found")
	}
	return subscription, nil
}

func (s *subscriptionService) UpdateSubscriptionStatus(ctx context.Context, tenantID int64, status string) (*entities.Subscription, error) {
	subscription, err := s.subscriptionRepo.FindByTenantID(ctx, tenantID)
	if err != nil {
		return nil, app_error.NewInternalServerError(err)
	}
	if subscription == nil {
		return nil, app_error.NewNotFoundError("subscription not found")
	}

	subscription.Status = status
	if err := s.subscriptionRepo.Update(ctx, subscription); err != nil {
		return nil, app_error.NewInternalServerError(err)
	}
	return subscription, nil
}
