package handler

import (
	"iam-saas/internal/domain"
	"iam-saas/pkg/app_error"
	"iam-saas/pkg/i18n"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

type RequestHandler struct {
	requestService domain.RequestService
	tenantService  domain.TenantService
}

func NewRequestHandler(requestService domain.RequestService, tenantService domain.TenantService) *RequestHandler {
	return &RequestHandler{requestService: requestService, tenantService: tenantService}
}

func (h *RequestHandler) ListTenantRequests(c *gin.Context) {
	tenantKeyVal, _ := c.Get(TenantContextKey)
	tenantKey := tenantKeyVal.(string)
	tenant, err := h.tenantService.GetTenantConfig(c.Request.Context(), tenantKey)
	if err != nil {
		h.handleError(c, err)
		return
	}
	requests, err := h.requestService.ListTenantRequests(c.Request.Context(), tenant.ID)
	if err != nil {
		h.handleError(c, err)
		return
	}
	c.JSON(http.StatusOK, NewSuccessResponse(requests, string(i18n.ActionSuccessful)))
}

func (h *RequestHandler) ListQuotaRequests(c *gin.Context) {
	tenantKeyVal, _ := c.Get(TenantContextKey)
	tenantKey := tenantKeyVal.(string)
	tenant, err := h.tenantService.GetTenantConfig(c.Request.Context(), tenantKey)
	if err != nil {
		h.handleError(c, err)
		return
	}
	requests, err := h.requestService.ListQuotaRequests(c.Request.Context(), tenant.ID)
	if err != nil {
		h.handleError(c, err)
		return
	}
	c.JSON(http.StatusOK, NewSuccessResponse(requests, string(i18n.ActionSuccessful)))
}

func (h *RequestHandler) ApproveRequest(c *gin.Context) {
	requestID, err := strconv.ParseInt(c.Param("id"), 10, 64)
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
	if err := h.requestService.ApproveRequest(c.Request.Context(), tenant.ID, requestID); err != nil {
		h.handleError(c, err)
		return
	}
	c.JSON(http.StatusOK, NewSuccessResponse(nil, string(i18n.ActionSuccessful)))
}

func (h *RequestHandler) DenyRequest(c *gin.Context) {
	requestID, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		h.handleError(c, app_error.NewInvalidInputError(err.Error()))
		return
	}
	var req struct {
		Reason string `json:"reason" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
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
	if err := h.requestService.DenyRequest(c.Request.Context(), tenant.ID, requestID, req.Reason); err != nil {
		h.handleError(c, err)
		return
	}
	c.JSON(http.StatusOK, NewSuccessResponse(nil, string(i18n.ActionSuccessful)))
}

func (h *RequestHandler) handleError(c *gin.Context, err error) {
	if appErr, ok := err.(*app_error.AppError); ok {
		response := NewErrorResponse(appErr.Message, string(appErr.Code), nil)
		c.JSON(appErr.GetStatusCode(), response)
	} else {
		response := NewErrorResponse(string(i18n.InternalServerError), string(app_error.CodeInternalError), err.Error())
		c.JSON(http.StatusInternalServerError, response)
	}
}
