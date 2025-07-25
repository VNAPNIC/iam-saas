package postgres

import (
	"context"
	"iam-saas/internal/domain"
	"iam-saas/internal/entities"
	"strconv"

	"gorm.io/gorm"
)

type auditLogRepository struct {
	db *gorm.DB
}

func NewAuditLogRepository(db *gorm.DB) domain.AuditLogRepository {
	return &auditLogRepository{db}
}

func (r *auditLogRepository) Create(ctx context.Context, tx *gorm.DB, log *entities.AuditLog) error {
	db := r.db
	if tx != nil {
		db = tx
	}
	query := `
		INSERT INTO audit_logs (tenant_id, user_id, user_email, ip_address, event, status, severity, details, created_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
		RETURNING id, created_at;
	`
	row := db.WithContext(ctx).Raw(query, log.TenantID, log.UserID, log.UserEmail, log.IPAddress, log.Event, log.Status, log.Severity, log.Details).Row()
	return row.Scan(&log.ID, &log.CreatedAt)
}

func (r *auditLogRepository) ListAuditLogs(ctx context.Context, tenantID int64, event, userID, status, severity string, startDate, endDate *string) ([]entities.AuditLog, error) {
	var logs []entities.AuditLog
	query := `
		SELECT id, tenant_id, user_id, user_email, ip_address, event, status, severity, details, created_at
		FROM audit_logs
		WHERE tenant_id = $1
	`
	args := []interface{}{tenantID}
	paramCount := 2

	if event != "" {
		query += " AND event = $" + strconv.Itoa(paramCount)
		args = append(args, event)
		paramCount++
	}
	if userID != "" {
		query += " AND user_id = $" + strconv.Itoa(paramCount)
		args = append(args, userID)
		paramCount++
	}
	if status != "" {
		query += " AND status = $" + strconv.Itoa(paramCount)
		args = append(args, status)
		paramCount++
	}
	if severity != "" {
		query += " AND severity = $" + strconv.Itoa(paramCount)
		args = append(args, severity)
		paramCount++
	}
	if startDate != nil && *startDate != "" {
		query += " AND created_at >= $" + strconv.Itoa(paramCount)
		args = append(args, *startDate)
		paramCount++
	}
	if endDate != nil && *endDate != "" {
		query += " AND created_at <= $" + strconv.Itoa(paramCount)
		args = append(args, *endDate)
	}

	query += " ORDER BY created_at DESC;"

	rows, err := r.db.WithContext(ctx).Raw(query, args...).Rows()
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	for rows.Next() {
		var log entities.AuditLog
		err := rows.Scan(&log.ID, &log.TenantID, &log.UserID, &log.UserEmail, &log.IPAddress, &log.Event, &log.Status, &log.Severity, &log.Details, &log.CreatedAt)
		if err != nil {
			return nil, err
		}
		logs = append(logs, log)
	}
	return logs, nil
}
