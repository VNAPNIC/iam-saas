package domain

import (
	"context"
	"iam-saas/internal/entities"
	"time"

	"gorm.io/gorm"
)

type SessionRepository interface {
	Create(ctx context.Context, tx *gorm.DB, session *entities.Session) error
	FindByID(ctx context.Context, id int64) (*entities.Session, error)
	FindByRefreshToken(ctx context.Context, refreshToken string) (*entities.Session, error)
	FindByTenantID(ctx context.Context, tenantID int64, filters SessionFilters) ([]entities.Session, error)
	Update(ctx context.Context, session *entities.Session) error
	Delete(ctx context.Context, id int64) error
	DeleteByUserID(ctx context.Context, userID int64) error
	DeleteByTenantID(ctx context.Context, tenantID int64) error
	DeleteExpiredSessions(ctx context.Context) error
}

type SessionFilters struct {
	UserEmail string
	IPAddress string
	OS        string
	Browser   string
}

type SessionService interface {
	CreateSession(ctx context.Context, userID, tenantID int64, refreshToken, deviceInfo, ipAddress, location string, expiresAt time.Time) (*entities.Session, error)
	GetSession(ctx context.Context, tenantID int64, sessionID int64) (*entities.Session, error)
	ListSessions(ctx context.Context, tenantID int64, filters SessionFilters) ([]entities.Session, error)
	RevokeSession(ctx context.Context, tenantID int64, sessionID int64) error
	RevokeUserSessions(ctx context.Context, tenantID int64, userEmail string) error
	RevokeAllSessions(ctx context.Context, tenantID int64) error
	UpdateSessionActivity(ctx context.Context, refreshToken string) error
	CleanupExpiredSessions(ctx context.Context) error
}