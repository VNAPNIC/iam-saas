package domain

import (
	"context"
	"iam-saas/internal/entities"

	"gorm.io/gorm"
)

type RequestRepository interface {
	Create(ctx context.Context, tx *gorm.DB, request *entities.Request) error
	FindByID(ctx context.Context, id int64) (*entities.Request, error)
	ListTenantRequests(ctx context.Context) ([]entities.Request, error)
	ListQuotaRequests(ctx context.Context) ([]entities.Request, error)
	UpdateStatus(ctx context.Context, id int64, status string) error
}

type RequestService interface {
	CreateTenantRequest(ctx context.Context, tenantID int64, adminEmail string) (*entities.Request, error)
	CreateQuotaRequest(ctx context.Context, tenantID int64, quotaType string, requestedAmount int, reason string) (*entities.Request, error)
	ListTenantRequests(ctx context.Context) ([]entities.Request, error)
	ListQuotaRequests(ctx context.Context) ([]entities.Request, error)
	ApproveRequest(ctx context.Context, id int64) error
	DenyRequest(ctx context.Context, id int64, reason string) error
}
