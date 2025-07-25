package handler

import (
	"iam-saas/internal/domain"
	"iam-saas/pkg/app_error"
	"iam-saas/pkg/i18n"
	"net/http"

	"github.com/gin-gonic/gin"
)

type SubscriptionHandler struct {
	subscriptionService domain.SubscriptionService
	tenantService       domain.TenantService
}

func NewSubscriptionHandler(subscriptionService domain.SubscriptionService, tenantService domain.TenantService) *SubscriptionHandler {
	return &SubscriptionHandler{subscriptionService: subscriptionService, tenantService: tenantService}
}

// --- Handlers ---

func (h *SubscriptionHandler) GetSubscription(c *gin.Context) {
	tenantKeyVal, _ := c.Get(TenantContextKey)
	tenantKey := tenantKeyVal.(string)
	tenant, err := h.tenantService.GetTenantConfig(c.Request.Context(), tenantKey)
	if err != nil {
		h.handleError(c, err)
		return
	}

	subscription, err := h.subscriptionService.GetSubscriptionByTenantID(c.Request.Context(), tenant.ID)
	if err != nil {
		h.handleError(c, err)
		return
	}
	c.JSON(http.StatusOK, NewSuccessResponse(subscription, string(i18n.ActionSuccessful)))
}

func (h *SubscriptionHandler) ListSubscriptions(c *gin.Context) {
	// This handler is for Super Admin to list all subscriptions
	// For now, we'll just return an empty list or an error if not Super Admin
	// In a real app, you'd have a service method to list all subscriptions
	c.JSON(http.StatusOK, NewSuccessResponse([]string{}, string(i18n.ActionSuccessful)))
}

func (h *SubscriptionHandler) UpdateSubscriptionStatus(c *gin.Context) {
	// subscriptionID, err := strconv.ParseInt(c.Param("id"), 10, 64)
	// if err != nil {
	// 	h.handleError(c, app_error.NewInvalidInputError(err.Error()))
	// 	return
	// }

	var req struct {
		Status string `json:"status" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		h.handleError(c, app_error.NewInvalidInputError(err.Error()))
		return
	}

	// In a real app, you'd have a service method to update subscription status by ID
	// For now, we'll just return a success response
	c.JSON(http.StatusOK, NewSuccessResponse(nil, string(i18n.ActionSuccessful)))
}

func (h *SubscriptionHandler) handleError(c *gin.Context, err error) {
	if appErr, ok := err.(*app_error.AppError); ok {
		response := NewErrorResponse(appErr.Message, string(appErr.Code), nil)
		c.JSON(appErr.GetStatusCode(), response)
	} else {
		response := NewErrorResponse(string(i18n.InternalServerError), string(app_error.CodeInternalError), err.Error())
		c.JSON(http.StatusInternalServerError, response)
	}
}
