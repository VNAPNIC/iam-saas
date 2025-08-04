package domain

import (
	"context"
	"iam-saas/internal/entities"

	"gorm.io/gorm"
)

type ServiceRoleRepository interface {
	Create(ctx context.Context, tx *gorm.DB, serviceRole *entities.ServiceRole) error
	FindByID(ctx context.Context, id int64) (*entities.ServiceRole, error)
	FindByTenantID(ctx context.Context, tenantID int64) ([]entities.ServiceRole, error)
	Update(ctx context.Context, serviceRole *entities.ServiceRole) error
	Delete(ctx context.Context, id int64) error
	FindByNameAndTenantID(ctx context.Context, name string, tenantID int64) (*entities.ServiceRole, error)
}

type ServiceRoleService interface {
	CreateServiceRole(ctx context.Context, tenantID int64, name, description string, permissions []string) (*entities.ServiceRole, error)
	GetServiceRole(ctx context.Context, tenantID int64, id int64) (*entities.ServiceRole, error)
	ListServiceRoles(ctx context.Context, tenantID int64) ([]entities.ServiceRole, error)
	UpdateServiceRole(ctx context.Context, tenantID int64, id int64, name, description string, permissions []string) (*entities.ServiceRole, error)
	DeleteServiceRole(ctx context.Context, tenantID int64, id int64) error
}