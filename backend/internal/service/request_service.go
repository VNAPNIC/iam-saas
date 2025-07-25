package service

import (
	"context"
	"iam-saas/internal/domain"
	"iam-saas/internal/entities"
	"iam-saas/pkg/app_error"

	"gorm.io/gorm"
)

type requestService struct {
	db          *gorm.DB
	requestRepo domain.RequestRepository
	tenantRepo  domain.TenantRepository
	userRepo    domain.UserRepository
}

func NewRequestService(db *gorm.DB, requestRepo domain.RequestRepository, tenantRepo domain.TenantRepository, userRepo domain.UserRepository) domain.RequestService {
	return &requestService{db, requestRepo, tenantRepo, userRepo}
}

func (s *requestService) CreateTenantRequest(ctx context.Context, tenantID int64, adminEmail string) (*entities.Request, error) {
	// Logic to create a tenant approval request
	return nil, nil
}

func (s *requestService) CreateQuotaRequest(ctx context.Context, tenantID int64, quotaType string, requestedAmount int, reason string) (*entities.Request, error) {
	// Logic to create a quota increase request
	return nil, nil
}

func (s *requestService) ListTenantRequests(ctx context.Context, tenantID int64) ([]entities.Request, error) {
	return s.requestRepo.ListTenantRequests(ctx, tenantID)
}

func (s *requestService) ListQuotaRequests(ctx context.Context, tenantID int64) ([]entities.Request, error) {
	return s.requestRepo.ListQuotaRequests(ctx, tenantID)
}

func (s *requestService) ApproveRequest(ctx context.Context, tenantID int64, id int64) error {
	request, err := s.requestRepo.FindByID(ctx, id)
	if err != nil {
		return app_error.NewInternalServerError(err)
	}
	if request == nil || request.Status != "pending" || request.TenantID != tenantID {
		return app_error.NewInvalidInputError("Request not found or not pending for this tenant")
	}

	// Perform action based on request type
	switch request.RequestType {
	case "tenant_approval":
		// Logic to activate tenant
		// tenantID := request.TenantID
		// s.tenantRepo.UpdateStatus(ctx, tenantID, "active")
	case "quota_increase":
		// Logic to update tenant quota
		// tenantID := request.TenantID
		// details := parseQuotaDetails(request.Details)
		// s.tenantRepo.UpdateQuota(ctx, tenantID, details.QuotaType, details.Amount)
	}

	return s.requestRepo.UpdateStatus(ctx, id, "approved")
}

func (s *requestService) DenyRequest(ctx context.Context, tenantID int64, id int64, reason string) error {
	request, err := s.requestRepo.FindByID(ctx, id)
	if err != nil {
		return app_error.NewInternalServerError(err)
	}
	if request == nil || request.Status != "pending" || request.TenantID != tenantID {
		return app_error.NewInvalidInputError("Request not found or not pending for this tenant")
	}

	// Update denial reason in request details if needed
	// request.DenialReason = &reason

	return s.requestRepo.UpdateStatus(ctx, id, "denied")
}
