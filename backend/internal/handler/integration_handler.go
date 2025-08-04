package handler

import (
	"iam-saas/internal/domain"
	"iam-saas/internal/entities"
	"iam-saas/pkg/app_error"
	"iam-saas/pkg/i18n"
	"iam-saas/pkg/utils"
	"net/http"

	"github.com/gin-gonic/gin"
)

type IntegrationHandler struct {
	integrationService domain.IntegrationService
}

func NewIntegrationHandler(integrationService domain.IntegrationService) *IntegrationHandler {
	return &IntegrationHandler{integrationService: integrationService}
}

// SCIM endpoints
func (h *IntegrationHandler) GetSCIMSettings(c *gin.Context) {
	claims := c.MustGet(AuthPayloadKey).(*utils.Claims)

	settings, err := h.integrationService.GetSCIMSettings(c.Request.Context(), claims.TenantID)
	if err != nil {
		h.handleError(c, err)
		return
	}

	c.JSON(http.StatusOK, NewSuccessResponse(settings, string(i18n.ActionSuccessful)))
}

func (h *IntegrationHandler) UpdateSCIMSettings(c *gin.Context) {
	claims := c.MustGet(AuthPayloadKey).(*utils.Claims)

	var req entities.SCIMConfig
	if err := c.ShouldBindJSON(&req); err != nil {
		h.handleError(c, app_error.NewInvalidInputError(err.Error()))
		return
	}

	if err := h.integrationService.UpdateSCIMSettings(c.Request.Context(), claims.TenantID, &req); err != nil {
		h.handleError(c, err)
		return
	}

	c.JSON(http.StatusOK, NewSuccessResponse(nil, string(i18n.ActionSuccessful)))
}

func (h *IntegrationHandler) GenerateSCIMToken(c *gin.Context) {
	claims := c.MustGet(AuthPayloadKey).(*utils.Claims)

	token, err := h.integrationService.GenerateSCIMToken(c.Request.Context(), claims.TenantID)
	if err != nil {
		h.handleError(c, err)
		return
	}

	response := map[string]string{"token": token}
	c.JSON(http.StatusOK, NewSuccessResponse(response, string(i18n.ActionSuccessful)))
}

// SIEM endpoints
func (h *IntegrationHandler) GetSIEMSettings(c *gin.Context) {
	claims := c.MustGet(AuthPayloadKey).(*utils.Claims)

	settings, err := h.integrationService.GetSIEMSettings(c.Request.Context(), claims.TenantID)
	if err != nil {
		h.handleError(c, err)
		return
	}

	c.JSON(http.StatusOK, NewSuccessResponse(settings, string(i18n.ActionSuccessful)))
}

func (h *IntegrationHandler) UpdateSIEMSettings(c *gin.Context) {
	claims := c.MustGet(AuthPayloadKey).(*utils.Claims)

	var req entities.SIEMConfig
	if err := c.ShouldBindJSON(&req); err != nil {
		h.handleError(c, app_error.NewInvalidInputError(err.Error()))
		return
	}

	if err := h.integrationService.UpdateSIEMSettings(c.Request.Context(), claims.TenantID, &req); err != nil {
		h.handleError(c, err)
		return
	}

	c.JSON(http.StatusOK, NewSuccessResponse(nil, string(i18n.ActionSuccessful)))
}

func (h *IntegrationHandler) TestSIEMConnection(c *gin.Context) {
	claims := c.MustGet(AuthPayloadKey).(*utils.Claims)

	var req entities.SIEMConfig
	if err := c.ShouldBindJSON(&req); err != nil {
		h.handleError(c, app_error.NewInvalidInputError(err.Error()))
		return
	}

	if err := h.integrationService.TestSIEMConnection(c.Request.Context(), claims.TenantID, &req); err != nil {
		h.handleError(c, err)
		return
	}

	response := map[string]string{"status": "success", "message": "Connection test successful"}
	c.JSON(http.StatusOK, NewSuccessResponse(response, string(i18n.ActionSuccessful)))
}

// General integration endpoints
func (h *IntegrationHandler) ListIntegrations(c *gin.Context) {
	claims := c.MustGet(AuthPayloadKey).(*utils.Claims)

	integrations, err := h.integrationService.ListIntegrations(c.Request.Context(), claims.TenantID)
	if err != nil {
		h.handleError(c, err)
		return
	}

	c.JSON(http.StatusOK, NewSuccessResponse(integrations, string(i18n.ActionSuccessful)))
}

func (h *IntegrationHandler) GetIntegration(c *gin.Context) {
	claims := c.MustGet(AuthPayloadKey).(*utils.Claims)
	integrationType := c.Param("type")

	integration, err := h.integrationService.GetIntegration(c.Request.Context(), claims.TenantID, integrationType)
	if err != nil {
		h.handleError(c, err)
		return
	}

	c.JSON(http.StatusOK, NewSuccessResponse(integration, string(i18n.ActionSuccessful)))
}

func (h *IntegrationHandler) UpdateIntegrationStatus(c *gin.Context) {
	claims := c.MustGet(AuthPayloadKey).(*utils.Claims)
	integrationType := c.Param("type")

	var req struct {
		Status string `json:"status" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		h.handleError(c, app_error.NewInvalidInputError(err.Error()))
		return
	}

	if err := h.integrationService.UpdateIntegrationStatus(c.Request.Context(), claims.TenantID, integrationType, req.Status); err != nil {
		h.handleError(c, err)
		return
	}

	c.JSON(http.StatusOK, NewSuccessResponse(nil, string(i18n.ActionSuccessful)))
}

func (h *IntegrationHandler) handleError(c *gin.Context, err error) {
	if appErr, ok := err.(*app_error.AppError); ok {
		response := NewErrorResponse(appErr.Message, string(appErr.Code), nil)
		c.JSON(appErr.GetStatusCode(), response)
	} else {
		response := NewErrorResponse(string(i18n.InternalServerError), string(app_error.CodeInternalError), err.Error())
		c.JSON(http.StatusInternalServerError, response)
	}
}