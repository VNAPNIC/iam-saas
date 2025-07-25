package service

import (
	"context"
	"iam-saas/internal/domain"
	"iam-saas/internal/entities"
	"iam-saas/pkg/app_error"
	"iam-saas/pkg/utils"

	"gorm.io/gorm"
)

type accessKeyService struct {
	db            *gorm.DB
	accessKeyRepo domain.AccessKeyRepository
}

func NewAccessKeyService(db *gorm.DB, accessKeyRepo domain.AccessKeyRepository) domain.AccessKeyService {
	return &accessKeyService{db, accessKeyRepo}
}

func (s *accessKeyService) CreateAccessKeyGroup(ctx context.Context, tenantID int64, name, serviceRole, keyType string) (*entities.AccessKeyGroup, error) {
	newGroup := &entities.AccessKeyGroup{
		TenantID:    tenantID,
		Name:        name,
		ServiceRole: serviceRole,
		KeyType:     keyType,
	}

	if err := s.accessKeyRepo.CreateGroup(ctx, nil, newGroup); err != nil {
		return nil, app_error.NewInternalServerError(err)
	}

	return newGroup, nil
}

func (s *accessKeyService) CreateAccessKey(ctx context.Context, tenantID, groupID int64) (*entities.AccessKey, string, error) {
	accessKeyID, err := utils.GenerateRandomString(20)
	if err != nil {
		return nil, "", app_error.NewInternalServerError(err)
	}
	secretKey, err := utils.GenerateRandomString(40)
	if err != nil {
		return nil, "", app_error.NewInternalServerError(err)
	}
	hashedSecretKey, err := utils.HashPassword(secretKey)
	if err != nil {
		return nil, "", app_error.NewInternalServerError(err)
	}

	newKey := &entities.AccessKey{
		GroupID:     groupID,
		AccessKeyID: accessKeyID,
		SecretAccessKeyHash:   hashedSecretKey,
		Status:      "active",
	}

	if err := s.accessKeyRepo.CreateKey(ctx, nil, newKey); err != nil {
		return nil, "", app_error.NewInternalServerError(err)
	}

	return newKey, secretKey, nil
}

func (s *accessKeyService) ListAccessKeyGroups(ctx context.Context, tenantID int64) ([]entities.AccessKeyGroup, error) {
	return s.accessKeyRepo.ListAccessKeyGroups(ctx, tenantID)
}

func (s *accessKeyService) DeleteAccessKey(ctx context.Context, tenantID, keyID int64) error {
	// In a real application, you would verify tenantID ownership
	return s.accessKeyRepo.DeleteKey(ctx, keyID)
}

func (s *accessKeyService) DeleteAccessKeyGroup(ctx context.Context, tenantID, groupID int64) error {
	// In a real application, you would verify tenantID ownership
	return s.accessKeyRepo.DeleteGroup(ctx, groupID)
}
