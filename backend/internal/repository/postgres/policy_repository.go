package postgres

import (
	"context"
	"iam-saas/internal/domain"
	"iam-saas/internal/entities"

	"gorm.io/gorm"
)

type policyRepository struct {
	db *gorm.DB
}

func NewPolicyRepository(db *gorm.DB) domain.PolicyRepository {
	return &policyRepository{db}
}

func (r *policyRepository) Create(ctx context.Context, tx *gorm.DB, policy *entities.Policy) error {
	db := r.db
	if tx != nil {
		db = tx
	}
	return db.WithContext(ctx).Create(policy).Error
}

func (r *policyRepository) FindByID(ctx context.Context, id int64) (*entities.Policy, error) {
	var policy entities.Policy
	query := `
		SELECT id, tenant_id, name, target, condition, status, created_at, updated_at
		FROM policies
		WHERE id = $1;
	`
	rows, err := r.db.WithContext(ctx).Raw(query, id).Rows()
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	if rows.Next() {
		err := rows.Scan(&policy.ID, &policy.TenantID, &policy.Name, &policy.Target, &policy.Condition, &policy.Status, &policy.CreatedAt, &policy.UpdatedAt)
		if err != nil {
			return nil, err
		}
		return &policy, nil
	}
	return nil, nil
}

func (r *policyRepository) ListPolicies(ctx context.Context, tenantID int64) ([]entities.Policy, error) {
	var policies []entities.Policy
	query := `
		SELECT id, tenant_id, name, target, condition, status, created_at, updated_at
		FROM policies
		WHERE tenant_id = $1
		ORDER BY name ASC;
	`
	rows, err := r.db.WithContext(ctx).Raw(query, tenantID).Rows()
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	for rows.Next() {
		var policy entities.Policy
		err := rows.Scan(&policy.ID, &policy.TenantID, &policy.Name, &policy.Target, &policy.Condition, &policy.Status, &policy.CreatedAt, &policy.UpdatedAt)
		if err != nil {
			return nil, err
		}
		policies = append(policies, policy)
	}
	return policies, nil
}

func (r *policyRepository) Update(ctx context.Context, policy *entities.Policy) error {
	query := `UPDATE policies SET name = ?, target = ?, condition = ?, status = ?, updated_at = NOW() WHERE id = ?`
	return r.db.WithContext(ctx).Exec(query, policy.Name, policy.Target, policy.Condition, policy.Status, policy.ID).Error
}

func (r *policyRepository) Delete(ctx context.Context, id int64) error {
	query := `DELETE FROM policies WHERE id = ?`
	return r.db.WithContext(ctx).Exec(query, id).Error
}
