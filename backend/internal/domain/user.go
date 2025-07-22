package domain

import (
	"context"
	"iam-saas/internal/entities"
	"time"

	"gorm.io/gorm"
)

// UserRepository defines the contract for the User repository layer.
type UserRepository interface {
	Create(ctx context.Context, tx *gorm.DB, user *entities.User) error
	FindByEmail(ctx context.Context, email string) (*entities.User, error)
	FindByID(ctx context.Context, id int64) (*entities.User, error)
	ListByTenant(ctx context.Context, tenantID int64) ([]entities.User, error)
	Update(ctx context.Context, user *entities.User) error
	Delete(ctx context.Context, userID int64) error
	UpdateVerificationToken(ctx context.Context, userID int64, token string) error
	FindUserByVerificationToken(ctx context.Context, token string) (*entities.User, error)
	ActivateUser(ctx context.Context, userID int64) error
	SetPasswordResetToken(ctx context.Context, userID int64, token string, expiresAt time.Time) error
	FindByPasswordResetToken(ctx context.Context, token string) (*entities.User, error)
	UpdatePassword(ctx context.Context, userID int64, newPasswordHash string) error
}

// UserService defines the contract for the User service layer.
type UserService interface {
	Login(ctx context.Context, email, password string) (*entities.User, string, error)
	Register(ctx context.Context, name, email, password, tenantName string) (*entities.User, string, error)
	InviteUser(ctx context.Context, inviterID, tenantID int64, name, email string) (*entities.User, error)
	ListUsers(ctx context.Context, tenantID int64) ([]entities.User, error)
	UpdateUser(ctx context.Context, userID int64, name string) (*entities.User, error)
	DeleteUser(ctx context.Context, userID int64) error
	VerifyEmail(ctx context.Context, token string) error
	GetMe(ctx context.Context, userID int64) (*entities.User, error)
	ForgotPassword(ctx context.Context, email string) error
	ResetPassword(ctx context.Context, token, newPassword string) error
}
