package service

import (
	"context"
	"iam-saas/internal/domain"
	"iam-saas/internal/entities"
	"iam-saas/pkg/app_error"
	"iam-saas/pkg/i18n"
	"iam-saas/pkg/utils"
	"log"
	"time"

	"gorm.io/gorm"
)

type userService struct {
	db                 *gorm.DB
	userRepo           domain.UserRepository
	tenantRepo         domain.TenantRepository
	tokenService       domain.TokenService
	emailServiceFactory *EmailServiceFactory
}

func NewUserService(db *gorm.DB, userRepo domain.UserRepository, tenantRepo domain.TenantRepository, tokenService domain.TokenService, emailServiceFactory *EmailServiceFactory) domain.UserService {
	return &userService{
		db:                 db,
		userRepo:           userRepo,
		tenantRepo:         tenantRepo,
		tokenService:       tokenService,
		emailServiceFactory: emailServiceFactory,
	}
}

func (s *userService) Login(ctx context.Context, tenantKey, email, password, mfaOtp string) (*entities.User, string, string, error) {
	user, err := s.userRepo.FindByEmail(ctx, email)
	if err != nil {
		return nil, "", "", app_error.NewInternalServerError(err)
	}
	if user == nil || !utils.CheckPasswordHash(password, user.PasswordHash) {
		return nil, "", "", app_error.NewUnauthorizedError(string(i18n.LoginFailed))
	}
	
	// Check if user has verified their email
	if user.Status == "pending_verification" {
		return nil, "", "", app_error.NewUnauthorizedError("Email verification required")
	}
	
	if user.Status != "active" {
		return nil, "", "", app_error.NewUnauthorizedError(string(i18n.Unauthorized))
	}

	var tenant *entities.Tenant
	if tenantKey != "" {
		var err error
		tenant, err = s.tenantRepo.FindByID(ctx, user.TenantID)
		if err != nil {
			return nil, "", "", app_error.NewInternalServerError(err)
		}
		if tenant == nil || tenant.Status != "active" || tenant.Domain != tenantKey {
			return nil, "", "", app_error.NewUnauthorizedError(string(i18n.Unauthorized))
		}
	} else {
		var err error
		tenant, err = s.tenantRepo.FindByID(ctx, user.TenantID)
		if err != nil {
			return nil, "", "", app_error.NewInternalServerError(err)
		}
		if tenant != nil && tenant.Domain == "system" {
			return nil, "", "", app_error.NewUnauthorizedError(string(i18n.Unauthorized))
		}
	}

	// Check if tenant has completed onboarding
	if !tenant.IsOnboarded {
		return nil, "", "", app_error.NewUnauthorizedError("Tenant onboarding required")
	}

	if user.MFASecret != nil && *user.MFASecret != "" {
		if mfaOtp == "" {
			return nil, "", "", app_error.NewUnauthorizedError(string(i18n.MFARequired))
		}
		if !utils.ValidateMFA(mfaOtp, *user.MFASecret) {
			return nil, "", "", app_error.NewUnauthorizedError(string(i18n.InvalidMFAOTP))
		}
	}

	user.TenantKey = tenant.Domain

	roleIDs, err := s.userRepo.GetUserRoleIDs(ctx, user.ID)
	if err != nil {
		return nil, "", "", app_error.NewInternalServerError(err)
	}
	user.RoleIDs = roleIDs

	accessToken, refreshToken, err := s.tokenService.GenerateNewTokens(ctx, user)
	if err != nil {
		return nil, "", "", app_error.NewInternalServerError(err)
	}

	return user, accessToken, refreshToken, nil
}

func (s *userService) Register(ctx context.Context, name, email, password, tenantDomain string) (*entities.User, string, string, error) {
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

	tenant, err := s.tenantRepo.FindByDomain(ctx, tenantDomain)
	if err != nil {
		return nil, "", "", app_error.NewInternalServerError(err)
	}
	if tenant == nil {
		return nil, "", "", app_error.NewNotFoundError(string(i18n.TenantNotFound))
	}

	userCount, err := s.userRepo.CountUsersInTenant(ctx, tenant.ID)
	if err != nil {
		return nil, "", "", app_error.NewInternalServerError(err)
	}

	if !tenant.AllowPublicSignup && userCount > 0 {
		return nil, "", "", app_error.NewForbiddenError("Public signup is not allowed for this tenant")
	}

	newUser := &entities.User{
		TenantID:     tenant.ID,
		Name:         name,
		Email:        email,
		PasswordHash: hashedPassword,
		Status:       "pending_verification",
	}
	if err := s.userRepo.Create(ctx, nil, newUser); err != nil {
		return nil, "", "", app_error.NewInternalServerError(err)
	}

	roleIDs, err := s.userRepo.GetUserRoleIDs(ctx, newUser.ID)
	if err != nil {
		return nil, "", "", app_error.NewInternalServerError(err)
	}
	newUser.RoleIDs = roleIDs
	newUser.TenantKey = tenant.Domain // Use domain as tenant key

	verificationToken, err := utils.GenerateVerificationToken(newUser.ID)
	if err != nil {
		return nil, "", "", app_error.NewInternalServerError(err)
	}
	
	// Save the verification token to the user
	if err := s.userRepo.SetVerificationToken(ctx, newUser.ID, verificationToken); err != nil {
		return nil, "", "", app_error.NewInternalServerError(err)
	}

	// Get tenant email service
	tenant, err = s.tenantRepo.FindByID(ctx, newUser.TenantID)
	if err != nil {
		log.Printf("Failed to get tenant for user %d: %v", newUser.ID, err)
	} else {
		var emailService domain.EmailService
		emailService, err = s.emailServiceFactory.CreateEmailService(tenant)
		if err != nil {
			log.Printf("Failed to create email service for tenant %d: %v", tenant.ID, err)
		} else {
			// Send verification email
			if err := emailService.SendVerificationEmail(newUser.Email, verificationToken); err != nil {
				// Log error but don't fail registration
				log.Printf("Failed to send verification email to %s: %v", newUser.Email, err)
			}
		}
	}

	return newUser, "", "", nil
}

func (s *userService) InviteUser(ctx context.Context, inviterID, tenantID int64, name, email string, roleIDs []int64) (*entities.User, error) {
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

	// Get inviter information for email
	inviter, err := s.userRepo.FindByID(ctx, inviterID)
	if err != nil {
		return nil, app_error.NewInternalServerError(err)
	}
	if inviter == nil {
		return nil, app_error.NewNotFoundError("inviter not found")
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

	// Assign roles to the new user
	if len(roleIDs) > 0 {
		if err := s.userRepo.AssignRolesToUser(ctx, nil, newUser.ID, roleIDs); err != nil {
			return nil, app_error.NewInternalServerError(err)
		}
	}

	// Get tenant email service
	tenant, err = s.tenantRepo.FindByID(ctx, tenantID)
	if err != nil {
		return nil, app_error.NewInternalServerError(err)
	}
	
	var emailService domain.EmailService
	emailService, err = s.emailServiceFactory.CreateEmailService(tenant)
	if err != nil {
		log.Printf("Failed to create email service for tenant %d: %v", tenant.ID, err)
	} else {
		// Send invitation email
		if err := emailService.SendInvitationEmail(email, invitationToken, inviter.Name, tenant.Name); err != nil {
			// Log error but don't fail the invitation
			log.Printf("Failed to send invitation email to %s: %v", email, err)
		}
	}

	// Log the invitation link to the console instead of sending an email
	// log.Printf("Invitation link for %s: http://localhost:3000/accept-invitation?token=%s", email, invitationToken)

	return newUser, nil
}

func (s *userService) ListUsers(ctx context.Context, tenantID int64) ([]entities.User, error) {
	// Kiểm tra tenant tồn tại
	tenant, err := s.tenantRepo.FindByID(ctx, tenantID)
	if err != nil {
		return nil, app_error.NewInternalServerError(err)
	}
	if tenant == nil {
		return nil, app_error.NewNotFoundError("tenant not found")
	}

	return s.userRepo.ListByTenant(ctx, tenantID)
}

func (s *userService) UpdateUser(ctx context.Context, userID int64, name string, tenantID int64) (*entities.User, error) {
	// Kiểm tra tenant tồn tại
	tenant, err := s.tenantRepo.FindByID(ctx, tenantID)
	if err != nil {
		return nil, app_error.NewInternalServerError(err)
	}
	if tenant == nil {
		return nil, app_error.NewNotFoundError("tenant not found")
	}

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

	// Revoke all refresh tokens for the user after profile update
	if err := s.tokenService.RevokeAllUserTokens(ctx, user.ID); err != nil {
		log.Printf("Error revoking refresh tokens for user %d: %v", user.ID, err)
	}

	return user, nil
}

func (s *userService) DeleteUser(ctx context.Context, userID int64, tenantID int64) error {
	// Kiểm tra tenant tồn tại
	tenant, err := s.tenantRepo.FindByID(ctx, tenantID)
	if err != nil {
		return app_error.NewInternalServerError(err)
	}
	if tenant == nil {
		return app_error.NewNotFoundError("tenant not found")
	}

	user, err := s.userRepo.FindByID(ctx, userID)
	if err != nil {
		return app_error.NewInternalServerError(err)
	}
	if user == nil || user.TenantID != tenantID {
		return app_error.NewNotFoundError("user not found or not in tenant")
	}

	if err := s.tokenService.RevokeAllUserTokens(ctx, userID); err != nil {
		log.Printf("Failed to revoke tokens for user %d during deletion: %v", userID, err)
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

func (s *userService) GetUserByVerificationToken(ctx context.Context, token string) (*entities.User, error) {
	user, err := s.userRepo.FindUserByVerificationToken(ctx, token)
	if err != nil {
		return nil, app_error.NewInternalServerError(err)
	}
	if user == nil {
		return nil, app_error.NewNotFoundError("user not found")
	}
	return user, nil
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
		// For security reasons, we don't reveal if the email exists or not
		return nil
	}
	token, _ := utils.GenerateRandomString(32)
	expiresAt := time.Now().Add(time.Hour * 1)
	if err := s.userRepo.SetPasswordResetToken(ctx, user.ID, token, expiresAt); err != nil {
		return app_error.NewInternalServerError(err)
	}
	
	// Get tenant email service
	tenant, err := s.tenantRepo.FindByID(ctx, user.TenantID)
	if err != nil {
		return app_error.NewInternalServerError(err)
	}
	
	var emailService domain.EmailService
	emailService, err = s.emailServiceFactory.CreateEmailService(tenant)
	if err != nil {
		log.Printf("Failed to create email service for tenant %d: %v", tenant.ID, err)
		return app_error.NewInternalServerError(err)
	}

	// Send password reset email
	if err := emailService.SendPasswordResetEmail(user.Email, token); err != nil {
		// Log error but don't fail the request
		log.Printf("Failed to send password reset email to %s: %v", user.Email, err)
	}
	
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

	if err := s.tokenService.RevokeAllUserTokens(ctx, user.ID); err != nil {
		log.Printf("Failed to revoke tokens for user %d after password reset: %v", user.ID, err)
	}
	return nil
}

func (s *userService) GetUserByPasswordResetToken(ctx context.Context, token string) (*entities.User, error) {
	user, err := s.userRepo.FindByPasswordResetToken(ctx, token)
	if err != nil {
		return nil, app_error.NewInternalServerError(err)
	}
	if user == nil {
		return nil, app_error.NewNotFoundError("user not found")
	}
	return user, nil
}

func (s *userService) AcceptInvitation(ctx context.Context, token, password string) error {
	hashedPassword, err := utils.HashPassword(password)
	if err != nil {
		return app_error.NewInternalServerError(err)
	}
	return s.userRepo.AcceptInvitation(ctx, token, hashedPassword)
}

func (s *userService) RefreshToken(ctx context.Context, refreshToken string) (string, string, error) {
	newAccessToken, newRefreshToken, err := s.tokenService.RefreshToken(ctx, refreshToken)
	if err != nil {
		return "", "", app_error.NewUnauthorizedError(err.Error())
	}

	return newAccessToken, newRefreshToken, nil
}

func (s *userService) RevokeRefreshTokens(ctx context.Context, userID int64) error {
	return s.tokenService.RevokeAllUserTokens(ctx, userID)
}

func (s *userService) CreateTenant(ctx context.Context, name, domain string) (*entities.Tenant, error) {
	// Check if a tenant with the given domain already exists
	existingTenant, err := s.tenantRepo.FindByDomain(ctx, domain)
	if err != nil {
		return nil, app_error.NewInternalServerError(err)
	}
	if existingTenant != nil {
		return nil, app_error.NewConflictError("domain", string(i18n.TenantDomainAlreadyExists))
	}

	newTenant := &entities.Tenant{
		Name:   name,
		Domain: domain,
		Status: "active", // New tenants are active by default
	}

	if err := s.tenantRepo.Create(ctx, nil, newTenant); err != nil {
		return nil, app_error.NewInternalServerError(err)
	}

	return newTenant, nil
}

func (s *userService) GetTenantConfig(ctx context.Context, tenantKey string) (*entities.Tenant, error) {
	tenant, err := s.tenantRepo.FindByDomain(ctx, tenantKey)
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

func (s *userService) EnableMFA(ctx context.Context, userID int64) (string, error) {
	user, err := s.userRepo.FindByID(ctx, userID)
	if err != nil {
		return "", app_error.NewInternalServerError(err)
	}
	if user == nil {
		return "", app_error.NewNotFoundError("user not found")
	}

	// Generate a new MFA secret
	mfaSecret, qrCodeURL, err := utils.GenerateMFASecret(user.Email)
	if err != nil {
		return "", app_error.NewInternalServerError(err)
	}

	// Save the MFA secret to the user record
	if err := s.userRepo.UpdateMFASecret(ctx, userID, mfaSecret); err != nil {
		return "", app_error.NewInternalServerError(err)
	}

	return qrCodeURL, nil
}

func (s *userService) VerifyMFA(ctx context.Context, userID int64, otp string) error {
	user, err := s.userRepo.FindByID(ctx, userID)
	if err != nil {
		return app_error.NewInternalServerError(err)
	}
	if user == nil || user.MFASecret == nil {
		return app_error.NewInvalidInputError("MFA not enabled for this user")
	}

	if !utils.ValidateMFA(otp, *user.MFASecret) {
		return app_error.NewUnauthorizedError("Invalid OTP")
	}

	// Mark MFA as verified/enabled in user record if needed
	return nil
}

func (s *userService) DisableMFA(ctx context.Context, userID int64) error {
	user, err := s.userRepo.FindByID(ctx, userID)
	if err != nil {
		return app_error.NewInternalServerError(err)
	}
	if user == nil {
		return app_error.NewNotFoundError("user not found")
	}

	// Clear the MFA secret from the user record
	if err := s.userRepo.UpdateMFASecret(ctx, userID, ""); err != nil {
		return app_error.NewInternalServerError(err)
	}

	return nil
}

// GetUserByResetToken gets a user by password reset token
func (s *userService) GetUserByResetToken(ctx context.Context, token string) (*entities.User, error) {
	user, err := s.userRepo.FindByPasswordResetToken(ctx, token)
	if err != nil {
		return nil, app_error.NewInternalServerError(err)
	}
	if user == nil {
		return nil, app_error.NewNotFoundError("user not found")
	}
	return user, nil
}

func (s *userService) GetUserByID(ctx context.Context, userID, tenantID int64) (*entities.User, error) {
	user, err := s.userRepo.FindByID(ctx, userID)
	if err != nil {
		return nil, app_error.NewInternalServerError(err)
	}
	if user == nil || user.TenantID != tenantID {
		return nil, app_error.NewNotFoundError("user not found or not in tenant")
	}
	return user, nil
}

// CreateTenantWithAdmin creates a new tenant with an admin user
func (s *userService) CreateTenantWithAdmin(ctx context.Context, companyName, tenantKey, adminName, adminEmail, adminPassword, plan string) (*entities.Tenant, *entities.User, error) {
	// Check if tenant key already exists
	existingTenant, err := s.tenantRepo.FindByDomain(ctx, tenantKey)
	if err != nil {
		return nil, nil, app_error.NewInternalServerError(err)
	}
	if existingTenant != nil {
		return nil, nil, app_error.NewConflictError("tenantKey", "Tenant key already exists")
	}

	// Check if admin email already exists
	existingUser, err := s.userRepo.FindByEmail(ctx, adminEmail)
	if err != nil {
		return nil, nil, app_error.NewInternalServerError(err)
	}
	if existingUser != nil {
		return nil, nil, app_error.NewConflictError("email", string(i18n.EmailAlreadyExists))
	}

	// Hash admin password
	hashedPassword, err := utils.HashPassword(adminPassword)
	if err != nil {
		return nil, nil, app_error.NewInternalServerError(err)
	}

	// Start transaction
	tx := s.db.Begin()
	if tx.Error != nil {
		return nil, nil, app_error.NewInternalServerError(tx.Error)
	}
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
		}
	}()

	// Create tenant
	newTenant := &entities.Tenant{
		Name:              companyName,
		Domain:            tenantKey,
		Status:            "active",
		AllowPublicSignup: false,
		IsOnboarded:       false,
		UserQuota:         100, // Default quota
	}

	if err := s.tenantRepo.Create(ctx, tx, newTenant); err != nil {
		tx.Rollback()
		return nil, nil, app_error.NewInternalServerError(err)
	}

	// Create admin user
	newUser := &entities.User{
		TenantID:     newTenant.ID,
		Name:         adminName,
		Email:        adminEmail,
		PasswordHash: hashedPassword,
		Status:       "pending_verification",
	}

	if err := s.userRepo.Create(ctx, tx, newUser); err != nil {
		tx.Rollback()
		return nil, nil, app_error.NewInternalServerError(err)
	}

	// Generate verification token
	verificationToken, err := utils.GenerateVerificationToken(newUser.ID)
	if err != nil {
		tx.Rollback()
		return nil, nil, app_error.NewInternalServerError(err)
	}

	// Save verification token
	if err := s.userRepo.SetVerificationToken(ctx, newUser.ID, verificationToken); err != nil {
		tx.Rollback()
		return nil, nil, app_error.NewInternalServerError(err)
	}

	// Commit transaction
	if err := tx.Commit().Error; err != nil {
		return nil, nil, app_error.NewInternalServerError(err)
	}

	// Set tenant key for response
	newUser.TenantKey = newTenant.Domain

	// Send verification email (async, don't fail if email fails)
	go func() {
		emailService, err := s.emailServiceFactory.CreateEmailService(newTenant)
		if err != nil {
			log.Printf("Failed to create email service for tenant %d: %v", newTenant.ID, err)
			return
		}

		if err := emailService.SendVerificationEmail(newUser.Email, verificationToken); err != nil {
			log.Printf("Failed to send verification email to %s: %v", newUser.Email, err)
		}
	}()

	return newTenant, newUser, nil
}

// GetUserPermissions returns user permissions
func (s *userService) GetUserPermissions(ctx context.Context, userID int64) ([]string, error) {
	// TODO: Implement permission retrieval logic
	// This would typically query user roles and return associated permissions
	return []string{}, nil
}

// VerifyEmailToken verifies email verification token
func (s *userService) VerifyEmailToken(ctx context.Context, token string) error {
	// TODO: Implement email token verification logic
	// This is similar to VerifyEmail but with different error handling
	return s.VerifyEmail(ctx, token)
}

// ResendVerificationEmail resends verification email
func (s *userService) ResendVerificationEmail(ctx context.Context, email string) error {
	// TODO: Implement resend verification email logic
	// This would generate a new token and send verification email
	return nil
}