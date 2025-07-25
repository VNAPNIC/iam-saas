package postgres

import (
	"context"
	"iam-saas/internal/domain"
	"iam-saas/internal/entities"

	"gorm.io/gorm"
)

type planRepository struct {
	db *gorm.DB
}

func NewPlanRepository(db *gorm.DB) domain.PlanRepository {
	return &planRepository{db}
}

func (r *planRepository) Create(ctx context.Context, tx *gorm.DB, plan *entities.Plan) error {
	db := r.db
	if tx != nil {
		db = tx
	}
	query := `
		INSERT INTO plans (name, price, user_quota, api_quota, status, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
		RETURNING id, created_at, updated_at;
	`
	row := db.WithContext(ctx).Raw(query, plan.Name, plan.Price, plan.UserQuota, plan.APIQuota, plan.Status).Row()
	return row.Scan(&plan.ID, &plan.CreatedAt, &plan.UpdatedAt)
}

func (r *planRepository) FindByID(ctx context.Context, id int64) (*entities.Plan, error) {
	var plan entities.Plan
	query := `
		SELECT id, name, price, user_quota, api_quota, status, created_at, updated_at
		FROM plans
		WHERE id = $1;
	`
	rows, err := r.db.WithContext(ctx).Raw(query, id).Rows()
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	if rows.Next() {
		err := rows.Scan(&plan.ID, &plan.Name, &plan.Price, &plan.UserQuota, &plan.APIQuota, &plan.Status, &plan.CreatedAt, &plan.UpdatedAt)
		if err != nil {
			return nil, err
		}
		return &plan, nil
	}
	return nil, nil
}

func (r *planRepository) FindByName(ctx context.Context, name string) (*entities.Plan, error) {
	var plan entities.Plan
	query := `
		SELECT id, name, price, user_quota, api_quota, status, created_at, updated_at
		FROM plans
		WHERE name = $1;
	`
	rows, err := r.db.WithContext(ctx).Raw(query, name).Rows()
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	if rows.Next() {
		err := rows.Scan(&plan.ID, &plan.Name, &plan.Price, &plan.UserQuota, &plan.APIQuota, &plan.Status, &plan.CreatedAt, &plan.UpdatedAt)
		if err != nil {
			return nil, err
		}
		return &plan, nil
	}
	return nil, nil
}

func (r *planRepository) ListPlans(ctx context.Context) ([]entities.Plan, error) {
	var plans []entities.Plan
	query := `
		SELECT id, name, price, user_quota, api_quota, status, created_at, updated_at
		FROM plans
		ORDER BY name ASC;
	`
	rows, err := r.db.WithContext(ctx).Raw(query).Rows()
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	for rows.Next() {
		var plan entities.Plan
		err := rows.Scan(&plan.ID, &plan.Name, &plan.Price, &plan.UserQuota, &plan.APIQuota, &plan.Status, &plan.CreatedAt, &plan.UpdatedAt)
		if err != nil {
			return nil, err
		}
		plans = append(plans, plan)
	}
	return plans, nil
}

func (r *planRepository) Update(ctx context.Context, plan *entities.Plan) error {
	query := `UPDATE plans SET name = ?, price = ?, user_quota = ?, api_quota = ?, status = ?, updated_at = NOW() WHERE id = ?`
	return r.db.WithContext(ctx).Exec(query, plan.Name, plan.Price, plan.UserQuota, plan.APIQuota, plan.Status, plan.ID).Error
}

func (r *planRepository) Delete(ctx context.Context, id int64) error {
	query := `DELETE FROM plans WHERE id = ?`
	return r.db.WithContext(ctx).Exec(query, id).Error
}
