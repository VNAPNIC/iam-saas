package domain

import (
	"context"
	"iam-saas/internal/entities"

	"gorm.io/gorm"
)

type AccessKeyRepository interface {
	CreateGroup(ctx context.Context, tx *gorm.DB, group *entities.AccessKeyGroup) error
	CreateKey(ctx context.Context, tx *gorm.DB, key *entities.AccessKey) error
	ListAccessKeyGroups(ctx context.Context, tenantID int64) ([]entities.AccessKeyGroup, error)
	DeleteKey(ctx context.Context, keyID int64) error
	DeleteGroup(ctx context.Context, groupID int64) error
}

type AccessKeyService interface {
	CreateAccessKeyGroup(ctx context.Context, tenantID int64, name, serviceRole, keyType string) (*entities.AccessKeyGroup, error)
	CreateAccessKey(ctx context.Context, tenantID, groupID int64) (*entities.AccessKey, string, error)
	ListAccessKeyGroups(ctx context.Context, tenantID int64) ([]entities.AccessKeyGroup, error)
	DeleteAccessKey(ctx context.Context, tenantID, keyID int64) error
	DeleteAccessKeyGroup(ctx context.Context, tenantID, groupID int64) error
}
