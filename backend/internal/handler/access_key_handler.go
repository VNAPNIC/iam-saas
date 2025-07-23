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

type AccessKeyHandler struct {
	accessKeyService domain.AccessKeyService
}

func NewAccessKeyHandler(accessKeyService domain.AccessKeyService) *AccessKeyHandler {
	return &AccessKeyHandler{accessKeyService: accessKeyService}
}

// --- Request Structs ---
type createAccessKeyGroupRequest struct {
	Name        string `json:"name" binding:"required"`
	ServiceRole string `json:"serviceRole" binding:"required"`
	KeyType     string `json:"keyType" binding:"required"`
}

// --- Handlers ---

func (h *AccessKeyHandler) CreateAccessKeyGroup(c *gin.Context) {
	claims := c.MustGet(AuthPayloadKey).(*utils.Claims)
	var req createAccessKeyGroupRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		h.handleError(c, app_error.NewInvalidInputError(err.Error()))
		return
	}

	group, err := h.accessKeyService.CreateAccessKeyGroup(c.Request.Context(), claims.TenantID, req.Name, req.ServiceRole, req.KeyType)
	if err != nil {
		h.handleError(c, err)
		return
	}

	c.JSON(http.StatusCreated, NewSuccessResponse(group, string(i18n.ActionSuccessful)))
}

func (h *AccessKeyHandler) CreateAccessKey(c *gin.Context) {
	claims := c.MustGet(AuthPayloadKey).(*utils.Claims)
	groupID, err := strconv.ParseInt(c.Param("groupId"), 10, 64)
	if err != nil {
		h.handleError(c, app_error.NewInvalidInputError(err.Error()))
		return
	}

	key, secret, err := h.accessKeyService.CreateAccessKey(c.Request.Context(), claims.TenantID, groupID)
	if err != nil {
		h.handleError(c, err)
		return
	}

	c.JSON(http.StatusCreated, NewSuccessResponse(gin.H{"key": key, "secret": secret}, string(i18n.ActionSuccessful)))
}

func (h *AccessKeyHandler) ListAccessKeyGroups(c *gin.Context) {
	claims := c.MustGet(AuthPayloadKey).(*utils.Claims)
	groups, err := h.accessKeyService.ListAccessKeyGroups(c.Request.Context(), claims.TenantID)
	if err != nil {
		h.handleError(c, err)
		return
	}
	c.JSON(http.StatusOK, NewSuccessResponse(groups, string(i18n.ActionSuccessful)))
}

func (h *AccessKeyHandler) DeleteAccessKey(c *gin.Context) {
	claims := c.MustGet(AuthPayloadKey).(*utils.Claims)
	keyID, err := strconv.ParseInt(c.Param("keyId"), 10, 64)
	if err != nil {
		h.handleError(c, app_error.NewInvalidInputError(err.Error()))
		return
	}
	if err := h.accessKeyService.DeleteAccessKey(c.Request.Context(), claims.TenantID, keyID); err != nil {
		h.handleError(c, err)
		return
	}
	c.JSON(http.StatusOK, NewSuccessResponse(nil, string(i18n.ActionSuccessful)))
}

func (h *AccessKeyHandler) DeleteAccessKeyGroup(c *gin.Context) {
	claims := c.MustGet(AuthPayloadKey).(*utils.Claims)
	groupID, err := strconv.ParseInt(c.Param("groupId"), 10, 64)
	if err != nil {
		h.handleError(c, app_error.NewInvalidInputError(err.Error()))
		return
	}
	if err := h.accessKeyService.DeleteAccessKeyGroup(c.Request.Context(), claims.TenantID, groupID); err != nil {
		h.handleError(c, err)
		return
	}
	c.JSON(http.StatusOK, NewSuccessResponse(nil, string(i18n.ActionSuccessful)))
}

func (h *AccessKeyHandler) handleError(c *gin.Context, err error) {
	if appErr, ok := err.(*app_error.AppError); ok {
		response := NewErrorResponse(appErr.Message, string(appErr.Code), nil)
		c.JSON(appErr.GetStatusCode(), response)
	} else {
		response := NewErrorResponse(string(i18n.InternalServerError), string(app_error.CodeInternalError), err.Error())
		c.JSON(http.StatusInternalServerError, response)
	}
}
