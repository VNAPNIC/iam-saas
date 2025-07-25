package handler

import (
	"iam-saas/internal/domain"
	"iam-saas/pkg/app_error"
	"iam-saas/pkg/i18n"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

type WebhookHandler struct {
	webhookService domain.WebhookService
	tenantService  domain.TenantService
}

func NewWebhookHandler(webhookService domain.WebhookService, tenantService domain.TenantService) *WebhookHandler {
	return &WebhookHandler{webhookService: webhookService, tenantService: tenantService}
}

// --- Request Structs ---
type createWebhookRequest struct {
	URL    string   `json:"url" binding:"required,url"`
	Secret string   `json:"secret"`
	Events []string `json:"events" binding:"required"`
	Status string   `json:"status" binding:"required"`
}

type updateWebhookRequest struct {
	URL    string   `json:"url" binding:"required,url"`
	Secret string   `json:"secret"`
	Events []string `json:"events" binding:"required"`
	Status string   `json:"status" binding:"required"`
}

// --- Handlers ---

func (h *WebhookHandler) CreateWebhook(c *gin.Context) {
	var req createWebhookRequest
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

	webhook, err := h.webhookService.CreateWebhook(c.Request.Context(), tenant.ID, req.URL, req.Secret, req.Events, req.Status)
	if err != nil {
		h.handleError(c, err)
		return
	}

	c.JSON(http.StatusCreated, NewSuccessResponse(webhook, string(i18n.ActionSuccessful)))
}

func (h *WebhookHandler) GetWebhook(c *gin.Context) {
	webhookID, err := strconv.ParseInt(c.Param("id"), 10, 64)
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
	webhook, err := h.webhookService.GetWebhook(c.Request.Context(), tenant.ID, webhookID)
	if err != nil {
		h.handleError(c, err)
		return
	}
	c.JSON(http.StatusOK, NewSuccessResponse(webhook, string(i18n.ActionSuccessful)))
}

func (h *WebhookHandler) ListWebhooks(c *gin.Context) {
	tenantKeyVal, _ := c.Get(TenantContextKey)
	tenantKey := tenantKeyVal.(string)
	tenant, err := h.tenantService.GetTenantConfig(c.Request.Context(), tenantKey)
	if err != nil {
		h.handleError(c, err)
		return
	}
	webhooks, err := h.webhookService.ListWebhooks(c.Request.Context(), tenant.ID)
	if err != nil {
		h.handleError(c, err)
		return
	}
	c.JSON(http.StatusOK, NewSuccessResponse(webhooks, string(i18n.ActionSuccessful)))
}

func (h *WebhookHandler) UpdateWebhook(c *gin.Context) {
	webhookID, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		h.handleError(c, app_error.NewInvalidInputError(err.Error()))
		return
	}
	var req updateWebhookRequest
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

	webhook, err := h.webhookService.UpdateWebhook(c.Request.Context(), tenant.ID, webhookID, req.URL, req.Secret, req.Events, req.Status)
	if err != nil {
		h.handleError(c, err)
		return
	}

	c.JSON(http.StatusOK, NewSuccessResponse(webhook, string(i18n.ActionSuccessful)))
}

func (h *WebhookHandler) DeleteWebhook(c *gin.Context) {
	webhookID, err := strconv.ParseInt(c.Param("id"), 10, 64)
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
	if err := h.webhookService.DeleteWebhook(c.Request.Context(), tenant.ID, webhookID); err != nil {
		h.handleError(c, err)
		return
	}
	c.JSON(http.StatusOK, NewSuccessResponse(nil, string(i18n.ActionSuccessful)))
}

func (h *WebhookHandler) handleError(c *gin.Context, err error) {
	if appErr, ok := err.(*app_error.AppError); ok {
		response := NewErrorResponse(appErr.Message, string(appErr.Code), nil)
		c.JSON(appErr.GetStatusCode(), response)
	} else {
		response := NewErrorResponse(string(i18n.InternalServerError), string(app_error.CodeInternalError), err.Error())
		c.JSON(http.StatusInternalServerError, response)
	}
}
