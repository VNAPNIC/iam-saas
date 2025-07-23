package domain

import (
	"context"
	"iam-saas/internal/entities"

	"gorm.io/gorm"
)

type PlanRepository interface {
	Create(ctx context.Context, tx *gorm.DB, plan *entities.Plan) error
	FindByID(ctx context.Context, id int64) (*entities.Plan, error)
	FindByName(ctx context.Context, name string) (*entities.Plan, error)
	ListPlans(ctx context.Context) ([]entities.Plan, error)
	Update(ctx context.Context, plan *entities.Plan) error
	Delete(ctx context.Context, id int64) error
}

type PlanService interface {
	CreatePlan(ctx context.Context, name string, price float64, userLimit, apiLimit int, status string) (*entities.Plan, error)
	GetPlan(ctx context.Context, id int64) (*entities.Plan, error)
	ListPlans(ctx context.Context) ([]entities.Plan, error)
	UpdatePlan(ctx context.Context, id int64, name string, price float64, userLimit, apiLimit int, status string) (*entities.Plan, error)
	DeletePlan(ctx context.Context, id int64) error
}
