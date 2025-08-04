package handler

import (
	"iam-saas/internal/domain"
	"iam-saas/internal/entities"
	"iam-saas/internal/service"
	"iam-saas/pkg/app_error"
	"iam-saas/pkg/i18n"
	"iam-saas/pkg/utils"
	"log"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

type UserHandler struct {
	UserService   domain.UserService
	TenantService domain.TenantService
	EventLogger   *service.EventLogger // Add EventLogger
	EmailService  domain.EmailService  // Add EmailService
}

func NewUserHandler(userService domain.UserService, tenantService domain.TenantService, eventLogger *service.EventLogger, emailService domain.EmailService) *UserHandler {
	return &UserHandler{UserService: userService, TenantService: tenantService, EventLogger: eventLogger, EmailService: emailService}
}

// --- Request Structs ---
type loginRequest struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required,min=8"`
	MFAOTP   string `json:"mfaOtp"`
}

type loginResponse struct {
	AccessToken  string         `json:"accessToken"`
	RefreshToken string         `json:"refreshToken"`
	User         *entities.User `json:"user"`
	IsOnboarded  bool           `json:"isOnboarded"`
}

type refreshTokenResponse struct {
	AccessToken  string `json:"accessToken"`
	RefreshToken string `json:"refreshToken"`
}

type registerRequest struct {
	Name      string `json:"name" binding:"required"`
	Email     string `json:"email" binding:"required,email"`
	Password  string `json:"password" binding:"required,min=8"`
	TenantKey string `json:"tenantKey" binding:"required"`
}

type inviteUserRequest struct {
	Name    string  `json:"name" binding:"required"`
	Email   string  `json:"email" binding:"required,email"`
	RoleIDs []int64 `json:"roleIds"`
}

type forgotPasswordRequest struct {
	Email string `json:"email" binding:"required,email"`
}

type resetPasswordRequest struct {
	Token       string `json:"token" binding:"required"`
	NewPassword string `json:"newPassword" binding:"required,min=8"`
}

type updateUserRequest struct {
	Name string `json:"name" binding:"required"`
}

type acceptInvitationRequest struct {
	Token    string `json:"token" binding:"required"`
	Password string `json:"password" binding:"required,min=8"`
}

type updateTenantRequest struct {
	Name              *string `json:"name"`
	LogoURL           *string `json:"logoUrl"`
	PrimaryColor      *string `json:"primaryColor"`
	AllowPublicSignup bool    `json:"allowPublicSignup"`
}

// --- Handlers ---

func (h *UserHandler) Login(c *gin.Context) {
	var req loginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		h.handleError(c, app_error.NewInvalidInputError(err.Error()))
		return
	}
	tenantKeyVal, _ := c.Get(TenantContextKey)
	tenantKey := tenantKeyVal.(string)
	user, accessToken, refreshToken, err := h.UserService.Login(c.Request.Context(), tenantKey, req.Email, req.Password, req.MFAOTP)
	if err != nil {
		h.handleError(c, err)
		return
	}

	if accessToken == "" {
		c.JSON(http.StatusCreated, NewSuccessResponse(gin.H{"user": user}, "Registration successful. Please check your email to verify your account."))
		return
	}
	tenant, err := h.UserService.GetTenantConfig(c.Request.Context(), user.TenantKey)
	if err != nil {
		h.handleError(c, err)
		return
	}
	c.JSON(http.StatusOK, NewSuccessResponse(loginResponse{accessToken, refreshToken, user, tenant.IsOnboarded}, string(i18n.LoginSuccessful)))
}

func (h *UserHandler) Register(c *gin.Context) {
	var req registerRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		h.handleError(c, app_error.NewInvalidInputError(err.Error()))
		return
	}

	tenantKeyVal, _ := c.Get(TenantContextKey)
	tenantKey := tenantKeyVal.(string)
	user, accessToken, refreshToken, err := h.UserService.Register(c.Request.Context(), req.Name, req.Email, req.Password, tenantKey)
	if err != nil {
		h.handleError(c, err)
		return
	}

	// For registration, we don't return tokens immediately
	// User needs to verify email first
	if accessToken == "" && refreshToken == "" {
		c.JSON(http.StatusCreated, NewSuccessResponse(gin.H{"user": user}, "Registration successful. Please check your email to verify your account."))
		return
	}

	// This shouldn't happen in normal flow, but handle it just in case
	tenant, err := h.UserService.GetTenantConfig(c.Request.Context(), user.TenantKey)
	if err != nil {
		h.handleError(c, err)
		return
	}

	// Log user signup
	if err := h.EventLogger.LogUserSignup(c.Request.Context(), tenant.ID, user.ID, user.Email, c.ClientIP()); err != nil {
		// Log error but don't fail the registration
		log.Printf("Failed to log user signup event for user %d: %v", user.ID, err)
	}

	c.JSON(http.StatusCreated, NewSuccessResponse(loginResponse{accessToken, refreshToken, user, tenant.IsOnboarded}, string(i18n.RegisterSuccessful)))
}



type refreshTokenRequest struct {
	RefreshToken string `json:"refreshToken" binding:"required"`
}

func (h *UserHandler) RefreshToken(c *gin.Context) {
	var req refreshTokenRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		h.handleError(c, app_error.NewInvalidInputError(err.Error()))
		return
	}
	accessToken, refreshToken, err := h.UserService.RefreshToken(c.Request.Context(), req.RefreshToken)
	if err != nil {
		h.handleError(c, err)
		return
	}
	c.JSON(http.StatusOK, NewSuccessResponse(refreshTokenResponse{accessToken, refreshToken}, string(i18n.ActionSuccessful)))
}

func (h *UserHandler) ForgotPassword(c *gin.Context) {
	var req forgotPasswordRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		h.handleError(c, app_error.NewInvalidInputError(err.Error()))
		return
	}
	if err := h.UserService.ForgotPassword(c.Request.Context(), req.Email); err != nil {
		h.handleError(c, err)
		return
	}
	c.JSON(http.StatusOK, NewSuccessResponse(nil, string(i18n.ActionSuccessful)))
}

func (h *UserHandler) ResetPassword(c *gin.Context) {
	var req resetPasswordRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		h.handleError(c, app_error.NewInvalidInputError(err.Error()))
		return
	}
	if err := h.UserService.ResetPassword(c.Request.Context(), req.Token, req.NewPassword); err != nil {
		h.handleError(c, err)
		return
	}

	// Revoke all refresh tokens for the user after password reset
	// The user ID should be extracted from the reset token, not the auth payload
	// For now, this part is commented out as it requires changes in the service layer
	// user, err := h.UserService.GetMe(c.Request.Context(), c.MustGet(AuthPayloadKey).(*utils.Claims).UserID)
	// if err == nil && user != nil {
	// 	if err := h.UserService.RevokeRefreshTokens(c.Request.Context(), user.ID); err != nil {
	// 		// Log the error, but don't block the main flow
	// 		fmt.Printf("Error revoking refresh tokens for user %d: %v\n", user.ID, err)
	// 	}
	// }

	// Get user info to log the event
	user, err := h.UserService.GetUserByResetToken(c.Request.Context(), req.Token)
	if err == nil && user != nil {
		tenant, _ := h.UserService.GetTenantConfig(c.Request.Context(), user.TenantKey)
		if tenant != nil {
			if err := h.EventLogger.LogEvent(c.Request.Context(), tenant.ID, user.ID, user.Email, c.ClientIP(), "PASSWORD_RESET", "success", "info", "Password reset completed"); err != nil {
				// Log error but don't fail the password reset
				log.Printf("Failed to log password reset event for user %d: %v", user.ID, err)
			}
		}
	}

	c.JSON(http.StatusOK, NewSuccessResponse(nil, string(i18n.ActionSuccessful)))
}

func (h *UserHandler) ListUsers(c *gin.Context) {
	claims := c.MustGet(AuthPayloadKey).(*utils.Claims)
	users, err := h.UserService.ListUsers(c.Request.Context(), claims.TenantID)
	if err != nil {
		h.handleError(c, err)
		return
	}
	c.JSON(http.StatusOK, NewSuccessResponse(users, string(i18n.ActionSuccessful)))
}

func (h *UserHandler) GetUser(c *gin.Context) {
	userID, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		h.handleError(c, app_error.NewInvalidInputError(err.Error()))
		return
	}
	claims := c.MustGet(AuthPayloadKey).(*utils.Claims)
	user, err := h.UserService.GetUserByID(c.Request.Context(), userID, claims.TenantID)
	if err != nil {
		h.handleError(c, err)
		return
	}
	c.JSON(http.StatusOK, NewSuccessResponse(user, string(i18n.ActionSuccessful)))
}

func (h *UserHandler) InviteUser(c *gin.Context) {
	claims := c.MustGet(AuthPayloadKey).(*utils.Claims)
	var req inviteUserRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		h.handleError(c, app_error.NewInvalidInputError(err.Error()))
		return
	}
	user, err := h.UserService.InviteUser(c.Request.Context(), claims.UserID, claims.TenantID, req.Name, req.Email, req.RoleIDs)
	if err != nil {
		h.handleError(c, err)
		return
	}
	c.JSON(http.StatusCreated, NewSuccessResponse(user, string(i18n.ActionSuccessful)))
}

func (h *UserHandler) GetMe(c *gin.Context) {
	claims := c.MustGet(AuthPayloadKey).(*utils.Claims)
	user, err := h.UserService.GetMe(c.Request.Context(), claims.UserID)
	if err != nil {
		h.handleError(c, err)
		return
	}
	c.JSON(http.StatusOK, NewSuccessResponse(user, string(i18n.ActionSuccessful)))
}

func (h *UserHandler) UpdateMe(c *gin.Context) {
	claims := c.MustGet(AuthPayloadKey).(*utils.Claims)
	userID, _ := strconv.ParseInt(c.Param("id"), 10, 64)
	var req updateUserRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		h.handleError(c, app_error.NewInvalidInputError(err.Error()))
		return
	}
	user, err := h.UserService.UpdateUser(c.Request.Context(), userID, req.Name, claims.TenantID)
	if err != nil {
		h.handleError(c, err)
		return
	}

	// Log the update event
	tenant, _ := h.TenantService.GetTenantConfig(c.Request.Context(), user.TenantKey)
	if tenant != nil {
		if err := h.EventLogger.LogEvent(c.Request.Context(), tenant.ID, user.ID, user.Email, c.ClientIP(), "USER_PROFILE_UPDATE", "success", "info", "User profile updated"); err != nil {
			// Log error but don't fail the profile update
			log.Printf("Failed to log user profile update event for user %d: %v", user.ID, err)
		}
	}

	c.JSON(http.StatusOK, NewSuccessResponse(user, string(i18n.ActionSuccessful)))
}

func (h *UserHandler) DeleteUser(c *gin.Context) {
	userID, _ := strconv.ParseInt(c.Param("id"), 10, 64)
	claims := c.MustGet(AuthPayloadKey).(*utils.Claims)
	if err := h.UserService.DeleteUser(c.Request.Context(), userID, claims.TenantID); err != nil {
		h.handleError(c, err)
		return
	}

		// Log the delete event
	tenant, _ := h.TenantService.GetTenantConfig(c.Request.Context(), claims.TenantKey)
	if tenant != nil {
		if err := h.EventLogger.LogEvent(c.Request.Context(), tenant.ID, userID, claims.UserEmail, c.ClientIP(), "USER_DELETION", "success", "info", "User deleted"); err != nil {
			// Log error but don't fail the deletion
			log.Printf("Failed to log user deletion event for user %d: %v", userID, err)
		}
	}

	c.JSON(http.StatusOK, NewSuccessResponse(nil, string(i18n.ActionSuccessful)))
}

func (h *UserHandler) AcceptInvitation(c *gin.Context) {
	var req acceptInvitationRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		h.handleError(c, app_error.NewInvalidInputError(err.Error()))
		return
	}
	if err := h.UserService.AcceptInvitation(c.Request.Context(), req.Token, req.Password); err != nil {
		h.handleError(c, err)
		return
	}

	// Get user info to log the event
	// We can't easily get user info here since the token is consumed
	// when accepting the invitation. We'll skip detailed logging for now.
	// In a real implementation, you might want to store additional info
	// in the token or use a different approach for logging.
	if err := h.EventLogger.LogEvent(c.Request.Context(), 0, 0, "", c.ClientIP(), "INVITATION_ACCEPTANCE", "success", "info", "User accepted invitation"); err != nil {
		// Log error but don't fail the invitation acceptance
		log.Printf("Failed to log invitation acceptance event: %v", err)
	}

	c.JSON(http.StatusOK, NewSuccessResponse(nil, string(i18n.ActionSuccessful)))
}

type verifyEmailRequest struct {
	Token string `json:"token" binding:"required"`
}

func (h *UserHandler) VerifyEmail(c *gin.Context) {
	var req verifyEmailRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		h.handleError(c, app_error.NewInvalidInputError(err.Error()))
		return
	}
	if err := h.UserService.VerifyEmail(c.Request.Context(), req.Token); err != nil {
		h.handleError(c, err)
		return
	}

	// Get user info to log the event
	user, err := h.UserService.GetUserByVerificationToken(c.Request.Context(), req.Token)
	if err == nil && user != nil {
		tenant, _ := h.UserService.GetTenantConfig(c.Request.Context(), user.TenantKey)
		if tenant != nil {
			if err := h.EventLogger.LogEvent(c.Request.Context(), tenant.ID, user.ID, user.Email, c.ClientIP(), "EMAIL_VERIFICATION", "success", "info", "Email verified successfully"); err != nil {
				// Log error but don't fail the email verification
				log.Printf("Failed to log email verification event for user %d: %v", user.ID, err)
			}
		}
	}

	c.JSON(http.StatusOK, NewSuccessResponse(nil, string(i18n.ActionSuccessful)))
}

func (h *UserHandler) GetTenantConfig(c *gin.Context) {
	tenantKey := c.Param("tenantKey")
	tenant, err := h.UserService.GetTenantConfig(c.Request.Context(), tenantKey)
	if err != nil {
		h.handleError(c, err)
		return
	}
	c.JSON(http.StatusOK, NewSuccessResponse(tenant, string(i18n.ActionSuccessful)))
}

func (h *UserHandler) UpdateTenantBranding(c *gin.Context) {
	var req updateTenantRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		h.handleError(c, app_error.NewInvalidInputError(err.Error()))
		return
	}
	tenantKeyVal, _ := c.Get(TenantContextKey)
	tenantKey := tenantKeyVal.(string)
	tenant, err := h.TenantService.GetTenantConfig(c.Request.Context(), tenantKey)
	if err != nil {
		h.handleError(c, err)
		return
	}

	// Update tenant name if provided
	if req.Name != nil {
		tenant, err = h.TenantService.UpdateTenantName(c.Request.Context(), tenant.ID, *req.Name)
		if err != nil {
			h.handleError(c, err)
			return
		}
	}

	// Update other branding settings
	tenant, err = h.TenantService.UpdateTenantBranding(c.Request.Context(), tenant.ID, req.LogoURL, req.PrimaryColor, req.AllowPublicSignup)
	if err != nil {
		h.handleError(c, err)
		return
	}
	c.JSON(http.StatusOK, NewSuccessResponse(tenant, string(i18n.ActionSuccessful)))
}

type verifyMfaRequest struct {
	OTP string `json:"otp" binding:"required"`
}

func (h *UserHandler) EnableMFA(c *gin.Context) {
	claims := c.MustGet(AuthPayloadKey).(*utils.Claims)
	qrCodeURL, err := h.UserService.EnableMFA(c.Request.Context(), claims.UserID)
	if err != nil {
		h.handleError(c, err)
		return
	}
	c.JSON(http.StatusOK, NewSuccessResponse(gin.H{"qrCodeURL": qrCodeURL}, string(i18n.ActionSuccessful)))
}

func (h *UserHandler) VerifyMFA(c *gin.Context) {
	claims := c.MustGet(AuthPayloadKey).(*utils.Claims)
	var req verifyMfaRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		h.handleError(c, app_error.NewInvalidInputError(err.Error()))
		return
	}
	if err := h.UserService.VerifyMFA(c.Request.Context(), claims.UserID, req.OTP); err != nil {
		h.handleError(c, err)
		return
	}
	c.JSON(http.StatusOK, NewSuccessResponse(nil, string(i18n.ActionSuccessful)))
}

func (h *UserHandler) DisableMFA(c *gin.Context) {
	if err := h.UserService.DisableMFA(c.Request.Context(), c.MustGet(AuthPayloadKey).(*utils.Claims).UserID); err != nil {
		h.handleError(c, err)
		return
	}
	c.JSON(http.StatusOK, NewSuccessResponse(nil, string(i18n.ActionSuccessful)))
}

func (h *UserHandler) handleError(c *gin.Context, err error) {
	if appErr, ok := err.(*app_error.AppError); ok {
		response := NewErrorResponse(appErr.Message, string(appErr.Code), nil)
		c.JSON(appErr.GetStatusCode(), response)
	} else {
		response := NewErrorResponse(string(i18n.InternalServerError), string(app_error.CodeInternalError), err.Error())
		c.JSON(http.StatusInternalServerError, response)
	}
}

// HỆ THỐNG 2: Tenant IAM endpoints cho End-Users

// TenantLogin handles End-User login for specific tenant
func (h *UserHandler) TenantLogin(c *gin.Context) {
	var req struct {
		Email    string `json:"email" binding:"required,email"`
		Password string `json:"password" binding:"required"`
		MFAOTP   string `json:"mfaOtp"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Get tenant from context (set by TenantPathMiddleware)
	tenantInterface, exists := c.Get("tenant")
	if !exists {
		c.JSON(http.StatusBadRequest, gin.H{"error": "tenant not found"})
		return
	}

	// Type assertion to get tenant entity
	tenant := tenantInterface.(*entities.Tenant)

	// Use UserService.Login with tenant key
	user, accessToken, refreshToken, err := h.UserService.Login(c.Request.Context(), tenant.Key, req.Email, req.Password, req.MFAOTP)
	if err != nil {
		h.handleError(c, err)
		return
	}

	// Check if user needs email verification (no tokens returned)
	if accessToken == "" {
		c.JSON(http.StatusUnauthorized, gin.H{
			"error": "Email verification required",
			"message": "Please check your email to verify your account before logging in",
		})
		return
	}

	// Get user permissions for response
	permissions, err := h.UserService.GetUserPermissions(c.Request.Context(), user.ID)
	if err != nil {
		// Log error but don't fail login, use empty permissions
		log.Printf("Failed to get user permissions for user %d: %v", user.ID, err)
		permissions = []string{}
	}

	// Log successful login event
	if err := h.EventLogger.LogUserLogin(c.Request.Context(), tenant.ID, user.ID, user.Email, c.ClientIP(), true); err != nil {
		log.Printf("Failed to log user login event for user %d: %v", user.ID, err)
	}

	// Return successful login response
	c.JSON(http.StatusOK, NewSuccessResponse(gin.H{
		"accessToken":  accessToken,
		"refreshToken": refreshToken,
		"user":         user,
		"permissions":  permissions,
		"redirect_url": "/dashboard", // Default redirect for End-Users
	}, "Login successful"))
}

// TenantSignup handles End-User signup for specific tenant
func (h *UserHandler) TenantSignup(c *gin.Context) {
	var req struct {
		Email    string `json:"email" binding:"required,email"`
		Password string `json:"password" binding:"required,min=8"`
		Name     string `json:"name" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"message": "Tenant signup endpoint"})
}

// AuthorizeEndpoint handles OAuth2 authorization requests
func (h *UserHandler) AuthorizeEndpoint(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"message": "OAuth2 authorize endpoint"})
}

// TokenEndpoint handles OAuth2 token exchange
func (h *UserHandler) TokenEndpoint(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"access_token": "example_token"})
}

// UserinfoEndpoint returns user information
func (h *UserHandler) UserinfoEndpoint(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"sub": "user123"})
}

// OpenIDConfiguration returns OIDC discovery document
func (h *UserHandler) OpenIDConfiguration(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"issuer": "https://domain.xyz"})
}

// JWKSEndpoint returns JSON Web Key Set
func (h *UserHandler) JWKSEndpoint(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"keys": []gin.H{}})
}

// HỆ THỐNG 1: Tenant Admin signup và verification endpoints

// TenantAdminSignup handles new tenant admin registration
func (h *UserHandler) TenantAdminSignup(c *gin.Context) {
	var req struct {
		Name            string `json:"name" binding:"required"`
		Email           string `json:"email" binding:"required,email"`
		Password        string `json:"password" binding:"required,min=8"`
		ConfirmPassword string `json:"confirmPassword" binding:"required"`
		CompanyName     string `json:"companyName" binding:"required"`
		TenantKey       string `json:"tenantKey" binding:"required"`
		Plan            string `json:"plan"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		h.handleError(c, app_error.NewInvalidInputError(err.Error()))
		return
	}

	// Validate password confirmation
	if req.Password != req.ConfirmPassword {
		h.handleError(c, app_error.NewInvalidInputError("Passwords do not match"))
		return
	}

	// Validate tenant key format
	if !isValidTenantKey(req.TenantKey) {
		h.handleError(c, app_error.NewInvalidInputError("Tenant key can only contain lowercase letters, numbers, and hyphens"))
		return
	}

	// Create tenant and admin user
	tenant, user, err := h.UserService.CreateTenantWithAdmin(
		c.Request.Context(),
		req.CompanyName,
		req.TenantKey,
		req.Name,
		req.Email,
		req.Password,
		req.Plan,
	)
	if err != nil {
		h.handleError(c, err)
		return
	}

	// Log tenant creation event
	if err := h.EventLogger.LogEvent(c.Request.Context(), tenant.ID, user.ID, user.Email, c.ClientIP(), "TENANT_SIGNUP", "success", "info", "New tenant and admin user created"); err != nil {
		log.Printf("Failed to log tenant signup event for tenant %d: %v", tenant.ID, err)
	}

	c.JSON(http.StatusCreated, NewSuccessResponse(gin.H{
		"tenant": tenant,
		"user":   user,
		"message": "Registration successful! Please check your email to verify your account.",
	}, string(i18n.RegisterSuccessful)))
}

// VerifyEmailToken handles email verification for tenant admin
func (h *UserHandler) VerifyEmailToken(c *gin.Context) {
	var req struct {
		Token string `json:"token" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Verify email token
	err := h.UserService.VerifyEmailToken(c.Request.Context(), req.Token)
	if err != nil {
		h.handleError(c, err)
		return
	}

	// Get user info to log the event
	user, err := h.UserService.GetUserByVerificationToken(c.Request.Context(), req.Token)
	if err == nil && user != nil {
		tenant, _ := h.TenantService.GetTenantConfig(c.Request.Context(), user.TenantKey)
		if tenant != nil {
			if err := h.EventLogger.LogEvent(c.Request.Context(), tenant.ID, user.ID, user.Email, c.ClientIP(), "EMAIL_VERIFICATION", "success", "info", "Email verified successfully"); err != nil {
				log.Printf("Failed to log email verification event for user %d: %v", user.ID, err)
			}
		}
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Email verified successfully",
		"success": true,
	})
}

// ResendVerification resends verification email
func (h *UserHandler) ResendVerification(c *gin.Context) {
	var req struct {
		Email string `json:"email" binding:"required,email"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Resend verification email
	err := h.UserService.ResendVerificationEmail(c.Request.Context(), req.Email)
	if err != nil {
		h.handleError(c, err)
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Verification email sent successfully",
		"email":   req.Email,
	})
}

// Helper function to validate tenant key format
func isValidTenantKey(key string) bool {
	// Only lowercase letters, numbers, and hyphens
	for _, char := range key {
		if !((char >= 'a' && char <= 'z') || (char >= '0' && char <= '9') || char == '-') {
			return false
		}
	}
	return len(key) >= 3 && len(key) <= 50
}
