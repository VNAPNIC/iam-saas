package handler

import (
	"fmt"
	"iam-saas/internal/domain"
	"iam-saas/internal/entities"
	"iam-saas/pkg/app_error"
	"iam-saas/pkg/i18n"
	"iam-saas/pkg/utils"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

type UserHandler struct {
	userService domain.UserService
}

func NewUserHandler(userService domain.UserService) *UserHandler {
	return &UserHandler{userService: userService}
}

// --- Request Structs ---
type loginRequest struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required,min=8"`
}

type loginResponse struct {
	AccessToken  string          `json:"accessToken"`
	RefreshToken string          `json:"refreshToken"`
	User         *entities.User  `json:"user"`
	IsOnboarded  bool            `json:"isOnboarded"`
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

// --- Handlers ---

func (h *UserHandler) Login(c *gin.Context) {
	var req loginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		h.handleError(c, app_error.NewInvalidInputError(err.Error()))
		return
	}
	user, accessToken, refreshToken, err := h.userService.Login(c.Request.Context(), req.Email, req.Password)
	if err != nil {
		h.handleError(c, err)
		return
	}
	tenant, err := h.userService.GetTenantConfig(c.Request.Context(), user.TenantKey)
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
	user, accessToken, refreshToken, err := h.userService.Register(c.Request.Context(), req.Name, req.Email, req.Password, req.TenantKey)
	if err != nil {
		h.handleError(c, err)
		return
	}
	c.JSON(http.StatusCreated, NewSuccessResponse(gin.H{"accessToken": accessToken, "refreshToken": refreshToken, "user": user}, string(i18n.RegisterSuccessful)))
}

type createTenantRequest struct {
	Name string `json:"name" binding:"required"`
	Key  string `json:"key" binding:"required"`
}

func (h *UserHandler) CreateTenant(c *gin.Context) {
	var req createTenantRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		h.handleError(c, app_error.NewInvalidInputError(err.Error()))
		return
	}
	tenant, err := h.userService.CreateTenant(c.Request.Context(), req.Name, req.Key)
	if err != nil {
		h.handleError(c, err)
		return
	}
	c.JSON(http.StatusCreated, NewSuccessResponse(tenant, string(i18n.ActionSuccessful)))
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
	accessToken, newRefreshToken, err := h.userService.RefreshToken(c.Request.Context(), req.RefreshToken)
	if err != nil {
		h.handleError(c, err)
		return
	}
	c.JSON(http.StatusOK, NewSuccessResponse(gin.H{"accessToken": accessToken, "refreshToken": newRefreshToken}, string(i18n.ActionSuccessful)))
}

func (h *UserHandler) ForgotPassword(c *gin.Context) {
	var req forgotPasswordRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		h.handleError(c, app_error.NewInvalidInputError(err.Error()))
		return
	}
	if err := h.userService.ForgotPassword(c.Request.Context(), req.Email); err != nil {
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
	if err := h.userService.ResetPassword(c.Request.Context(), req.Token, req.NewPassword); err != nil {
		h.handleError(c, err)
		return
	}

	// Revoke all refresh tokens for the user after password reset
	user, err := h.userService.GetMe(c.Request.Context(), c.MustGet(AuthPayloadKey).(*utils.Claims).UserID)
	if err == nil && user != nil {
		if err := h.userService.RevokeRefreshTokens(c.Request.Context(), user.ID); err != nil {
			// Log the error, but don't block the main flow
			fmt.Printf("Error revoking refresh tokens for user %d: %v\n", user.ID, err)
		}
	}

	c.JSON(http.StatusOK, NewSuccessResponse(nil, string(i18n.ActionSuccessful)))
}


func (h *UserHandler) ListUsers(c *gin.Context) {
	claims := c.MustGet(AuthPayloadKey).(*utils.Claims)
	users, err := h.userService.ListUsers(c.Request.Context(), claims.TenantID)
	if err != nil {
		h.handleError(c, err)
		return
	}
	c.JSON(http.StatusOK, NewSuccessResponse(users, string(i18n.ActionSuccessful)))
}

func (h *UserHandler) InviteUser(c *gin.Context) {
	claims := c.MustGet(AuthPayloadKey).(*utils.Claims)
	var req inviteUserRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		h.handleError(c, app_error.NewInvalidInputError(err.Error()))
		return
	}
	user, err := h.userService.InviteUser(c.Request.Context(), claims.UserID, claims.TenantID, req.Name, req.Email)
	if err != nil {
		h.handleError(c, err)
		return
	}
	c.JSON(http.StatusCreated, NewSuccessResponse(user, string(i18n.ActionSuccessful)))
}

func (h *UserHandler) GetMe(c *gin.Context) {
	claims := c.MustGet(AuthPayloadKey).(*utils.Claims)
	user, err := h.userService.GetMe(c.Request.Context(), claims.UserID)
	if err != nil {
		h.handleError(c, err)
		return
	}
	c.JSON(http.StatusOK, NewSuccessResponse(user, string(i18n.ActionSuccessful)))
}

func (h *UserHandler) UpdateUser(c *gin.Context) {
	claims := c.MustGet(AuthPayloadKey).(*utils.Claims)
	userID, _ := strconv.ParseInt(c.Param("id"), 10, 64)
	var req updateUserRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		h.handleError(c, app_error.NewInvalidInputError(err.Error()))
		return
	}
	user, err := h.userService.UpdateUser(c.Request.Context(), userID, req.Name, claims.TenantID)
	if err != nil {
		h.handleError(c, err)
		return
	}

	// Revoke all refresh tokens for the user after profile update
	if user != nil {
		if err := h.userService.RevokeRefreshTokens(c.Request.Context(), user.ID); err != nil {
			fmt.Printf("Error revoking refresh tokens for user %d: %v\n", user.ID, err)
		}
	}

	c.JSON(http.StatusOK, NewSuccessResponse(user, string(i18n.ActionSuccessful)))
}

func (h *UserHandler) DeleteUser(c *gin.Context) {
	claims := c.MustGet(AuthPayloadKey).(*utils.Claims)
	userID, _ := strconv.ParseInt(c.Param("id"), 10, 64)
	if err := h.userService.DeleteUser(c.Request.Context(), userID, claims.TenantID); err != nil {
		h.handleError(c, err)
		return
	}

	// Revoke all refresh tokens for the user after deletion
	if err := h.userService.RevokeRefreshTokens(c.Request.Context(), userID); err != nil {
		fmt.Printf("Error revoking refresh tokens for user %d: %v\n", userID, err)
	}

	c.JSON(http.StatusOK, NewSuccessResponse(nil, string(i18n.ActionSuccessful)))
}

func (h *UserHandler) AcceptInvitation(c *gin.Context) {
	var req acceptInvitationRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		h.handleError(c, app_error.NewInvalidInputError(err.Error()))
		return
	}
	if err := h.userService.AcceptInvitation(c.Request.Context(), req.Token, req.Password); err != nil {
		h.handleError(c, err)
		return
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
	if err := h.userService.VerifyEmail(c.Request.Context(), req.Token); err != nil {
		h.handleError(c, err)
		return
	}
	c.JSON(http.StatusOK, NewSuccessResponse(nil, string(i18n.EmailVerificationSuccessful)))
}

func (h *UserHandler) GetTenantConfig(c *gin.Context) {
	tenantKey := c.Param("tenantKey")
	tenant, err := h.userService.GetTenantConfig(c.Request.Context(), tenantKey)
	if err != nil {
		h.handleError(c, err)
		return
	}
	c.JSON(http.StatusOK, NewSuccessResponse(tenant, string(i18n.ActionSuccessful)))
}

type updateTenantBrandingRequest struct {
	LogoURL           *string `json:"logoUrl"`
	PrimaryColor      *string `json:"primaryColor"`
	AllowPublicSignup *bool   `json:"allowPublicSignup"`
}

func (h *UserHandler) UpdateTenantBranding(c *gin.Context) {
	claims := c.MustGet(AuthPayloadKey).(*utils.Claims)
	var req updateTenantBrandingRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		h.handleError(c, app_error.NewInvalidInputError(err.Error()))
		return
	}
	tenant, err := h.userService.UpdateTenantBranding(c.Request.Context(), claims.TenantID, req.LogoURL, req.PrimaryColor, *req.AllowPublicSignup)
	if err != nil {
		h.handleError(c, err)
		return
	}
	c.JSON(http.StatusOK, NewSuccessResponse(tenant, string(i18n.ActionSuccessful)))
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
