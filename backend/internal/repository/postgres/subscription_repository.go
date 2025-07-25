package postgres

import (
	"context"
	"iam-saas/internal/domain"
	"iam-saas/internal/entities"

	"gorm.io/gorm"
)

type subscriptionRepository struct {
	db *gorm.DB
}

func NewSubscriptionRepository(db *gorm.DB) domain.SubscriptionRepository {
	return &subscriptionRepository{db}
}

func (r *subscriptionRepository) Create(ctx context.Context, tx *gorm.DB, subscription *entities.Subscription) error {
	db := r.db
	if tx != nil {
		db = tx
	}
	query := `
		INSERT INTO subscriptions (tenant_id, plan_id, status, start_date, end_date, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
		RETURNING id, created_at, updated_at;
	`
	row := db.WithContext(ctx).Raw(query, subscription.TenantID, subscription.PlanID, subscription.Status, subscription.StartDate, subscription.EndDate).Row()
	return row.Scan(&subscription.ID, &subscription.CreatedAt, &subscription.UpdatedAt)
}

func (r *subscriptionRepository) FindByTenantID(ctx context.Context, tenantID int64) (*entities.Subscription, error) {
	var subscription entities.Subscription
	query := `SELECT id, tenant_id, plan_id, status, start_date, end_date, created_at, updated_at FROM subscriptions WHERE tenant_id = $1`
	rows, err := r.db.WithContext(ctx).Raw(query, tenantID).Rows()
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	if rows.Next() {
		err := rows.Scan(&subscription.ID, &subscription.TenantID, &subscription.PlanID, &subscription.Status, &subscription.StartDate, &subscription.EndDate, &subscription.CreatedAt, &subscription.UpdatedAt)
		if err != nil {
			return nil, err
		}
		return &subscription, nil
	}

	return nil, gorm.ErrRecordNotFound
}

func (r *subscriptionRepository) Update(ctx context.Context, subscription *entities.Subscription) error {
	query := `UPDATE subscriptions SET plan_id = ?, status = ?, start_date = ?, end_date = ?, updated_at = NOW() WHERE id = ?`
	return r.db.WithContext(ctx).Exec(query, subscription.PlanID, subscription.Status, subscription.StartDate, subscription.EndDate, subscription.ID).Error
}