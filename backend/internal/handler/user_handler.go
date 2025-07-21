package handler

import (
	"errors"
	"iam-saas/internal/domain"
	"iam-saas/pkg/app_error"
	"iam-saas/pkg/i18n"
	"iam-saas/pkg/utils" // Cần import utils để lấy Claims
	"net/http"

	"github.com/gin-gonic/gin"
)

type UserHandler struct {
	userService domain.UserService
}

func NewUserHandler(userService domain.UserService) *UserHandler {
	return &UserHandler{
		userService: userService,
	}
}

// --- Cấu trúc Request Body ---

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

// --- Các phương thức Handler ---

func (h *UserHandler) Login(c *gin.Context) {
	var req loginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response := NewErrorResponse(string(i18n.InvalidInput), string(app_error.CodeInvalidInput), err.Error())
		c.JSON(http.StatusBadRequest, response)
		return
	}

	user, token, err := h.userService.Login(c.Request.Context(), req.Email, req.Password)
	if err != nil {
		h.handleError(c, err) // Sử dụng helper
		return
	}

	response := NewSuccessResponse(gin.H{
		"accessToken": token,
		"user": gin.H{
			"id":    user.ID,
			"name":  user.Name,
			"email": user.Email,
		},
	}, string(i18n.LoginSuccessful))
	c.JSON(http.StatusOK, response)
}

func (h *UserHandler) Register(c *gin.Context) {
	var req registerRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response := NewErrorResponse(string(i18n.InvalidInput), string(app_error.CodeInvalidInput), err.Error())
		c.JSON(http.StatusBadRequest, response)
		return
	}

	user, token, err := h.userService.Register(c.Request.Context(), req.Name, req.Email, req.Password, req.TenantName)
	if err != nil {
		h.handleError(c, err)
		return
	}

	response := NewSuccessResponse(gin.H{
		"accessToken": token,
		"user": gin.H{
			"id":     user.ID,
			"name":   user.Name,
			"email":  user.Email,
			"status": user.Status,
		},
	}, string(i18n.RegisterSuccessful))
	c.JSON(http.StatusCreated, response)
}

func (h *UserHandler) InviteUser(c *gin.Context) {
	payload, exists := c.Get(AuthPayloadKey)
	if !exists {
		h.handleError(c, app_error.NewUnauthorizedError(string(i18n.Unauthorized)))
		return
	}

	authPayload, ok := payload.(*utils.Claims)
	if !ok {
		h.handleError(c, app_error.NewInternalServerError(errors.New("failed to parse auth payload")))
		return
	}

	var req inviteUserRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response := NewErrorResponse(string(i18n.InvalidInput), string(app_error.CodeInvalidInput), err.Error())
		c.JSON(http.StatusBadRequest, response)
		return
	}

	user, err := h.userService.InviteUser(c.Request.Context(), authPayload.UserID, authPayload.TenantID, req.Name, req.Email)
	if err != nil {
		h.handleError(c, err)
		return
	}

	response := NewSuccessResponse(gin.H{
		"user": gin.H{
			"id":     user.ID,
			"name":   user.Name,
			"email":  user.Email,
			"status": user.Status,
		},
	}, string(i18n.ActionSuccessful))
	c.JSON(http.StatusCreated, response)
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
