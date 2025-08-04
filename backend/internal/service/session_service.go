package service

import (
	"context"
	"iam-saas/internal/domain"
	"iam-saas/internal/entities"
	"iam-saas/pkg/app_error"
	"time"

	"gorm.io/gorm"
)

type sessionService struct {
	db          *gorm.DB
	sessionRepo domain.SessionRepository
	userRepo    domain.UserRepository
}

func NewSessionService(db *gorm.DB, sessionRepo domain.SessionRepository, userRepo domain.UserRepository) domain.SessionService {
	return &sessionService{db, sessionRepo, userRepo}
}

func (s *sessionService) CreateSession(ctx context.Context, userID, tenantID int64, refreshToken, deviceInfo, ipAddress, location string, expiresAt time.Time) (*entities.Session, error) {
	session := &entities.Session{
		UserID:       userID,
		TenantID:     tenantID,
		RefreshToken: refreshToken,
		DeviceInfo:   deviceInfo,
		IPAddress:    ipAddress,
		Location:     location,
		ExpiresAt:    expiresAt,
		LastActivity: time.Now(),
		IsActive:     true,
	}

	if err := s.sessionRepo.Create(ctx, nil, session); err != nil {
		return nil, app_error.NewInternalServerError(err)
	}

	return session, nil
}

func (s *sessionService) GetSession(ctx context.Context, tenantID int64, sessionID int64) (*entities.Session, error) {
	session, err := s.sessionRepo.FindByID(ctx, sessionID)
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, app_error.NewNotFoundError("Session not found")
		}
		return nil, app_error.NewInternalServerError(err)
	}

	if session.TenantID != tenantID {
		return nil, app_error.NewNotFoundError("Session not found")
	}

	return session, nil
}

func (s *sessionService) ListSessions(ctx context.Context, tenantID int64, filters domain.SessionFilters) ([]entities.Session, error) {
	sessions, err := s.sessionRepo.FindByTenantID(ctx, tenantID, filters)
	if err != nil {
		return nil, app_error.NewInternalServerError(err)
	}

	return sessions, nil
}

func (s *sessionService) RevokeSession(ctx context.Context, tenantID int64, sessionID int64) error {
	session, err := s.GetSession(ctx, tenantID, sessionID)
	if err != nil {
		return err
	}

	session.IsActive = false
	if err := s.sessionRepo.Update(ctx, session); err != nil {
		return app_error.NewInternalServerError(err)
	}

	return nil
}

func (s *sessionService) RevokeUserSessions(ctx context.Context, tenantID int64, userEmail string) error {
	// Find user by email
	user, err := s.userRepo.FindByEmail(ctx, userEmail)
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return app_error.NewNotFoundError("User not found")
		}
		return app_error.NewInternalServerError(err)
	}

	if err := s.sessionRepo.DeleteByUserID(ctx, user.ID); err != nil {
		return app_error.NewInternalServerError(err)
	}

	return nil
}

func (s *sessionService) RevokeAllSessions(ctx context.Context, tenantID int64) error {
	if err := s.sessionRepo.DeleteByTenantID(ctx, tenantID); err != nil {
		return app_error.NewInternalServerError(err)
	}

	return nil
}

func (s *sessionService) UpdateSessionActivity(ctx context.Context, refreshToken string) error {
	session, err := s.sessionRepo.FindByRefreshToken(ctx, refreshToken)
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return app_error.NewNotFoundError("Session not found")
		}
		return app_error.NewInternalServerError(err)
	}

	session.LastActivity = time.Now()
	if err := s.sessionRepo.Update(ctx, session); err != nil {
		return app_error.NewInternalServerError(err)
	}

	return nil
}

func (s *sessionService) CleanupExpiredSessions(ctx context.Context) error {
	if err := s.sessionRepo.DeleteExpiredSessions(ctx); err != nil {
		return app_error.NewInternalServerError(err)
	}

	return nil
}