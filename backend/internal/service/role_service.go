package service

import (
	"context"
	"iam-saas/internal/domain"
	"iam-saas/internal/entities"
	"iam-saas/pkg/app_error"

	"gorm.io/gorm"
)

type roleService struct {
	db           *gorm.DB
	roleRepo     domain.RoleRepository
	permissionRepo domain.PermissionRepository
}

func NewRoleService(db *gorm.DB, roleRepo domain.RoleRepository, permissionRepo domain.PermissionRepository) domain.RoleService {
	return &roleService{db, roleRepo, permissionRepo}
}

func (s *roleService) CreateRole(ctx context.Context, tenantID int64, name, description string, permissionIDs []int64) (*entities.Role, error) {
	tx := s.db.Begin()
	if tx.Error != nil {
		return nil, app_error.NewInternalServerError(tx.Error)
	}
	defer tx.Rollback() // Rollback nếu có lỗi

	role := &entities.Role{
		TenantID:    &tenantID,
		Name:        name,
		Description: description,
	}

	if err := s.roleRepo.Create(ctx, role); err != nil {
		return nil, app_error.NewInternalServerError(err)
	}

	// Gán permissions cho role
	for _, pID := range permissionIDs {
		if err := s.roleRepo.AddPermissionToRole(ctx, role.ID, pID); err != nil {
			return nil, app_error.NewInternalServerError(err)
		}
	}

	if err := tx.Commit().Error; err != nil {
		return nil, app_error.NewInternalServerError(err)
	}

	return s.roleRepo.FindByID(ctx, role.ID)
}

func (s *roleService) GetRole(ctx context.Context, roleID int64) (*entities.Role, error) {
	return s.roleRepo.FindByID(ctx, roleID)
}

func (s *roleService) ListRoles(ctx context.Context, tenantID int64) ([]entities.Role, error) {
	return s.roleRepo.ListByTenant(ctx, tenantID)
}

func (s *roleService) UpdateRole(ctx context.Context, roleID int64, name, description string, permissionIDs []int64) (*entities.Role, error) {
	tx := s.db.Begin()
	if tx.Error != nil {
		return nil, app_error.NewInternalServerError(tx.Error)
	}
	defer tx.Rollback()

	role, err := s.roleRepo.FindByID(ctx, roleID)
	if err != nil || role == nil {
		return nil, app_error.NewNotFoundError("role not found")
	}

	role.Name = name
	role.Description = description

	if err := s.roleRepo.Update(ctx, role); err != nil {
		return nil, app_error.NewInternalServerError(err)
	}

	// Xóa hết permissions cũ và gán lại permissions mới
	// Đây là cách đơn giản nhất, có thể tối ưu sau
	for _, p := range role.Permissions {
		if err := s.roleRepo.RemovePermissionFromRole(ctx, role.ID, p.ID); err != nil {
			return nil, app_error.NewInternalServerError(err)
		}
	}
	for _, pID := range permissionIDs {
		if err := s.roleRepo.AddPermissionToRole(ctx, role.ID, pID); err != nil {
			return nil, app_error.NewInternalServerError(err)
		}
	}

	if err := tx.Commit().Error; err != nil {
		return nil, app_error.NewInternalServerError(err)
	}

	return s.roleRepo.FindByID(ctx, role.ID)
}

func (s *roleService) DeleteRole(ctx context.Context, roleID int64) error {
	return s.roleRepo.Delete(ctx, roleID)
}

func (s *roleService) ListPermissions(ctx context.Context) ([]entities.Permission, error) {
	return s.permissionRepo.ListAll(ctx)
}
