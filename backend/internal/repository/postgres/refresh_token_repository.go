package postgres

import (
	"context"
	"iam-saas/internal/entities"

	"gorm.io/gorm"
)

type RefreshTokenRepository struct {
	db *gorm.DB
}

func NewRefreshTokenRepository(db *gorm.DB) *RefreshTokenRepository {
	return &RefreshTokenRepository{db: db}
}

func (r *RefreshTokenRepository) Create(ctx context.Context, tx *gorm.DB, refreshToken *entities.RefreshToken) error {
	return tx.WithContext(ctx).Create(refreshToken).Error
}

func (r *RefreshTokenRepository) FindByToken(ctx context.Context, token string) (*entities.RefreshToken, error) {
	var refreshToken entities.RefreshToken
	if err := r.db.WithContext(ctx).Where("token = ?", token).First(&refreshToken).Error; err != nil {
		return nil, err
	}
	return &refreshToken, nil
}

func (r *RefreshTokenRepository) Delete(ctx context.Context, token string) error {
	return r.db.WithContext(ctx).Where("token = ?", token).Delete(&entities.RefreshToken{}).Error
}

func (r *RefreshTokenRepository) DeleteByUserID(ctx context.Context, userID int64) error {
	return r.db.WithContext(ctx).Where("user_id = ?", userID).Delete(&entities.RefreshToken{}).Error
}
