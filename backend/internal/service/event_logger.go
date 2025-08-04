package service

import (
	"context"
	"iam-saas/internal/domain"
	"log"
)

// EventLogger handles creation of audit logs and alerts based on system events
type EventLogger struct {
	auditLogService domain.AuditLogService
	alertService    domain.AlertService
}

// NewEventLogger creates a new EventLogger instance
func NewEventLogger(auditLogService domain.AuditLogService, alertService domain.AlertService) *EventLogger {
	return &EventLogger{
		auditLogService: auditLogService,
		alertService:    alertService,
	}
}

// LogEvent creates an audit log entry
func (el *EventLogger) LogEvent(ctx context.Context, tenantID int64, userID int64, userEmail, ipAddress, event, status, severity, details string) error {
	return el.auditLogService.CreateAuditLog(ctx, tenantID, userID, userEmail, ipAddress, event, status, severity, details)
}

// CreateAlert creates an alert
func (el *EventLogger) CreateAlert(ctx context.Context, tenantID *int64, userID *int64, eventType, message, severity string) error {
	return el.alertService.CreateAlert(ctx, tenantID, userID, eventType, message, severity)
}

// LogUserLogin creates an audit log for user login
func (el *EventLogger) LogUserLogin(ctx context.Context, tenantID int64, userID int64, userEmail, ipAddress string, success bool) error {
	status := "success"
	severity := "info"
	details := ""
	
	if !success {
		status = "failure"
		severity = "warning"
		details = "Failed login attempt"
		// Create an alert for failed login attempts
		if err := el.CreateAlert(ctx, &tenantID, &userID, "login_failure", "Failed login attempt detected", "warning"); err != nil {
			// Log error but don't fail the login attempt
			log.Printf("Failed to create alert for failed login attempt for user %d: %v", userID, err)
		}
	}
	
	return el.LogEvent(ctx, tenantID, userID, userEmail, ipAddress, "USER_LOGIN", status, severity, details)
}

// LogUserSignup creates an audit log for user signup
func (el *EventLogger) LogUserSignup(ctx context.Context, tenantID int64, userID int64, userEmail, ipAddress string) error {
	return el.LogEvent(ctx, tenantID, userID, userEmail, ipAddress, "USER_SIGNUP", "success", "info", "")
}

// LogPasswordReset creates an audit log for password reset
func (el *EventLogger) LogPasswordReset(ctx context.Context, tenantID int64, userID int64, userEmail, ipAddress string) error {
	return el.LogEvent(ctx, tenantID, userID, userEmail, ipAddress, "PASSWORD_RESET", "success", "info", "")
}

// LogEmailVerification creates an audit log for email verification
func (el *EventLogger) LogEmailVerification(ctx context.Context, tenantID int64, userID int64, userEmail, ipAddress string) error {
	return el.LogEvent(ctx, tenantID, userID, userEmail, ipAddress, "EMAIL_VERIFICATION", "success", "info", "")
}

// LogAccessKeyCreated creates an audit log for access key creation
func (el *EventLogger) LogAccessKeyCreated(ctx context.Context, tenantID int64, userID int64, userEmail, ipAddress string) error {
	return el.LogEvent(ctx, tenantID, userID, userEmail, ipAddress, "ACCESS_KEY_CREATED", "success", "info", "")
}

// LogAccessKeyUsed creates an audit log for access key usage
func (el *EventLogger) LogAccessKeyUsed(ctx context.Context, tenantID int64, userID int64, userEmail, ipAddress string) error {
	return el.LogEvent(ctx, tenantID, userID, userEmail, ipAddress, "ACCESS_KEY_USED", "success", "info", "")
}

// LogRoleAssigned creates an audit log for role assignment
func (el *EventLogger) LogRoleAssigned(ctx context.Context, tenantID int64, userID int64, userEmail, ipAddress string) error {
	return el.LogEvent(ctx, tenantID, userID, userEmail, ipAddress, "ROLE_ASSIGNED", "success", "info", "")
}

// LogPolicyUpdated creates an audit log for policy updates
func (el *EventLogger) LogPolicyUpdated(ctx context.Context, tenantID int64, userID int64, userEmail, ipAddress string) error {
	return el.LogEvent(ctx, tenantID, userID, userEmail, ipAddress, "POLICY_UPDATED", "success", "info", "")
}

// LogTenantCreated creates an audit log for tenant creation
func (el *EventLogger) LogTenantCreated(ctx context.Context, tenantID int64, userID int64, userEmail, ipAddress string) error {
	return el.LogEvent(ctx, tenantID, userID, userEmail, ipAddress, "TENANT_CREATED", "success", "info", "")
}

// LogUserDeleted creates an audit log for user deletion
func (el *EventLogger) LogUserDeleted(ctx context.Context, tenantID int64, userID int64, userEmail, ipAddress string) error {
	return el.LogEvent(ctx, tenantID, userID, userEmail, ipAddress, "USER_DELETED", "success", "info", "")
}