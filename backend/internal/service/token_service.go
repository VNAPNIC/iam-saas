package service

import (
	"context"
	"errors"
	"fmt"
	"iam-saas/internal/domain"
	"iam-saas/internal/entities"
	"iam-saas/pkg/utils"
	"time"
)

const (
	TokenTypeAccess  = "access"
	TokenTypeRefresh = "refresh"
)

type tokenService struct {
	tokenRepo domain.TokenRepository
	userRepo  domain.UserRepository
}

func NewTokenService(tokenRepo domain.TokenRepository, userRepo domain.UserRepository) domain.TokenService {
	return &tokenService{
		tokenRepo: tokenRepo,
		userRepo:  userRepo,
	}
}

func (s *tokenService) GenerateNewTokens(ctx context.Context, user *entities.User) (string, string, error) {
	refreshTokenKey := fmt.Sprintf("UID_TID_TOKEN:%d:%d:refresh", user.ID, user.TenantID)

	if err := s.tokenRepo.ClearSession(ctx, refreshTokenKey); err != nil {
		fmt.Printf("could not clear old session for user %d: %v\n", user.ID, err)
	}

	refreshTokenString, err := utils.GenerateRefreshToken(user.ID, user.TenantID, user.TenantKey, user.Email, user.RoleIDs)
	if err != nil {
		return "", "", fmt.Errorf("could not generate refresh token: %w", err)
	}

	refreshTokenEntity := &entities.Token{
		TokenKey:   refreshTokenKey,
		Token:      refreshTokenString,
		TokenType:  TokenTypeRefresh,
		Expiration: time.Now().Add(utils.GetRefreshTokenExpiry()),
	}
	if err := s.tokenRepo.Create(ctx, refreshTokenEntity); err != nil {
		return "", "", fmt.Errorf("could not save refresh token: %w", err)
	}

	accessTokenKey := fmt.Sprintf("UID_TID_TOKEN:%d:%d:access", user.ID, user.TenantID)
	accessTokenString, err := utils.GenerateAccessToken(user.ID, user.TenantID, user.TenantKey, user.Email, user.RoleIDs)
	if err != nil {
		return "", "", fmt.Errorf("could not generate access token: %w", err)
	}

	accessTokenEntity := &entities.Token{
		TokenKey:     accessTokenKey,
		Token:        accessTokenString,
		RefreshToken: &refreshTokenKey,
		TokenType:    TokenTypeAccess,
		Expiration:   time.Now().Add(utils.GetAccessTokenExpiry()),
	}
	if err := s.tokenRepo.Create(ctx, accessTokenEntity); err != nil {
		return "", "", fmt.Errorf("could not save access token: %w", err)
	}

	return accessTokenString, refreshTokenString, nil
}

func (s *tokenService) ValidateToken(ctx context.Context, tokenString string) (*utils.Claims, error) {
	claims, err := utils.ParseToken(tokenString)
	if err != nil {
		return nil, fmt.Errorf("invalid token: %w", err)
	}

	tokenEntity, err := s.tokenRepo.FindByToken(ctx, tokenString)
	if err != nil {
		return nil, fmt.Errorf("database error while validating token: %w", err)
	}
	if tokenEntity == nil {
		return nil, errors.New("token not found or has been cleared from session")
	}

	if tokenEntity.RevokedAt != nil {
		return nil, errors.New("token has been revoked")
	}

	if tokenEntity.TokenType == TokenTypeAccess {
		if tokenEntity.RefreshToken == nil || *tokenEntity.RefreshToken == "" {
			return nil, errors.New("internal error: access token is not linked to a refresh token")
		}

		parentRefreshToken, err := s.tokenRepo.FindByTokenKey(ctx, *tokenEntity.RefreshToken)
		if err != nil {
			return nil, fmt.Errorf("database error while validating parent token: %w", err)
		}
		if parentRefreshToken == nil {
			return nil, errors.New("session has expired: parent refresh token not found")
		}
		if parentRefreshToken.RevokedAt != nil {
			return nil, errors.New("session has been revoked")
		}
		if time.Now().After(parentRefreshToken.Expiration) {
			return nil, errors.New("session has expired")
		}
	}

	isAvailable, err := s.tokenRepo.CheckUserAvailability(ctx, claims.UserID)
	if err != nil {
		return nil, fmt.Errorf("could not check user availability: %w", err)
	}
	if !isAvailable {
		return nil, errors.New("user account is inactive or disabled")
	}

	return claims, nil
}

func (s *tokenService) RefreshToken(ctx context.Context, oldRefreshTokenString string) (string, string, error) {
	claims, err := s.ValidateToken(ctx, oldRefreshTokenString)
	if err != nil {
		return "", "", fmt.Errorf("invalid refresh token: %w", err)
	}

	if claims.TokenType != TokenTypeRefresh {
		return "", "", errors.New("a non-refresh token cannot be used for refreshing")
	}

	user, err := s.userRepo.FindByID(ctx, claims.UserID)
	if err != nil || user == nil {
		return "", "", errors.New("user associated with the token not found")
	}

	return s.GenerateNewTokens(ctx, user)
}

func (s *tokenService) RevokeAllUserTokens(ctx context.Context, userID int64) error {
	return s.tokenRepo.ClearAllTokensByUserID(ctx, userID)
}
