package service

import (
	"context"
	"encoding/json"
	"iam-saas/internal/domain"
	"iam-saas/internal/entities"
	"iam-saas/pkg/app_error"

	"gorm.io/gorm"
)

type serviceRoleService struct {
	db              *gorm.DB
	serviceRoleRepo domain.ServiceRoleRepository
}

func NewServiceRoleService(db *gorm.DB, serviceRoleRepo domain.ServiceRoleRepository) domain.ServiceRoleService {
	return &serviceRoleService{db, serviceRoleRepo}
}

func (s *serviceRoleService) CreateServiceRole(ctx context.Context, tenantID int64, name, description string, permissions []string) (*entities.ServiceRole, error) {
	// Check if service role with same name exists in tenant
	existing, err := s.serviceRoleRepo.FindByNameAndTenantID(ctx, name, tenantID)
	if err != nil && err != gorm.ErrRecordNotFound {
		return nil, app_error.NewInternalServerError(err)
	}
	if existing != nil {
		return nil, app_error.NewConflictError("Service role with this name already exists", "DUPLICATE_SERVICE_ROLE")
	}

	// Convert permissions to JSON
	permissionsJSON, err := json.Marshal(permissions)
	if err != nil {
		return nil, app_error.NewInternalServerError(err)
	}

	serviceRole := &entities.ServiceRole{
		TenantID:    tenantID,
		Name:        name,
		Description: description,
		Permissions: string(permissionsJSON),
	}

	if err := s.serviceRoleRepo.Create(ctx, nil, serviceRole); err != nil {
		return nil, app_error.NewInternalServerError(err)
	}

	return serviceRole, nil
}

func (s *serviceRoleService) GetServiceRole(ctx context.Context, tenantID int64, id int64) (*entities.ServiceRole, error) {
	serviceRole, err := s.serviceRoleRepo.FindByID(ctx, id)
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, app_error.NewNotFoundError("Service role not found")
		}
		return nil, app_error.NewInternalServerError(err)
	}

	if serviceRole.TenantID != tenantID {
		return nil, app_error.NewNotFoundError("Service role not found")
	}

	return serviceRole, nil
}

func (s *serviceRoleService) ListServiceRoles(ctx context.Context, tenantID int64) ([]entities.ServiceRole, error) {
	return s.serviceRoleRepo.FindByTenantID(ctx, tenantID)
}

func (s *serviceRoleService) UpdateServiceRole(ctx context.Context, tenantID int64, id int64, name, description string, permissions []string) (*entities.ServiceRole, error) {
	serviceRole, err := s.GetServiceRole(ctx, tenantID, id)
	if err != nil {
		return nil, err
	}

	// Check if another service role with same name exists
	if name != serviceRole.Name {
		existing, err := s.serviceRoleRepo.FindByNameAndTenantID(ctx, name, tenantID)
		if err != nil && err != gorm.ErrRecordNotFound {
			return nil, app_error.NewInternalServerError(err)
		}
		if existing != nil {
			return nil, app_error.NewConflictError("Service role with this name already exists", "DUPLICATE_SERVICE_ROLE")
		}
	}

	// Convert permissions to JSON
	permissionsJSON, err := json.Marshal(permissions)
	if err != nil {
		return nil, app_error.NewInternalServerError(err)
	}

	serviceRole.Name = name
	serviceRole.Description = description
	serviceRole.Permissions = string(permissionsJSON)

	if err := s.serviceRoleRepo.Update(ctx, serviceRole); err != nil {
		return nil, app_error.NewInternalServerError(err)
	}

	return serviceRole, nil
}

func (s *serviceRoleService) DeleteServiceRole(ctx context.Context, tenantID int64, id int64) error {
	serviceRole, err := s.GetServiceRole(ctx, tenantID, id)
	if err != nil {
		return err
	}

	if err := s.serviceRoleRepo.Delete(ctx, serviceRole.ID); err != nil {
		return app_error.NewInternalServerError(err)
	}

	return nil
}