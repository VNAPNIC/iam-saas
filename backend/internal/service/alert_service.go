package service

import (
	"context"
	"iam-saas/internal/domain"
	"iam-saas/internal/entities"
	"iam-saas/pkg/app_error"

	"gorm.io/gorm"
)

type alertService struct {
	db        *gorm.DB
	alertRepo domain.AlertRepository
}

func NewAlertService(db *gorm.DB, alertRepo domain.AlertRepository) domain.AlertService {
	return &alertService{db, alertRepo}
}

func (s *alertService) CreateAlert(ctx context.Context, tenantID *int64, userID *int64, event, message, severity string) error {
	alert := &entities.Alert{
		TenantID: tenantID,
		UserID:   userID,
		Event:    event,
		Message:  message,
		Severity: severity,
		Status:   "NEW",
	}

	if err := s.alertRepo.Create(ctx, nil, alert); err != nil {
		return app_error.NewInternalServerError(err)
	}
	return nil
}

func (s *alertService) GetAlertByID(ctx context.Context, id int64) (*entities.Alert, error) {
	alert, err := s.alertRepo.FindByID(ctx, id)
	if err != nil {
		return nil, app_error.NewInternalServerError(err)
	}
	if alert == nil {
		return nil, app_error.NewNotFoundError("alert not found")
	}
	return alert, nil
}

func (s *alertService) ListAlerts(ctx context.Context, tenantID *int64, userID *int64, severity, status string) ([]entities.Alert, error) {
	return s.alertRepo.ListAlerts(ctx, tenantID, userID, severity, status)
}

func (s *alertService) UpdateAlertStatus(ctx context.Context, id int64, status string) (*entities.Alert, error) {
	alert, err := s.alertRepo.FindByID(ctx, id)
	if err != nil {
		return nil, app_error.NewInternalServerError(err)
	}
	if alert == nil {
		return nil, app_error.NewNotFoundError("alert not found")
	}

	alert.Status = status
	if err := s.alertRepo.Update(ctx, alert); err != nil {
		return nil, app_error.NewInternalServerError(err)
	}
	return alert, nil
}
