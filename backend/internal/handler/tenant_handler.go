package handler

import (
	"iam-saas/internal/domain"
	"iam-saas/pkg/app_error"
	"iam-saas/pkg/i18n"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

type TenantHandler struct {
	tenantService domain.TenantService
}

func NewTenantHandler(tenantService domain.TenantService) *TenantHandler {
	return &TenantHandler{tenantService: tenantService}
}

func (h *TenantHandler) ListTenants(c *gin.Context) {
	tenantKeyVal, _ := c.Get(TenantContextKey)
	tenantKey := tenantKeyVal.(string)
	tenant, err := h.tenantService.GetTenantConfig(c.Request.Context(), tenantKey)
	if err != nil {
		h.handleError(c, err)
		return
	}
	tenants, err := h.tenantService.ListTenants(c.Request.Context(), tenant.ID)
	if err != nil {
		h.handleError(c, err)
		return
	}
	c.JSON(http.StatusOK, NewSuccessResponse(tenants, string(i18n.ActionSuccessful)))
}

func (h *TenantHandler) GetTenantDetails(c *gin.Context) {
	tenantID, err := strconv.ParseInt(c.Param("tenantId"), 10, 64)
	if err != nil {
		h.handleError(c, app_error.NewInvalidInputError(err.Error()))
		return
	}
	tenant, err := h.tenantService.GetTenantDetails(c.Request.Context(), tenantID)
	if err != nil {
		h.handleError(c, err)
		return
	}
	c.JSON(http.StatusOK, NewSuccessResponse(tenant, string(i18n.ActionSuccessful)))
}

func (h *TenantHandler) SuspendTenant(c *gin.Context) {
	tenantID, err := strconv.ParseInt(c.Param("tenantId"), 10, 64)
	if err != nil {
		h.handleError(c, app_error.NewInvalidInputError(err.Error()))
		return
	}
	if err := h.tenantService.SuspendTenant(c.Request.Context(), tenantID); err != nil {
		h.handleError(c, err)
		return
	}
	c.JSON(http.StatusOK, NewSuccessResponse(nil, string(i18n.ActionSuccessful)))
}

func (h *TenantHandler) DeleteTenant(c *gin.Context) {
	tenantID, err := strconv.ParseInt(c.Param("tenantId"), 10, 64)
	if err != nil {
		h.handleError(c, app_error.NewInvalidInputError(err.Error()))
		return
	}
	tenantKeyVal, _ := c.Get(TenantContextKey)
	tenantKey := tenantKeyVal.(string)
	tenant, err := h.tenantService.GetTenantConfig(c.Request.Context(), tenantKey)
	if err != nil {
		h.handleError(c, err)
		return
	}
	if tenant.ID != tenantID {
		h.handleError(c, app_error.NewUnauthorizedError(string(i18n.Unauthorized)))
		return
	}
	if err := h.tenantService.DeleteTenant(c.Request.Context(), tenantID); err != nil {
		h.handleError(c, err)
		return
	}
	c.JSON(http.StatusOK, NewSuccessResponse(nil, string(i18n.ActionSuccessful)))
}

func (h *TenantHandler) handleError(c *gin.Context, err error) {
	if appErr, ok := err.(*app_error.AppError); ok {
		response := NewErrorResponse(appErr.Message, string(appErr.Code), nil)
		c.JSON(appErr.GetStatusCode(), response)
	} else {
		response := NewErrorResponse(string(i18n.InternalServerError), string(app_error.CodeInternalError), err.Error())
		c.JSON(http.StatusInternalServerError, response)
	}
}
