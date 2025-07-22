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

func (r *roleRepository) Create(ctx context.Context, role *entities.Role) error {
	return r.db.WithContext(ctx).Create(role).Error
}

func (r *roleRepository) FindByID(ctx context.Context, roleID int64) (*entities.Role, error) {
	var role entities.Role
	// Sử dụng Preload để lấy cả permissions liên quan
	err := r.db.WithContext(ctx).Preload("Permissions").First(&role, roleID).Error
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, nil
		}
		return nil, err
	}
	return &role, nil
}

func (r *roleRepository) ListByTenant(ctx context.Context, tenantID int64) ([]entities.Role, error) {
	var roles []entities.Role
	// Lấy cả các role của tenant và các system role
	err := r.db.WithContext(ctx).Preload("Permissions").Where("tenant_id = ? OR is_system_role = TRUE", tenantID).Order("created_at DESC").Find(&roles).Error
	return roles, err
}

func (r *roleRepository) Update(ctx context.Context, role *entities.Role) error {
	// Gorm sẽ chỉ cập nhật các trường được chỉ định trong `role`
	return r.db.WithContext(ctx).Save(role).Error
}

func (r *roleRepository) Delete(ctx context.Context, roleID int64) error {
	return r.db.WithContext(ctx).Delete(&entities.Role{}, roleID).Error
}

func (r *roleRepository) AddPermissionToRole(ctx context.Context, roleID int64, permissionID int64) error {
    sql := "INSERT INTO role_permissions (role_id, permission_id) VALUES (?, ?)"
    return r.db.WithContext(ctx).Exec(sql, roleID, permissionID).Error
}

func (r *roleRepository) RemovePermissionFromRole(ctx context.Context, roleID int64, permissionID int64) error {
    sql := "DELETE FROM role_permissions WHERE role_id = ? AND permission_id = ?"
    return r.db.WithContext(ctx).Exec(sql, roleID, permissionID).Error
}

// --- Permission Repository ---

type permissionRepository struct {
	db *gorm.DB
}

func NewPermissionRepository(db *gorm.DB) domain.PermissionRepository {
	return &permissionRepository{db}
}

func (r *permissionRepository) ListAll(ctx context.Context) ([]entities.Permission, error) {
	var permissions []entities.Permission
	err := r.db.WithContext(ctx).Find(&permissions).Error
	return permissions, err
}
