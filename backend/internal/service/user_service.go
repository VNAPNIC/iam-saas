package service

import (
	"context"
	"iam-saas/internal/domain"
	"iam-saas/internal/entities"
	"iam-saas/pkg/app_error"
	"iam-saas/pkg/i18n"
	"iam-saas/pkg/utils"
	"time"

	"gorm.io/gorm"
)

type userService struct {
	db               *gorm.DB
	userRepo         domain.UserRepository
	tenantRepo       domain.TenantRepository
	refreshTokenRepo domain.RefreshTokenRepository
}

func NewUserService(db *gorm.DB, userRepo domain.UserRepository, tenantRepo domain.TenantRepository, refreshTokenRepo domain.RefreshTokenRepository) domain.UserService {
	return &userService{
		db:               db,
		userRepo:         userRepo,
		tenantRepo:       tenantRepo,
		refreshTokenRepo: refreshTokenRepo,
	}
}

func (s *userService) Login(ctx context.Context, email, password string) (*entities.User, string, string, error) {
	user, err := s.userRepo.FindByEmail(ctx, email)
	if err != nil {
		return nil, "", "", app_error.NewInternalServerError(err)
	}
	if user == nil || !utils.CheckPasswordHash(password, user.PasswordHash) {
		return nil, "", "", app_error.NewUnauthorizedError(string(i18n.LoginFailed))
	}
	if user.Status != "active" {
		return nil, "", "", app_error.NewUnauthorizedError(string(i18n.Unauthorized))
	}
	tenant, err := s.tenantRepo.FindByID(ctx, user.TenantID)
	if err != nil {
		return nil, "", "", app_error.NewInternalServerError(err)
	}
	if tenant == nil || tenant.Status != "active" {
		return nil, "", "", app_error.NewUnauthorizedError(string(i18n.Unauthorized))
	}

	user.TenantKey = tenant.Key // Add tenant key to user object

	roleIDs, err := s.userRepo.GetUserRoleIDs(ctx, user.ID)
	if err != nil {
		return nil, "", "", app_error.NewInternalServerError(err)
	}

	accessToken, err := utils.GenerateAccessToken(user.ID, user.TenantID, tenant.Key, user.Email, roleIDs)
	if err != nil {
		return nil, "", "", app_error.NewInternalServerError(err)
	}

	refreshToken, err := utils.GenerateRefreshToken(user.ID, user.TenantID, tenant.Key, user.Email, roleIDs)
	if err != nil {
		return nil, "", "", app_error.NewInternalServerError(err)
	}

	// Save refresh token to database
	refreshTokenEntity := &entities.RefreshToken{
		Token:     refreshToken,
		UserID:    user.ID,
		ExpiresAt: time.Now().Add(7 * 24 * time.Hour), // 7 days expiration for refresh token
	}
	if err := s.refreshTokenRepo.Create(ctx, s.db, refreshTokenEntity); err != nil {
		return nil, "", "", app_error.NewInternalServerError(err)
	}

	return user, accessToken, refreshToken, nil
}

func (s *userService) Register(ctx context.Context, name, email, password, tenantKey string) (*entities.User, string, string, error) {
	existingUser, err := s.userRepo.FindByEmail(ctx, email)
	if err != nil {
		return nil, "", "", app_error.NewInternalServerError(err)
	}
	if existingUser != nil {
		return nil, "", "", app_error.NewConflictError("email", string(i18n.EmailAlreadyExists))
	}
	hashedPassword, err := utils.HashPassword(password)
	if err != nil {
		return nil, "", "", app_error.NewInternalServerError(err)
	}

	tenant, err := s.tenantRepo.FindByKey(ctx, tenantKey)
	if err != nil {
		return nil, "", "", app_error.NewInternalServerError(err)
	}
	if tenant == nil {
		return nil, "", "", app_error.NewNotFoundError(string(i18n.TenantNotFound))
	}

	newUser := &entities.User{
		TenantID:     tenant.ID,
		Name:         name,
		Email:        email,
		PasswordHash: hashedPassword,
		Status:       "active",
	}
	if err := s.userRepo.Create(ctx, nil, newUser); err != nil {
		return nil, "", "", app_error.NewInternalServerError(err)
	}

	roleIDs, err := s.userRepo.GetUserRoleIDs(ctx, newUser.ID)
	if err != nil {
		return nil, "", "", app_error.NewInternalServerError(err)
	}

	accessToken, err := utils.GenerateAccessToken(newUser.ID, tenant.ID, tenant.Key, newUser.Email, roleIDs)
	if err != nil {
		return nil, "", "", app_error.NewInternalServerError(err)
	}

	refreshToken, err := utils.GenerateRefreshToken(newUser.ID, tenant.ID, tenant.Key, newUser.Email, roleIDs)
	if err != nil {
		return nil, "", "", app_error.NewInternalServerError(err)
	}

	// Save refresh token to database
	refreshTokenEntity := &entities.RefreshToken{
		Token:     refreshToken,
		UserID:    newUser.ID,
		ExpiresAt: time.Now().Add(7 * 24 * time.Hour), // 7 days expiration for refresh token
	}
	if err := s.refreshTokenRepo.Create(ctx, s.db, refreshTokenEntity); err != nil {
		return nil, "", "", app_error.NewInternalServerError(err)
	}

	return newUser, accessToken, refreshToken, nil
}

func (s *userService) RefreshToken(ctx context.Context, refreshToken string) (string, string, error) {
	claims, err := utils.ParseToken(refreshToken)
	if err != nil {
		return "", "", app_error.NewUnauthorizedError("Invalid refresh token")
	}

	// Check if refresh token exists in DB and is not expired
	storedRefreshToken, err := s.refreshTokenRepo.FindByToken(ctx, refreshToken)
	if err != nil || storedRefreshToken == nil || storedRefreshToken.ExpiresAt.Before(time.Now()) {
		return "", "", app_error.NewUnauthorizedError("Invalid or expired refresh token")
	}

	// Revoke the old refresh token
	if err := s.refreshTokenRepo.Delete(ctx, refreshToken); err != nil {
		return "", "", app_error.NewInternalServerError(err)
	}

	roleIDs, err := s.userRepo.GetUserRoleIDs(ctx, claims.UserID)
	if err != nil {
		return "", "", app_error.NewInternalServerError(err)
	}

	// Generate new access and refresh tokens
	newAccessToken, err := utils.GenerateAccessToken(claims.UserID, claims.TenantID, claims.TenantKey, claims.UserEmail, roleIDs)
	if err != nil {
		return "", "", app_error.NewInternalServerError(err)
	}
	newRefreshToken, err := utils.GenerateRefreshToken(claims.UserID, claims.TenantID, claims.TenantKey, claims.UserEmail, roleIDs)
	if err != nil {
		return "", "", app_error.NewInternalServerError(err)
	}

	// Save the new refresh token to database
	newRefreshTokenEntity := &entities.RefreshToken{
		Token:     newRefreshToken,
		UserID:    claims.UserID,
		ExpiresAt: time.Now().Add(7 * 24 * time.Hour), // 7 days expiration for refresh token
	}
	if err := s.refreshTokenRepo.Create(ctx, s.db, newRefreshTokenEntity); err != nil {
		return "", "", app_error.NewInternalServerError(err)
	}

	return newAccessToken, newRefreshToken, nil
}

func (s *userService) RevokeRefreshTokens(ctx context.Context, userID int64) error {
	return s.refreshTokenRepo.DeleteByUserID(ctx, userID)
}

func (s *userService) GetMe(ctx context.Context, userID int64) (*entities.User, error) {
	user, err := s.userRepo.FindByID(ctx, userID)
	if err != nil {
		return nil, app_error.NewInternalServerError(err)
	}
	if user == nil {
		return nil, app_error.NewNotFoundError("user not found")
	}
	return user, nil
}

func (s *userService) ForgotPassword(ctx context.Context, email string) error {
	user, err := s.userRepo.FindByEmail(ctx, email)
	if err != nil || user == nil {
		return nil
	}
	token, _ := utils.GenerateRandomString(32)
	expiresAt := time.Now().Add(time.Hour * 1)
	if err := s.userRepo.SetPasswordResetToken(ctx, user.ID, token, expiresAt); err != nil {
		return app_error.NewInternalServerError(err)
	}
	// log.Printf("Password reset token for %s: %s", user.Email, token)
	return nil
}

func (s *userService) ResetPassword(ctx context.Context, token, newPassword string) error {
	user, err := s.userRepo.FindByPasswordResetToken(ctx, token)
	if err != nil {
		return app_error.NewInternalServerError(err)
	}
	if user == nil || user.PasswordResetTokenExpiresAt == nil || time.Now().After(*user.PasswordResetTokenExpiresAt) {
		return app_error.NewUnauthorizedError("Invalid or expired token")
	}
	hashedPassword, err := utils.HashPassword(newPassword)
	if err != nil {
		return app_error.NewInternalServerError(err)
	}
	if err := s.userRepo.UpdatePassword(ctx, user.ID, hashedPassword); err != nil {
		return app_error.NewInternalServerError(err)
	}
	return nil
}

func (s *userService) ListUsers(ctx context.Context, tenantID int64) ([]entities.User, error) {
	return s.userRepo.ListByTenant(ctx, tenantID)
}

func (s *userService) UpdateUser(ctx context.Context, userID int64, name string, tenantID int64) (*entities.User, error) {
	user, err := s.userRepo.FindByID(ctx, userID)
	if err != nil {
		return nil, app_error.NewInternalServerError(err)
	}
	if user == nil || user.TenantID != tenantID {
		return nil, app_error.NewNotFoundError("user not found or not in tenant")
	}

	user.Name = name
	if err := s.userRepo.Update(ctx, user); err != nil {
		return nil, app_error.NewInternalServerError(err)
	}
	return user, nil
}

func (s *userService) DeleteUser(ctx context.Context, userID int64, tenantID int64) error {
	user, err := s.userRepo.FindByID(ctx, userID)
	if err != nil {
		return app_error.NewInternalServerError(err)
	}
	if user == nil || user.TenantID != tenantID {
		return app_error.NewNotFoundError("user not found or not in tenant")
	}

	return s.userRepo.Delete(ctx, userID, tenantID)
}

func (s *userService) VerifyEmail(ctx context.Context, token string) error {
	user, err := s.userRepo.FindUserByVerificationToken(ctx, token)
	if err != nil {
		return app_error.NewInternalServerError(err)
	}
	if user == nil {
		return app_error.NewUnauthorizedError("Invalid or expired token")
	}
	return s.userRepo.ActivateUser(ctx, user.ID)
}



func (s *userService) InviteUser(ctx context.Context, inviterID, tenantID int64, name, email string) (*entities.User, error) {
	tenant, err := s.tenantRepo.FindByID(ctx, tenantID)
	if err != nil {
		return nil, app_error.NewInternalServerError(err)
	}
	if tenant == nil {
		return nil, app_error.NewNotFoundError("tenant not found")
	}

	users, err := s.userRepo.ListByTenant(ctx, tenantID)
	if err != nil {
		return nil, app_error.NewInternalServerError(err)
	}

	if len(users) >= tenant.UserQuota {
		return nil, app_error.NewConflictError("quota", string(i18n.UserQuotaExceeded))
	}

	existingUser, err := s.userRepo.FindByEmail(ctx, email)
	if err != nil {
		return nil, app_error.NewInternalServerError(err)
	}
	if existingUser != nil {
		return nil, app_error.NewConflictError("email", string(i18n.EmailAlreadyExists))
	}

	invitationToken, err := utils.GenerateRandomString(32)
	if err != nil {
		return nil, app_error.NewInternalServerError(err)
	}

	newUser := &entities.User{
		TenantID:        tenantID,
		Name:            name,
		Email:           email,
		Status:          "pending_invitation",
		InvitationToken: &invitationToken,
	}
	if err := s.userRepo.Create(ctx, nil, newUser); err != nil {
		return nil, app_error.NewInternalServerError(err)
	}

	// In a real application, you would associate the user with the given roles

	// Log the invitation link to the console instead of sending an email
	// log.Printf("Invitation link for %s: http://localhost:3000/accept-invitation?token=%s", email, invitationToken)

	return newUser, nil
}

func (s *userService) AcceptInvitation(ctx context.Context, token, password string) error {
	hashedPassword, err := utils.HashPassword(password)
	if err != nil {
		return app_error.NewInternalServerError(err)
	}
	return s.userRepo.AcceptInvitation(ctx, token, hashedPassword)
}

func (s *userService) CreateTenant(ctx context.Context, name, key string) (*entities.Tenant, error) {
	// Check if a tenant with the given key already exists
	existingTenant, err := s.tenantRepo.FindByKey(ctx, key)
	if err != nil {
		return nil, app_error.NewInternalServerError(err)
	}
	if existingTenant != nil {
		return nil, app_error.NewConflictError("key", string(i18n.TenantKeyAlreadyExists))
	}

	newTenant := &entities.Tenant{
		Name:   name,
		Key:    key,
		Status: "active", // New tenants are active by default
	}

	if err := s.tenantRepo.Create(ctx, nil, newTenant); err != nil {
		return nil, app_error.NewInternalServerError(err)
	}

	return newTenant, nil
}

func (s *userService) GetTenantConfig(ctx context.Context, tenantKey string) (*entities.Tenant, error) {
	tenant, err := s.tenantRepo.FindByKey(ctx, tenantKey)
	if err != nil {
		return nil, app_error.NewInternalServerError(err)
	}
	if tenant == nil {
		return nil, app_error.NewNotFoundError(string(i18n.TenantNotFound))
	}
	return tenant, nil
}

func (s *userService) UpdateTenantBranding(ctx context.Context, tenantID int64, logoURL, primaryColor *string, allowPublicSignup bool) (*entities.Tenant, error) {
	tenant, err := s.tenantRepo.FindByID(ctx, tenantID)
	if err != nil {
		return nil, app_error.NewInternalServerError(err)
	}
	if tenant == nil {
		return nil, app_error.NewNotFoundError(string(i18n.TenantNotFound))
	}

	tenant.LogoURL = logoURL
	tenant.PrimaryColor = primaryColor
	tenant.AllowPublicSignup = allowPublicSignup
	tenant.IsOnboarded = true // Mark as onboarded after branding update

	if err := s.tenantRepo.UpdateBranding(ctx, tenant); err != nil {
		return nil, app_error.NewInternalServerError(err)
	}

	return tenant, nil
}
