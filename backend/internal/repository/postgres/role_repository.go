package postgres

import (
	"context"
	"iam-saas/internal/domain"
	"iam-saas/internal/entities"

	"gorm.io/gorm"
)

type roleRepository struct {
	db *gorm.DB
}

func NewRoleRepository(db *gorm.DB) domain.RoleRepository {
	return &roleRepository{db}
}

func (r *roleRepository) GetRolePermissions(ctx context.Context, roleIDs []int64) ([]string, error) {
	var permissions []string
	query := `
		SELECT DISTINCT p.key
		FROM permissions p
		JOIN role_permissions rp ON p.id = rp.permission_id
		WHERE rp.role_id IN (?);
	`
	rows, err := r.db.WithContext(ctx).Raw(query, roleIDs).Rows()
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	for rows.Next() {
		var permission string
		if err := rows.Scan(&permission); err != nil {
			return nil, err
		}
		permissions = append(permissions, permission)
	}

	return permissions, nil
}

func (r *roleRepository) CreateRole(ctx context.Context, tx *gorm.DB, role *entities.Role) error {
	db := r.db
	if tx != nil {
		db = tx
	}
	return db.WithContext(ctx).Create(role).Error
}

func (r *roleRepository) GetRole(ctx context.Context, id int64) (*entities.Role, error) {
	var role entities.Role
	query := `
		SELECT id, tenant_id, name, description, is_default, created_at, updated_at
		FROM roles
		WHERE id = $1;
	`
	rows, err := r.db.WithContext(ctx).Raw(query, id).Rows()
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	if rows.Next() {
		err := rows.Scan(&role.ID, &role.TenantID, &role.Name, &role.Description, &role.IsDefault, &role.CreatedAt, &role.UpdatedAt)
		if err != nil {
			return nil, err
		}
		return &role, nil
	}
	return nil, nil
}

func (r *roleRepository) ListRoles(ctx context.Context, tenantID int64) ([]entities.Role, error) {
	var roles []entities.Role
	query := `
		SELECT id, tenant_id, name, description, is_default, created_at, updated_at
		FROM roles
		WHERE tenant_id = $1
		ORDER BY name ASC;
	`
	rows, err := r.db.WithContext(ctx).Raw(query, tenantID).Rows()
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	for rows.Next() {
		var role entities.Role
		err := rows.Scan(&role.ID, &role.TenantID, &role.Name, &role.Description, &role.IsDefault, &role.CreatedAt, &role.UpdatedAt)
		if err != nil {
			return nil, err
		}
		roles = append(roles, role)
	}
	return roles, nil
}

func (r *roleRepository) UpdateRole(ctx context.Context, tx *gorm.DB, role *entities.Role) error {
	db := r.db
	if tx != nil {
		db = tx
	}
	return db.WithContext(ctx).Save(role).Error
}

func (r *roleRepository) DeleteRole(ctx context.Context, id int64) error {
	return r.db.WithContext(ctx).Delete(&entities.Role{}, id).Error
}

func (r *roleRepository) ListPermissions(ctx context.Context) ([]entities.Permission, error) {
	var permissions []entities.Permission
	query := `
		SELECT id, key, description, created_at, updated_at
		FROM permissions
		ORDER BY key ASC;
	`
	rows, err := r.db.WithContext(ctx).Raw(query).Rows()
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	for rows.Next() {
		var permission entities.Permission
		err := rows.Scan(&permission.ID, &permission.Key, &permission.Description, &permission.CreatedAt, &permission.UpdatedAt)
		if err != nil {
			return nil, err
		}
		permissions = append(permissions, permission)
	}
	return permissions, nil
}

func (r *roleRepository) AddPermissionsToRole(ctx context.Context, tx *gorm.DB, roleID int64, permissionIDs []int64) error {
	db := r.db
	if tx != nil {
		db = tx
	}

	query := `
		INSERT INTO role_permissions (role_id, permission_id)
		SELECT ?, p.id
		FROM permissions p
		WHERE p.id IN (?);
	`
	return db.WithContext(ctx).Exec(query, roleID, permissionIDs).Error
}

func (r *roleRepository) RemoveAllPermissionsFromRole(ctx context.Context, tx *gorm.DB, roleID int64) error {
	db := r.db
	if tx != nil {
		db = tx
	}

	query := `DELETE FROM role_permissions WHERE role_id = ?`
	return db.WithContext(ctx).Exec(query, roleID).Error
}
