package domain

import (
	"context"
	"iam-saas/internal/entities"
	"iam-saas/pkg/utils"
)

type TokenService interface {
	GenerateNewTokens(ctx context.Context, user *entities.User) (accessToken string, refreshToken string, err error)
	ValidateToken(ctx context.Context, tokenString string) (*utils.Claims, error)
	RefreshToken(ctx context.Context, oldRefreshTokenString string) (accessToken string, refreshToken string, err error)
	RevokeAllUserTokens(ctx context.Context, userID int64) error
}

type TokenRepository interface {
	Create(ctx context.Context, token *entities.Token) error
	FindByTokenKey(ctx context.Context, tokenKey string) (*entities.Token, error)
	FindByToken(ctx context.Context, tokenString string) (*entities.Token, error)
	Revoke(ctx context.Context, tokenKey string) error
	ClearSession(ctx context.Context, refreshTokenKey string) error
	ClearAllTokensByUserID(ctx context.Context, userID int64) error
	CheckUserAvailability(ctx context.Context, userID int64) (bool, error)
}
