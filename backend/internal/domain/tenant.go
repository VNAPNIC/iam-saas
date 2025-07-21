package domain

import (
	"context"
	"iam-saas/internal/entities"

	"gorm.io/gorm"
)

type TenantRepository interface {
	Create(ctx context.Context, tx *gorm.DB, tenant *entities.Tenant) error
	FindByID(ctx context.Context, id int64) (*entities.Tenant, error)
	UpdateBranding(ctx context.Context, tenant *entities.Tenant) error
}
