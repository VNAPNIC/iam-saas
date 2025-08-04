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
	UpdateVerificationToken(ctx context.Context, userID int64, token string) error
	FindUserByVerificationToken(ctx context.Context, token string) (*entities.User, error)
	ActivateUser(ctx context.Context, userID int64) error
	SetPasswordResetToken(ctx context.Context, userID int64, token string, expiresAt time.Time) error
	FindByPasswordResetToken(ctx context.Context, token string) (*entities.User, error)
	UpdatePassword(ctx context.Context, userID int64, newPasswordHash string) error
	ListByTenant(ctx context.Context, tenantID int64) ([]entities.User, error)
	Update(ctx context.Context, user *entities.User) error
	Delete(ctx context.Context, userID int64, tenantID int64) error
	AcceptInvitation(ctx context.Context, token, passwordHash string) error
	GetUserRoleIDs(ctx context.Context, userID int64) ([]int64, error)
	UpdateMFASecret(ctx context.Context, userID int64, secret string) error
	AssignRolesToUser(ctx context.Context, tx *gorm.DB, userID int64, roleIDs []int64) error
	SetVerificationToken(ctx context.Context, userID int64, token string) error
	CountUsersInTenant(ctx context.Context, tenantID int64) (int64, error)
}

// UserService defines the contract for the User service layer.
type UserService interface {
	Login(ctx context.Context, tenantKey, email, password, mfaOtp string) (*entities.User, string, string, error)
	Register(ctx context.Context, name, email, password, tenantKey string) (*entities.User, string, string, error)
	InviteUser(ctx context.Context, inviterID, tenantID int64, name, email string, roleIDs []int64) (*entities.User, error)
	ListUsers(ctx context.Context, tenantID int64) ([]entities.User, error)
	UpdateUser(ctx context.Context, userID int64, name string, tenantID int64) (*entities.User, error)
	DeleteUser(ctx context.Context, userID int64, tenantID int64) error
	VerifyEmail(ctx context.Context, token string) error
	VerifyEmailToken(ctx context.Context, token string) error
	ResendVerificationEmail(ctx context.Context, email string) error
	GetUserPermissions(ctx context.Context, userID int64) ([]string, error)
	GetUserByVerificationToken(ctx context.Context, token string) (*entities.User, error)
	GetMe(ctx context.Context, userID int64) (*entities.User, error)
	ForgotPassword(ctx context.Context, email string) error
	ResetPassword(ctx context.Context, token, newPassword string) error
	AcceptInvitation(ctx context.Context, token, password string) error
	RefreshToken(ctx context.Context, refreshToken string) (string, string, error)
	RevokeRefreshTokens(ctx context.Context, userID int64) error
	CreateTenant(ctx context.Context, name, domain string) (*entities.Tenant, error) // Update parameter from key to domain
	GetTenantConfig(ctx context.Context, tenantKey string) (*entities.Tenant, error)
	UpdateTenantBranding(ctx context.Context, tenantID int64, logoURL, primaryColor *string, allowPublicSignup bool) (*entities.Tenant, error)
	
	// MFA methods
	EnableMFA(ctx context.Context, userID int64) (string, error)
	VerifyMFA(ctx context.Context, userID int64, otp string) error
	DisableMFA(ctx context.Context, userID int64) error
	
	// Password reset methods
	GetUserByResetToken(ctx context.Context, token string) (*entities.User, error)
	GetUserByID(ctx context.Context, userID, tenantID int64) (*entities.User, error)
	
	// Tenant admin signup
	CreateTenantWithAdmin(ctx context.Context, companyName, tenantKey, adminName, adminEmail, adminPassword, plan string) (*entities.Tenant, *entities.User, error)
}
