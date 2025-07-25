package handler

import (
	"iam-saas/internal/domain"
	"iam-saas/pkg/app_error"
	"iam-saas/pkg/i18n"
	"iam-saas/pkg/utils"
	"net/http"

	"github.com/gin-gonic/gin"
)

type SsoHandler struct {
	ssoService    domain.SsoService
	tenantService domain.TenantService
}

func NewSsoHandler(ssoService domain.SsoService, tenantService domain.TenantService) *SsoHandler {
	return &SsoHandler{ssoService: ssoService, tenantService: tenantService}
}

// --- Request Structs ---
type updateSsoConfigRequest struct {
	Provider     string `json:"provider" binding:"required"`
	MetadataURL  string `json:"metadataUrl" binding:"required,url"`
	ClientID     string `json:"clientId" binding:"required"`
	ClientSecret string `json:"clientSecret"` // Optional, only sent on initial setup or change
	Status       bool   `json:"status"`
}

// --- Handlers ---

func (h *SsoHandler) GetSsoConfig(c *gin.Context) {
	claims := c.MustGet(AuthPayloadKey).(*utils.Claims)
	config, err := h.ssoService.GetSsoConfig(c.Request.Context(), claims.TenantID)
	if err != nil {
		h.handleError(c, err)
		return
	}
	c.JSON(http.StatusOK, NewSuccessResponse(config, string(i18n.ActionSuccessful)))
}

func (h *SsoHandler) UpdateSsoConfig(c *gin.Context) {
	claims := c.MustGet(AuthPayloadKey).(*utils.Claims)
	var req updateSsoConfigRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		h.handleError(c, app_error.NewInvalidInputError(err.Error()))
		return
	}

	config, err := h.ssoService.UpdateSsoConfig(c.Request.Context(), claims.TenantID, req.Provider, req.MetadataURL, req.ClientID, req.ClientSecret, req.Status)
	if err != nil {
		h.handleError(c, err)
		return
	}
	c.JSON(http.StatusOK, NewSuccessResponse(config, string(i18n.ActionSuccessful)))
}

func (h *SsoHandler) DeleteSsoConfig(c *gin.Context) {
	claims := c.MustGet(AuthPayloadKey).(*utils.Claims)
	if err := h.ssoService.DeleteSsoConfig(c.Request.Context(), claims.TenantID); err != nil {
		h.handleError(c, err)
		return
	}
	c.JSON(http.StatusOK, NewSuccessResponse(nil, string(i18n.ActionSuccessful)))
}

func (h *SsoHandler) TestSsoConnection(c *gin.Context) {
	tenantKeyVal, _ := c.Get(TenantContextKey)
	tenantKey := tenantKeyVal.(string)
	tenant, err := h.tenantService.GetTenantConfig(c.Request.Context(), tenantKey)
	if err != nil {
		h.handleError(c, err)
		return
	}
	if err := h.ssoService.TestSsoConnection(c.Request.Context(), tenant.ID); err != nil {
		h.handleError(c, err)
		return
	}
	c.JSON(http.StatusOK, NewSuccessResponse(nil, string(i18n.ActionSuccessful)))
}

func (h *SsoHandler) handleError(c *gin.Context, err error) {
	if appErr, ok := err.(*app_error.AppError); ok {
		response := NewErrorResponse(appErr.Message, string(appErr.Code), nil)
		c.JSON(appErr.GetStatusCode(), response)
	} else {
		response := NewErrorResponse(string(i18n.InternalServerError), string(app_error.CodeInternalError), err.Error())
		c.JSON(http.StatusInternalServerError, response)
	}
}
