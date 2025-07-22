package handler

import (
	"iam-saas/internal/domain"
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

type registerRequest struct {
	Name       string `json:"name" binding:"required"`
	Email      string `json:"email" binding:"required,email"`
	Password   string `json:"password" binding:"required,min=8"`
	TenantName string `json:"tenantName" binding:"required"`
}

type inviteUserRequest struct {
	Name  string `json:"name" binding:"required"`
	Email string `json:"email" binding:"required,email"`
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

// --- Handlers ---

func (h *UserHandler) Login(c *gin.Context) {
	var req loginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		h.handleError(c, app_error.NewInvalidInputError(err.Error()))
		return
	}
	user, token, err := h.userService.Login(c.Request.Context(), req.Email, req.Password)
	if err != nil {
		h.handleError(c, err)
		return
	}
	c.JSON(http.StatusOK, NewSuccessResponse(gin.H{"accessToken": token, "user": user}, string(i18n.LoginSuccessful)))
}

func (h *UserHandler) Register(c *gin.Context) {
	var req registerRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		h.handleError(c, app_error.NewInvalidInputError(err.Error()))
		return
	}
	user, token, err := h.userService.Register(c.Request.Context(), req.Name, req.Email, req.Password, req.TenantName)
	if err != nil {
		h.handleError(c, err)
		return
	}
	c.JSON(http.StatusCreated, NewSuccessResponse(gin.H{"accessToken": token, "user": user}, string(i18n.RegisterSuccessful)))
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
	userID, _ := strconv.ParseInt(c.Param("id"), 10, 64)
	var req updateUserRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		h.handleError(c, app_error.NewInvalidInputError(err.Error()))
		return
	}
	user, err := h.userService.UpdateUser(c.Request.Context(), userID, req.Name)
	if err != nil {
		h.handleError(c, err)
		return
	}
	c.JSON(http.StatusOK, NewSuccessResponse(user, string(i18n.ActionSuccessful)))
}

func (h *UserHandler) DeleteUser(c *gin.Context) {
	userID, _ := strconv.ParseInt(c.Param("id"), 10, 64)
	if err := h.userService.DeleteUser(c.Request.Context(), userID); err != nil {
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