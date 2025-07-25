package postgres

import (
	"context"
	"iam-saas/internal/domain"
	"iam-saas/internal/entities"

	"gorm.io/gorm"
)

type requestRepository struct {
	db *gorm.DB
}

func NewRequestRepository(db *gorm.DB) domain.RequestRepository {
	return &requestRepository{db}
}

func (r *requestRepository) Create(ctx context.Context, tx *gorm.DB, request *entities.Request) error {
	db := r.db
	if tx != nil {
		db = tx
	}
	query := `
		INSERT INTO requests (tenant_id, request_type, status, requested_by_user_id, requested_by_email, details, denial_reason, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
		RETURNING id, created_at, updated_at;
	`
	row := db.WithContext(ctx).Raw(query, request.TenantID, request.RequestType, request.Status, request.RequestedByUserID, request.RequestedByEmail, request.Details, request.DenialReason).Row()
	return row.Scan(&request.ID, &request.CreatedAt, &request.UpdatedAt)
}

func (r *requestRepository) FindByID(ctx context.Context, id int64) (*entities.Request, error) {
	var request entities.Request
	query := `
		SELECT id, tenant_id, request_type, status, requested_by_user_id, requested_by_email, details, denial_reason, created_at, updated_at
		FROM requests
		WHERE id = $1;
	`
	rows, err := r.db.WithContext(ctx).Raw(query, id).Rows()
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	if rows.Next() {
		err := rows.Scan(&request.ID, &request.TenantID, &request.RequestType, &request.Status, &request.RequestedByUserID, &request.RequestedByEmail, &request.Details, &request.DenialReason, &request.CreatedAt, &request.UpdatedAt)
		if err != nil {
			return nil, err
		}
		return &request, nil
	}
	return nil, nil
}

func (r *requestRepository) ListTenantRequests(ctx context.Context, tenantID int64) ([]entities.Request, error) {
	var requests []entities.Request
	query := `
		SELECT id, tenant_id, request_type, status, requested_by_user_id, requested_by_email, details, denial_reason, created_at, updated_at
		FROM requests
		WHERE request_type = 'tenant_approval' AND status = 'pending' AND tenant_id = $1
		ORDER BY created_at ASC;
	`
	rows, err := r.db.WithContext(ctx).Raw(query, tenantID).Rows()
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	for rows.Next() {
		var request entities.Request
		err := rows.Scan(&request.ID, &request.TenantID, &request.RequestType, &request.Status, &request.RequestedByUserID, &request.RequestedByEmail, &request.Details, &request.DenialReason, &request.CreatedAt, &request.UpdatedAt)
		if err != nil {
			return nil, err
		}
		requests = append(requests, request)
	}
	return requests, nil
}

func (r *requestRepository) ListQuotaRequests(ctx context.Context, tenantID int64) ([]entities.Request, error) {
	var requests []entities.Request
	query := `
		SELECT id, tenant_id, request_type, status, requested_by_user_id, requested_by_email, details, denial_reason, created_at, updated_at
		FROM requests
		WHERE request_type = 'quota_increase' AND status = 'pending' AND tenant_id = $1
		ORDER BY created_at ASC;
	`
	rows, err := r.db.WithContext(ctx).Raw(query, tenantID).Rows()
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	for rows.Next() {
		var request entities.Request
		err := rows.Scan(&request.ID, &request.TenantID, &request.RequestType, &request.Status, &request.RequestedByUserID, &request.RequestedByEmail, &request.Details, &request.DenialReason, &request.CreatedAt, &request.UpdatedAt)
		if err != nil {
			return nil, err
		}
		requests = append(requests, request)
	}
	return requests, nil
}

func (r *requestRepository) UpdateStatus(ctx context.Context, id int64, status string) error {
	query := `UPDATE requests SET status = ?, updated_at = NOW() WHERE id = ?`
	return r.db.WithContext(ctx).Exec(query, status, id).Error
}
