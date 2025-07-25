package service

import (
	"context"
	"iam-saas/internal/domain"
	"iam-saas/internal/entities"
	"iam-saas/pkg/app_error"

	"gorm.io/gorm"
)

type auditLogService struct {
	db           *gorm.DB
	auditLogRepo domain.AuditLogRepository
}

func NewAuditLogService(db *gorm.DB, auditLogRepo domain.AuditLogRepository) domain.AuditLogService {
	return &auditLogService{db, auditLogRepo}
}

func (s *auditLogService) CreateAuditLog(ctx context.Context, tenantID int64, userID int64, userEmail, ipAddress, event, status, severity, details string) error {
	log := &entities.AuditLog{
		TenantID:  tenantID,
		UserID:    userID,
		UserEmail: userEmail,
		IPAddress: ipAddress,
		Event:     event,
		Status:    status,
		Severity:  severity,
		Details:   details,
	}

	if err := s.auditLogRepo.Create(ctx, nil, log); err != nil {
		return app_error.NewInternalServerError(err)
	}
	return nil
}

func (s *auditLogService) ListAuditLogs(ctx context.Context, tenantID int64, event, userID, status, severity string, startDate, endDate *string) ([]entities.AuditLog, error) {
	return s.auditLogRepo.ListAuditLogs(ctx, tenantID, event, userID, status, severity, startDate, endDate)
}
