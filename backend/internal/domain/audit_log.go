package domain

import (
	"context"
	"iam-saas/internal/entities"

	"gorm.io/gorm"
)

type AuditLogRepository interface {
	Create(ctx context.Context, tx *gorm.DB, log *entities.AuditLog) error
	ListAuditLogs(ctx context.Context, tenantID int64, event, userID, status, severity string, startDate, endDate *string) ([]entities.AuditLog, error)
}

type AuditLogService interface {
	CreateAuditLog(ctx context.Context, tenantID int64, userID int64, userEmail, ipAddress, event, status, severity, details string) error
	ListAuditLogs(ctx context.Context, tenantID int64, event, userID, status, severity string, startDate, endDate *string) ([]entities.AuditLog, error)
}
