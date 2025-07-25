package handler

import (
	"iam-saas/internal/domain"
	"iam-saas/pkg/app_error"
	"iam-saas/pkg/i18n"
	"iam-saas/pkg/utils"
	"net/http"

	"github.com/gin-gonic/gin"
)

type AuditLogHandler struct {
	auditLogService domain.AuditLogService
}

func NewAuditLogHandler(auditLogService domain.AuditLogService) *AuditLogHandler {
	return &AuditLogHandler{auditLogService: auditLogService}
}

func (h *AuditLogHandler) ListAuditLogs(c *gin.Context) {
	claims := c.MustGet(AuthPayloadKey).(*utils.Claims)

	event := c.Query("event")
	userID := c.Query("userId")
	status := c.Query("status")
	severity := c.Query("severity")
	startDate := c.Query("startDate")
	endDate := c.Query("endDate")

	var startPtr *string
	if startDate != "" {
		startPtr = &startDate
	}
	var endPtr *string
	if endDate != "" {
		endPtr = &endDate
	}

	logs, err := h.auditLogService.ListAuditLogs(c.Request.Context(), claims.TenantID, event, userID, status, severity, startPtr, endPtr)
	if err != nil {
		h.handleError(c, err)
		return
	}
	c.JSON(http.StatusOK, NewSuccessResponse(logs, string(i18n.ActionSuccessful)))
}

func (h *AuditLogHandler) handleError(c *gin.Context, err error) {
	if appErr, ok := err.(*app_error.AppError); ok {
		response := NewErrorResponse(appErr.Message, string(appErr.Code), nil)
		c.JSON(appErr.GetStatusCode(), response)
	} else {
		response := NewErrorResponse(string(i18n.InternalServerError), string(app_error.CodeInternalError), err.Error())
		c.JSON(http.StatusInternalServerError, response)
	}
}
