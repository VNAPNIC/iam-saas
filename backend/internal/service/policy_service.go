package service

import (
	"context"
	"iam-saas/internal/domain"
	"iam-saas/internal/entities"
	"iam-saas/pkg/app_error"

	"gorm.io/gorm"
)

type policyService struct {
	db         *gorm.DB
	policyRepo domain.PolicyRepository
}

func NewPolicyService(db *gorm.DB, policyRepo domain.PolicyRepository) domain.PolicyService {
	return &policyService{db, policyRepo}
}

func (s *policyService) CreatePolicy(ctx context.Context, tenantID int64, name, target, condition, status string) (*entities.Policy, error) {
	newPolicy := &entities.Policy{
		TenantID:  tenantID,
		Name:      name,
		Target:    target,
		Condition: condition,
		Status:    status,
	}

	if err := s.policyRepo.Create(ctx, nil, newPolicy); err != nil {
		return nil, app_error.NewInternalServerError(err)
	}

	return newPolicy, nil
}

func (s *policyService) GetPolicy(ctx context.Context, id int64) (*entities.Policy, error) {
	policy, err := s.policyRepo.FindByID(ctx, id)
	if err != nil {
		return nil, app_error.NewInternalServerError(err)
	}
	if policy == nil {
		return nil, app_error.NewNotFoundError("Policy not found")
	}
	return policy, nil
}

func (s *policyService) ListPolicies(ctx context.Context, tenantID int64) ([]entities.Policy, error) {
	return s.policyRepo.ListPolicies(ctx, tenantID)
}

func (s *policyService) UpdatePolicy(ctx context.Context, id int64, name, target, condition, status string) (*entities.Policy, error) {
	policy, err := s.policyRepo.FindByID(ctx, id)
	if err != nil {
		return nil, app_error.NewInternalServerError(err)
	}
	if policy == nil {
		return nil, app_error.NewNotFoundError("Policy not found")
	}

	policy.Name = name
	policy.Target = target
	policy.Condition = condition
	policy.Status = status

	if err := s.policyRepo.Update(ctx, policy); err != nil {
		return nil, app_error.NewInternalServerError(err)
	}

	return policy, nil
}

func (s *policyService) DeletePolicy(ctx context.Context, id int64) error {
	return s.policyRepo.Delete(ctx, id)
}

func (s *policyService) SimulatePolicy(ctx context.Context, tenantID int64, userEmail, actionKey, contextIP, contextTime string) (string, string, error) {
	// This is a simplified simulation. In a real system, this would involve complex logic
	// to evaluate policies based on user roles, attributes, and context.

	// For demonstration, always allow if actionKey is "allow" and deny otherwise.
	if actionKey == "allow" {
		return "ALLOWED", "Simulated allow based on action key", nil
	}
	return "DENIED", "Simulated deny based on action key", nil
}
