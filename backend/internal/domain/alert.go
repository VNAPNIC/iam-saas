package domain

import (
	"context"
	"iam-saas/internal/entities"

	"gorm.io/gorm"
)

type AlertRepository interface {
	Create(ctx context.Context, tx *gorm.DB, alert *entities.Alert) error
	FindByID(ctx context.Context, id int64) (*entities.Alert, error)
	ListAlerts(ctx context.Context, tenantID *int64, userID *int64, severity, status string) ([]entities.Alert, error)
	Update(ctx context.Context, alert *entities.Alert) error
}

type AlertService interface {
	CreateAlert(ctx context.Context, tenantID *int64, userID *int64, event, message, severity string) error
	GetAlertByID(ctx context.Context, id int64) (*entities.Alert, error)
	ListAlerts(ctx context.Context, tenantID *int64, userID *int64, severity, status string) ([]entities.Alert, error)
	UpdateAlertStatus(ctx context.Context, id int64, status string) (*entities.Alert, error)
}
