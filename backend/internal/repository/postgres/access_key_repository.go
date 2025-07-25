package postgres

import (
	"context"
	"iam-saas/internal/domain"
	"iam-saas/internal/entities"

	"gorm.io/gorm"
)

type accessKeyRepository struct {
	db *gorm.DB
}

func NewAccessKeyRepository(db *gorm.DB) domain.AccessKeyRepository {
	return &accessKeyRepository{db}
}

func (r *accessKeyRepository) CreateGroup(ctx context.Context, tx *gorm.DB, group *entities.AccessKeyGroup) error {
	db := r.db
	if tx != nil {
		db = tx
	}
	query := `
		INSERT INTO access_key_groups (tenant_id, name, service_role, key_type, created_at, updated_at)
		VALUES ($1, $2, $3, $4, NOW(), NOW())
		RETURNING id, created_at, updated_at;
	`
	row := db.WithContext(ctx).Raw(query, group.TenantID, group.Name, group.ServiceRole, group.KeyType).Row()
	return row.Scan(&group.ID, &group.CreatedAt, &group.UpdatedAt)
}

func (r *accessKeyRepository) CreateKey(ctx context.Context, tx *gorm.DB, key *entities.AccessKey) error {
	db := r.db
	if tx != nil {
		db = tx
	}
	query := `
		INSERT INTO access_keys (group_id, access_key_id, secret_access_key_hash, status, created_at, updated_at)
		VALUES ($1, $2, $3, $4, NOW(), NOW())
		RETURNING id, created_at, updated_at;
	`
	row := db.WithContext(ctx).Raw(query, key.GroupID, key.AccessKeyID, key.SecretAccessKeyHash, key.Status).Row()
	return row.Scan(&key.ID, &key.CreatedAt, &key.UpdatedAt)
}

func (r *accessKeyRepository) ListAccessKeyGroups(ctx context.Context, tenantID int64) ([]entities.AccessKeyGroup, error) {
	var groups []entities.AccessKeyGroup
	query := `
		SELECT id, tenant_id, name, service_role, key_type, created_at, updated_at
		FROM access_key_groups
		WHERE tenant_id = $1
		ORDER BY name ASC;
	`
	rows, err := r.db.WithContext(ctx).Raw(query, tenantID).Rows()
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	for rows.Next() {
		var group entities.AccessKeyGroup
		err := rows.Scan(&group.ID, &group.TenantID, &group.Name, &group.ServiceRole, &group.KeyType, &group.CreatedAt, &group.UpdatedAt)
		if err != nil {
			return nil, err
		}
		// Fetch associated keys for each group
		keys, err := r.listKeysByGroupID(ctx, group.ID)
		if err != nil {
			return nil, err
		}
		group.Keys = keys
		groups = append(groups, group)
	}
	return groups, nil
}

func (r *accessKeyRepository) listKeysByGroupID(ctx context.Context, groupID int64) ([]entities.AccessKey, error) {
	var keys []entities.AccessKey
	query := `
		SELECT id, group_id, access_key_id, status, created_at, updated_at
		FROM access_keys
		WHERE group_id = $1
		ORDER BY created_at DESC;
	`
	rows, err := r.db.WithContext(ctx).Raw(query, groupID).Rows()
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	for rows.Next() {
		var key entities.AccessKey
		err := rows.Scan(&key.ID, &key.GroupID, &key.AccessKeyID, &key.Status, &key.CreatedAt, &key.UpdatedAt)
		if err != nil {
			return nil, err
		}
		keys = append(keys, key)
	}
	return keys, nil
}

func (r *accessKeyRepository) DeleteKey(ctx context.Context, keyID int64) error {
	query := `DELETE FROM access_keys WHERE id = ?`
	return r.db.WithContext(ctx).Exec(query, keyID).Error
}

func (r *accessKeyRepository) DeleteGroup(ctx context.Context, groupID int64) error {
	query := `DELETE FROM access_key_groups WHERE id = ?`
	return r.db.WithContext(ctx).Exec(query, groupID).Error
}
