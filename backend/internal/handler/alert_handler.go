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

type AlertHandler struct {
	alertService domain.AlertService
}

func NewAlertHandler(alertService domain.AlertService) *AlertHandler {
	return &AlertHandler{alertService: alertService}
}

// --- Handlers ---

func (h *AlertHandler) ListAlerts(c *gin.Context) {
	claims := c.MustGet(AuthPayloadKey).(*utils.Claims)

	var tenantID *int64
	// If not Super Admin, filter by tenantID from claims
	// In a real app, you'd check if the user has super_admin role
	// For now, we'll assume if tenantKey is present, it's a tenant admin
	if claims.TenantID != 0 { // Assuming 0 means Super Admin or no tenant
		tenantID = &claims.TenantID
	}

	var userID *int64
	// You might want to filter by specific user ID if needed
	// userIDStr := c.Query("userId")
	// if userIDStr != "" {
	// 	id, err := strconv.ParseInt(userIDStr, 10, 64)
	// 	if err == nil {
	// 		userID = &id
	// 	}
	// }

	severity := c.Query("severity")
	status := c.Query("status")

	alerts, err := h.alertService.ListAlerts(c.Request.Context(), tenantID, userID, severity, status)
	if err != nil {
		h.handleError(c, err)
		return
	}
	c.JSON(http.StatusOK, NewSuccessResponse(alerts, string(i18n.ActionSuccessful)))
}

func (h *AlertHandler) UpdateAlertStatus(c *gin.Context) {
	alertID, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		h.handleError(c, app_error.NewInvalidInputError(err.Error()))
		return
	}

	var req struct {
		Status string `json:"status" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		h.handleError(c, app_error.NewInvalidInputError(err.Error()))
		return
	}

	alert, err := h.alertService.UpdateAlertStatus(c.Request.Context(), alertID, req.Status)
	if err != nil {
		h.handleError(c, err)
		return
	}
	c.JSON(http.StatusOK, NewSuccessResponse(alert, string(i18n.ActionSuccessful)))
}

func (h *AlertHandler) handleError(c *gin.Context, err error) {
	if appErr, ok := err.(*app_error.AppError); ok {
		response := NewErrorResponse(appErr.Message, string(appErr.Code), nil)
		c.JSON(appErr.GetStatusCode(), response)
	} else {
		response := NewErrorResponse(string(i18n.InternalServerError), string(app_error.CodeInternalError), err.Error())
		c.JSON(http.StatusInternalServerError, response)
	}
}
