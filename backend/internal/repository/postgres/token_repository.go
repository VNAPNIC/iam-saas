package postgres

import (
	"context"
	"errors"
	"fmt"
	"iam-saas/internal/domain"
	"iam-saas/internal/entities"
	"time"

	"gorm.io/gorm"
)

type tokenRepository struct {
	db *gorm.DB
}

// NewTokenRepository tạo một instance mới của tokenRepository.
func NewTokenRepository(db *gorm.DB) domain.TokenRepository {
	return &tokenRepository{db: db}
}

// Create lưu một bản ghi token mới vào database.
func (r *tokenRepository) Create(ctx context.Context, token *entities.Token) error {
	return r.db.WithContext(ctx).Create(token).Error
}

// FindByTokenKey tìm một token bằng khóa chính (token_key).
func (r *tokenRepository) FindByTokenKey(ctx context.Context, tokenKey string) (*entities.Token, error) {
	var token entities.Token
	err := r.db.WithContext(ctx).Where("token_key = ?", tokenKey).First(&token).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil
		}
		return nil, err
	}
	return &token, nil
}

// FindByToken tìm một token bằng chuỗi JWT của nó.
func (r *tokenRepository) FindByToken(ctx context.Context, tokenString string) (*entities.Token, error) {
	var token entities.Token
	err := r.db.WithContext(ctx).Where("token = ?", tokenString).First(&token).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil
		}
		return nil, err
	}
	return &token, nil
}

// Revoke đánh dấu một token là đã bị thu hồi bằng cách cập nhật trường revoked_at.
func (r *tokenRepository) Revoke(ctx context.Context, tokenKey string) error {
	now := time.Now()
	result := r.db.WithContext(ctx).Model(&entities.Token{}).
		Where("token_key = ?", tokenKey).
		Update("revoked_at", &now)
	return result.Error
}

// ClearSession xóa một phiên đăng nhập, bao gồm refresh token và các access token liên quan.
func (r *tokenRepository) ClearSession(ctx context.Context, refreshTokenKey string) error {
	return r.db.WithContext(ctx).
		Exec("DELETE FROM tokens WHERE refresh_token = ? OR token_key = ?", refreshTokenKey, refreshTokenKey).Error
}

// ClearAllTokensByUserID xóa tất cả các token của một người dùng.
func (r *tokenRepository) ClearAllTokensByUserID(ctx context.Context, userID int64) error {
	likePattern := fmt.Sprintf("UID_TID_TOKEN:%d:%%", userID)
	return r.db.WithContext(ctx).
		Exec("DELETE FROM tokens WHERE token_key LIKE ? OR refresh_token LIKE ?", likePattern, likePattern).Error
}

// CheckUserAvailability kiểm tra xem tài khoản người dùng có còn hợp lệ hay không.
func (r *tokenRepository) CheckUserAvailability(ctx context.Context, userID int64) (bool, error) {
	var available bool
	err := r.db.WithContext(ctx).Raw(
		"SELECT EXISTS (SELECT 1 FROM users WHERE id = ? AND status = 'active' AND email_verified_at IS NOT NULL)",
		userID,
	).Scan(&available).Error
	return available, err
}
