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

type WebhookHandler struct {
	webhookService domain.WebhookService
}

func NewWebhookHandler(webhookService domain.WebhookService) *WebhookHandler {
	return &WebhookHandler{webhookService: webhookService}
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
	claims := c.MustGet(AuthPayloadKey).(*utils.Claims)
	var req createWebhookRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		h.handleError(c, app_error.NewInvalidInputError(err.Error()))
		return
	}

	webhook, err := h.webhookService.CreateWebhook(c.Request.Context(), claims.TenantID, req.URL, req.Secret, req.Events, req.Status)
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
	webhook, err := h.webhookService.GetWebhook(c.Request.Context(), webhookID)
	if err != nil {
		h.handleError(c, err)
		return
	}
	c.JSON(http.StatusOK, NewSuccessResponse(webhook, string(i18n.ActionSuccessful)))
}

func (h *WebhookHandler) ListWebhooks(c *gin.Context) {
	claims := c.MustGet(AuthPayloadKey).(*utils.Claims)
	webhooks, err := h.webhookService.ListWebhooks(c.Request.Context(), claims.TenantID)
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

	webhook, err := h.webhookService.UpdateWebhook(c.Request.Context(), webhookID, req.URL, req.Secret, req.Events, req.Status)
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
	if err := h.webhookService.DeleteWebhook(c.Request.Context(), webhookID); err != nil {
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
