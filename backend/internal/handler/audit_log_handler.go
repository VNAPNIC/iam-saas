package handler

import (
	"fmt"
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

func (h *AuditLogHandler) ExportAuditLogs(c *gin.Context) {
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

	// Generate CSV content
	csvContent := "ID,Tenant ID,User Email,IP Address,Event,Status,Severity,Details,Created At\n"
	for _, log := range logs {
		csvContent += fmt.Sprintf("%d,%d,%s,%s,%s,%s,%s,\"%s\",%s\n",
			log.ID, log.TenantID, log.UserEmail, log.IPAddress, log.Event, log.Status, log.Severity, log.Details, log.CreatedAt.Format("2006-01-02 15:04:05"))
	}

	c.Header("Content-Type", "text/csv")
	c.Header("Content-Disposition", "attachment; filename=audit_logs.csv")
	c.String(http.StatusOK, csvContent)
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
