package postgres

import (
	"context"
	"iam-saas/internal/domain"
	"iam-saas/internal/entities"

	"gorm.io/gorm"
)

type serviceRoleRepository struct {
	db *gorm.DB
}

func NewServiceRoleRepository(db *gorm.DB) domain.ServiceRoleRepository {
	return &serviceRoleRepository{db}
}

func (r *serviceRoleRepository) Create(ctx context.Context, tx *gorm.DB, serviceRole *entities.ServiceRole) error {
	db := r.db
	if tx != nil {
		db = tx
	}
	return db.WithContext(ctx).Create(serviceRole).Error
}

func (r *serviceRoleRepository) FindByID(ctx context.Context, id int64) (*entities.ServiceRole, error) {
	var serviceRole entities.ServiceRole
	err := r.db.WithContext(ctx).Where("id = ?", id).First(&serviceRole).Error
	if err != nil {
		return nil, err
	}
	return &serviceRole, nil
}

func (r *serviceRoleRepository) FindByTenantID(ctx context.Context, tenantID int64) ([]entities.ServiceRole, error) {
	var serviceRoles []entities.ServiceRole
	err := r.db.WithContext(ctx).Where("tenant_id = ?", tenantID).Find(&serviceRoles).Error
	return serviceRoles, err
}

func (r *serviceRoleRepository) Update(ctx context.Context, serviceRole *entities.ServiceRole) error {
	return r.db.WithContext(ctx).Save(serviceRole).Error
}

func (r *serviceRoleRepository) Delete(ctx context.Context, id int64) error {
	return r.db.WithContext(ctx).Delete(&entities.ServiceRole{}, id).Error
}

func (r *serviceRoleRepository) FindByNameAndTenantID(ctx context.Context, name string, tenantID int64) (*entities.ServiceRole, error) {
	var serviceRole entities.ServiceRole
	err := r.db.WithContext(ctx).Where("name = ? AND tenant_id = ?", name, tenantID).First(&serviceRole).Error
	if err != nil {
		return nil, err
	}
	return &serviceRole, nil
}