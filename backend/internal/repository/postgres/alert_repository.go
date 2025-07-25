package postgres

import (
	"context"
	"iam-saas/internal/domain"
	"iam-saas/internal/entities"

	"gorm.io/gorm"
)

type alertRepository struct {
	db *gorm.DB
}

func NewAlertRepository(db *gorm.DB) domain.AlertRepository {
	return &alertRepository{db}
}

func (r *alertRepository) Create(ctx context.Context, tx *gorm.DB, alert *entities.Alert) error {
	db := r.db
	if tx != nil {
		db = tx
	}
	query := `
		INSERT INTO alerts (tenant_id, user_id, type, severity, status, description, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
		RETURNING id, created_at, updated_at;
	`
	row := db.WithContext(ctx).Raw(query, alert.TenantID, alert.UserID, alert.Type, alert.Severity, alert.Status, alert.Description).Row()
	return row.Scan(&alert.ID, &alert.CreatedAt, &alert.UpdatedAt)
}

func (r *alertRepository) FindByID(ctx context.Context, id int64) (*entities.Alert, error) {
	var alert entities.Alert
	query := `SELECT id, tenant_id, user_id, type, severity, status, description, created_at, updated_at FROM alerts WHERE id = $1`
	rows, err := r.db.WithContext(ctx).Raw(query, id).Rows()
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	if rows.Next() {
		err := rows.Scan(&alert.ID, &alert.TenantID, &alert.UserID, &alert.Type, &alert.Severity, &alert.Status, &alert.Description, &alert.CreatedAt, &alert.UpdatedAt)
		if err != nil {
			return nil, err
		}
		return &alert, nil
	}

	return nil, gorm.ErrRecordNotFound
}

func (r *alertRepository) ListAlerts(ctx context.Context, tenantID *int64, userID *int64, severity, status string) ([]entities.Alert, error) {
	var alerts []entities.Alert
	var args []interface{}

	query := `SELECT id, tenant_id, user_id, type, severity, status, description, created_at, updated_at FROM alerts WHERE 1=1`

	if tenantID != nil {
		query += " AND tenant_id = ?"
		args = append(args, *tenantID)
	}
	if userID != nil {
		query += " AND user_id = ?"
		args = append(args, *userID)
	}
	if severity != "" {
		query += " AND severity = ?"
		args = append(args, severity)
	}
	if status != "" {
		query += " AND status = ?"
		args = append(args, status)
	}

	query += " ORDER BY created_at DESC"

	rows, err := r.db.WithContext(ctx).Raw(query, args...).Rows()
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	for rows.Next() {
		var alert entities.Alert
		err := rows.Scan(&alert.ID, &alert.TenantID, &alert.UserID, &alert.Type, &alert.Severity, &alert.Status, &alert.Description, &alert.CreatedAt, &alert.UpdatedAt)
		if err != nil {
			return nil, err
		}
		alerts = append(alerts, alert)
	}

	return alerts, nil
}

func (r *alertRepository) Update(ctx context.Context, alert *entities.Alert) error {
	query := `UPDATE alerts SET status = ?, updated_at = NOW() WHERE id = ?`
	return r.db.WithContext(ctx).Exec(query, alert.Status, alert.ID).Error
}
