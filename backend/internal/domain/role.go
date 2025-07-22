package domain

import (
	"context"
	"iam-saas/internal/entities"
)

// RoleRepository defines the contract for role data storage.
type RoleRepository interface {
	Create(ctx context.Context, role *entities.Role) error
	FindByID(ctx context.Context, roleID int64) (*entities.Role, error)
	ListByTenant(ctx context.Context, tenantID int64) ([]entities.Role, error)
	Update(ctx context.Context, role *entities.Role) error
	Delete(ctx context.Context, roleID int64) error
	AddPermissionToRole(ctx context.Context, roleID int64, permissionID int64) error
	RemovePermissionFromRole(ctx context.Context, roleID int64, permissionID int64) error
}

// PermissionRepository defines the contract for permission data storage.
type PermissionRepository interface {
	ListAll(ctx context.Context) ([]entities.Permission, error)
}

// RoleService defines the business logic for roles.
type RoleService interface {
	CreateRole(ctx context.Context, tenantID int64, name, description string, permissionIDs []int64) (*entities.Role, error)
	GetRole(ctx context.Context, roleID int64) (*entities.Role, error)
	ListRoles(ctx context.Context, tenantID int64) ([]entities.Role, error)
	UpdateRole(ctx context.Context, roleID int64, name, description string, permissionIDs []int64) (*entities.Role, error)
	DeleteRole(ctx context.Context, roleID int64) error
	ListPermissions(ctx context.Context) ([]entities.Permission, error)
}
