package domain

import (
	"context"
	"iam-saas/internal/entities"

	"gorm.io/gorm"
)

type RoleRepository interface {
	GetRolePermissions(ctx context.Context, roleIDs []int64) ([]string, error)
	CreateRole(ctx context.Context, tx *gorm.DB, role *entities.Role) error
	GetRole(ctx context.Context, id int64) (*entities.Role, error)
	ListRoles(ctx context.Context, tenantID int64) ([]entities.Role, error)
	UpdateRole(ctx context.Context, tx *gorm.DB, role *entities.Role) error
	DeleteRole(ctx context.Context, id int64) error
	ListPermissions(ctx context.Context) ([]entities.Permission, error)
	AddPermissionsToRole(ctx context.Context, tx *gorm.DB, roleID int64, permissionIDs []int64) error
	RemoveAllPermissionsFromRole(ctx context.Context, tx *gorm.DB, roleID int64) error
}

type RoleService interface {
	GetRolePermissions(ctx context.Context, roleIDs []int64) ([]string, error)
	CreateRole(ctx context.Context, role *entities.Role, permissionIDs []int64) error
	GetRole(ctx context.Context, id int64) (*entities.Role, error)
	ListRoles(ctx context.Context, tenantID int64) ([]entities.Role, error)
	UpdateRole(ctx context.Context, role *entities.Role, permissionIDs []int64) error
	DeleteRole(ctx context.Context, id int64) error
	ListPermissions(ctx context.Context) ([]entities.Permission, error)
}