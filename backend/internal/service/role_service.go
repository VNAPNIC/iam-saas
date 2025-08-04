package service

import (
	"context"
	"errors"
	"fmt"
	"iam-saas/internal/domain"
	"iam-saas/internal/entities"

	"gorm.io/gorm"
)

type roleService struct {
	db       *gorm.DB
	roleRepo domain.RoleRepository
}

func NewRoleService(db *gorm.DB, roleRepo domain.RoleRepository) domain.RoleService {
	return &roleService{db, roleRepo}
}

func (s *roleService) GetRolePermissions(ctx context.Context, roleIDs []int64) ([]string, error) {
	return s.roleRepo.GetRolePermissions(ctx, roleIDs)
}

func (s *roleService) CreateRole(ctx context.Context, role *entities.Role, permissionIDs []int64) error {
	// Kiểm tra tenant tồn tại
	var tenant entities.Tenant
	if err := s.db.WithContext(ctx).First(&tenant, role.TenantID).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return fmt.Errorf("tenant not found")
		}
		return err
	}

	tx := s.db.WithContext(ctx).Begin()
	if tx.Error != nil {
		return tx.Error
	}

	if err := s.roleRepo.CreateRole(ctx, tx, role); err != nil {
		tx.Rollback()
		return err
	}

	if len(permissionIDs) > 0 {
		if err := s.roleRepo.AddPermissionsToRole(ctx, tx, role.ID, permissionIDs); err != nil {
			tx.Rollback()
			return err
		}
	}

	return tx.Commit().Error
}

func (s *roleService) ListRoles(ctx context.Context, tenantID int64) ([]entities.Role, error) {
	// Kiểm tra tenant tồn tại trong database
	// Đây là một kiểm tra bổ sung để đảm bảo tenant tồn tại
	return s.roleRepo.ListRoles(ctx, tenantID)
}

func (s *roleService) GetRole(ctx context.Context, id int64) (*entities.Role, error) {
	return s.roleRepo.GetRole(ctx, id)
}

func (s *roleService) UpdateRole(ctx context.Context, role *entities.Role, permissionIDs []int64) error {
	tx := s.db.WithContext(ctx).Begin()
	if tx.Error != nil {
		return tx.Error
	}

	// Kiểm tra role có thuộc về tenant không
	existingRole, err := s.roleRepo.GetRole(ctx, role.ID)
	if err != nil {
		tx.Rollback()
		return err
	}
	if existingRole == nil {
		tx.Rollback()
		return fmt.Errorf("role not found")
	}
	if existingRole.TenantID != role.TenantID {
		tx.Rollback()
		return fmt.Errorf("role does not belong to the specified tenant")
	}

	if err := s.roleRepo.UpdateRole(ctx, tx, role); err != nil {
		tx.Rollback()
		return err
	}

	if err := s.roleRepo.RemoveAllPermissionsFromRole(ctx, tx, role.ID); err != nil {
		tx.Rollback()
		return err
	}

	if len(permissionIDs) > 0 {
		if err := s.roleRepo.AddPermissionsToRole(ctx, tx, role.ID, permissionIDs); err != nil {
			tx.Rollback()
			return err
		}
	}

	return tx.Commit().Error
}

func (s *roleService) DeleteRole(ctx context.Context, id int64) error {
	return s.roleRepo.DeleteRole(ctx, id)
}

func (s *roleService) ListPermissions(ctx context.Context) ([]entities.Permission, error) {
	return s.roleRepo.ListPermissions(ctx)
}

// CheckPermission kiểm tra xem user có quyền cụ thể hay không
func (s *roleService) CheckPermission(ctx context.Context, userID int64, permission string) (bool, error) {
	// Lấy danh sách role IDs của user
	userRoles, err := s.roleRepo.GetUserRoles(ctx, userID)
	if err != nil {
		return false, err
	}

	if len(userRoles) == 0 {
		return false, nil
	}

	// Lấy danh sách permissions của các roles
	permissions, err := s.roleRepo.GetRolePermissions(ctx, userRoles)
	if err != nil {
		return false, err
	}

	// Kiểm tra permission cụ thể hoặc super_admin
	for _, perm := range permissions {
		if perm == permission || perm == "super_admin" {
			return true, nil
		}
	}

	return false, nil
}

// CheckUserPermissions kiểm tra nhiều permissions cùng lúc
func (s *roleService) CheckUserPermissions(ctx context.Context, userID int64, permissions []string) (map[string]bool, error) {
	result := make(map[string]bool)
	
	for _, permission := range permissions {
		hasPermission, err := s.CheckPermission(ctx, userID, permission)
		if err != nil {
			return nil, err
		}
		result[permission] = hasPermission
	}
	
	return result, nil
}
