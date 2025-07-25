package service

import (
	"context"
	"iam-saas/internal/domain"
	"iam-saas/internal/entities"
	"iam-saas/pkg/app_error"

	"gorm.io/gorm"
)

type planService struct {
	db       *gorm.DB
	planRepo domain.PlanRepository
}

func NewPlanService(db *gorm.DB, planRepo domain.PlanRepository) domain.PlanService {
	return &planService{db, planRepo}
}

func (s *planService) CreatePlan(ctx context.Context, name string, price float64, userLimit, apiLimit int, status string) (*entities.Plan, error) {
	existingPlan, err := s.planRepo.FindByName(ctx, name)
	if err != nil {
		return nil, app_error.NewInternalServerError(err)
	}
	if existingPlan != nil {
		return nil, app_error.NewConflictError("name", "Plan with this name already exists")
	}

	newPlan := &entities.Plan{
		Name:      name,
		Price:     price,
		UserQuota: userLimit,
		APIQuota:  apiLimit,
		Status:    status,
	}

	if err := s.planRepo.Create(ctx, nil, newPlan); err != nil {
		return nil, app_error.NewInternalServerError(err)
	}

	return newPlan, nil
}

func (s *planService) GetPlan(ctx context.Context, id int64) (*entities.Plan, error) {
	plan, err := s.planRepo.FindByID(ctx, id)
	if err != nil {
		return nil, app_error.NewInternalServerError(err)
	}
	if plan == nil {
		return nil, app_error.NewNotFoundError("Plan not found")
	}
	return plan, nil
}

func (s *planService) ListPlans(ctx context.Context) ([]entities.Plan, error) {
	return s.planRepo.ListPlans(ctx)
}

func (s *planService) UpdatePlan(ctx context.Context, id int64, name string, price float64, userLimit, apiLimit int, status string) (*entities.Plan, error) {
	plan, err := s.planRepo.FindByID(ctx, id)
	if err != nil {
		return nil, app_error.NewInternalServerError(err)
	}
	if plan == nil {
		return nil, app_error.NewNotFoundError("Plan not found")
	}

	// Check if name is being changed to an existing name (excluding itself)
	if name != plan.Name {
		existingPlan, err := s.planRepo.FindByName(ctx, name)
		if err != nil {
			return nil, app_error.NewInternalServerError(err)
		}
		if existingPlan != nil {
			return nil, app_error.NewConflictError("name", "Plan with this name already exists")
		}
	}

	plan.Name = name
	plan.Price = price
	plan.UserQuota = userLimit
	plan.APIQuota = apiLimit
	plan.Status = status

	if err := s.planRepo.Update(ctx, plan); err != nil {
		return nil, app_error.NewInternalServerError(err)
	}

	return plan, nil
}

func (s *planService) DeletePlan(ctx context.Context, id int64) error {
	return s.planRepo.Delete(ctx, id)
}
