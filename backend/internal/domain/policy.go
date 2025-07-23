package domain

import (
	"context"
	"iam-saas/internal/entities"

	"gorm.io/gorm"
)

type PolicyRepository interface {
	Create(ctx context.Context, tx *gorm.DB, policy *entities.Policy) error
	FindByID(ctx context.Context, id int64) (*entities.Policy, error)
	ListPolicies(ctx context.Context, tenantID int64) ([]entities.Policy, error)
	Update(ctx context.Context, policy *entities.Policy) error
	Delete(ctx context.Context, id int64) error
}

type PolicyService interface {
	CreatePolicy(ctx context.Context, tenantID int64, name, target, condition, status string) (*entities.Policy, error)
	GetPolicy(ctx context.Context, id int64) (*entities.Policy, error)
	ListPolicies(ctx context.Context, tenantID int64) ([]entities.Policy, error)
	UpdatePolicy(ctx context.Context, id int64, name, target, condition, status string) (*entities.Policy, error)
	DeletePolicy(ctx context.Context, id int64) error
	SimulatePolicy(ctx context.Context, tenantID int64, userEmail, actionKey, contextIP, contextTime string) (string, string, error)
}
