package service

import (
	"context"
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

func (s *roleService) GetRole(ctx context.Context, id int64) (*entities.Role, error) {
	return s.roleRepo.GetRole(ctx, id)
}

func (s *roleService) ListRoles(ctx context.Context, tenantID int64) ([]entities.Role, error) {
	return s.roleRepo.ListRoles(ctx, tenantID)
}

func (s *roleService) UpdateRole(ctx context.Context, role *entities.Role, permissionIDs []int64) error {
	tx := s.db.WithContext(ctx).Begin()
	if tx.Error != nil {
		return tx.Error
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
