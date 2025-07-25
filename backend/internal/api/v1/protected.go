package v1

import (
	"iam-saas/internal/domain"
	"iam-saas/internal/handler"

	"github.com/gin-gonic/gin"
)

// RegisterProtectedRoutes đăng ký tất cả các API yêu cầu xác thực.
func RegisterProtectedRoutes(
	rg *gin.RouterGroup,
	userHandler *handler.UserHandler,
	roleHandler *handler.RoleHandler,
	policyHandler *handler.PolicyHandler,
	ssoHandler *handler.SsoHandler,
	accessKeyHandler *handler.AccessKeyHandler,
	webhookHandler *handler.WebhookHandler,
	ticketHandler *handler.TicketHandler,
	auditLogHandler *handler.AuditLogHandler,
	subscriptionHandler *handler.SubscriptionHandler,
	tokenService domain.TokenService,
	roleService domain.RoleService,
) {
	// Endpoint để lấy thông tin user hiện tại
	rg.GET("/me", userHandler.GetMe)
	rg.PUT("/tenant/branding", userHandler.UpdateTenantBranding)

	// Nhóm các API quản lý người dùng
	users := rg.Group("/users")
	users.Use(handler.AuthMiddleware(tokenService, roleService, "users:read"))
	{
		users.GET("", userHandler.ListUsers)
		users.POST("/invite", handler.AuthMiddleware(tokenService, roleService, "users:create"), userHandler.InviteUser)
		users.PUT("/:id", handler.AuthMiddleware(tokenService, roleService, "users:update"), userHandler.UpdateUser)
		users.DELETE("/:id", handler.AuthMiddleware(tokenService, roleService, "users:delete"), userHandler.DeleteUser)
	}

	// Nhóm các API quản lý vai trò
	roles := rg.Group("/roles")
	roles.Use(handler.AuthMiddleware(tokenService, roleService, "roles:read"))
	{
		roles.POST("", handler.AuthMiddleware(tokenService, roleService, "roles:create"), roleHandler.CreateRole)
		roles.GET("", roleHandler.ListRoles)
		roles.GET("/:id", roleHandler.GetRole)
		roles.PUT("/:id", handler.AuthMiddleware(tokenService, roleService, "roles:update"), roleHandler.UpdateRole)
		roles.DELETE("/:id", handler.AuthMiddleware(tokenService, roleService, "roles:delete"), roleHandler.DeleteRole)
	}

	// API để lấy danh sách tất cả các quyền
	rg.GET("/permissions", handler.AuthMiddleware(tokenService, roleService, "roles:read"), roleHandler.ListPermissions)

	// Nhóm các API quản lý chính sách
	policies := rg.Group("/policies")
	policies.Use(handler.AuthMiddleware(tokenService, roleService, "policies:read"))
	{
		policies.POST("", handler.AuthMiddleware(tokenService, roleService, "policies:create"), policyHandler.CreatePolicy)
		policies.GET("", policyHandler.ListPolicies)
		policies.GET("/:id", policyHandler.GetPolicy)
		policies.PUT("/:id", handler.AuthMiddleware(tokenService, roleService, "policies:update"), policyHandler.UpdatePolicy)
		policies.DELETE("/:id", handler.AuthMiddleware(tokenService, roleService, "policies:delete"), policyHandler.DeletePolicy)
		policies.POST("/simulate", handler.AuthMiddleware(tokenService, roleService, "policies:simulate"), policyHandler.SimulatePolicy)
	}

	// Nhóm các API quản lý SSO
	sso := rg.Group("/sso-settings")
	sso.Use(handler.AuthMiddleware(tokenService, roleService, "sso:read"))
	{
		sso.GET("", ssoHandler.GetSsoConfig)
		sso.PUT("", handler.AuthMiddleware(tokenService, roleService, "sso:update"), ssoHandler.UpdateSsoConfig)
		sso.DELETE("", handler.AuthMiddleware(tokenService, roleService, "sso:delete"), ssoHandler.DeleteSsoConfig)
		sso.POST("/test", handler.AuthMiddleware(tokenService, roleService, "sso:test"), ssoHandler.TestSsoConnection)
	}

	// Nhóm các API quản lý Access Key
	accessKeys := rg.Group("/access-keys")
	accessKeys.Use(handler.AuthMiddleware(tokenService, roleService, "access_keys:read"))
	{
		accessKeys.POST("/groups", handler.AuthMiddleware(tokenService, roleService, "access_keys:create_group"), accessKeyHandler.CreateAccessKeyGroup)
		accessKeys.POST("/groups/:groupId/keys", handler.AuthMiddleware(tokenService, roleService, "access_keys:create_key"), accessKeyHandler.CreateAccessKey)
		accessKeys.GET("", accessKeyHandler.ListAccessKeyGroups)
		accessKeys.DELETE("/keys/:keyId", handler.AuthMiddleware(tokenService, roleService, "access_keys:delete_key"), accessKeyHandler.DeleteAccessKey)
		accessKeys.DELETE("/groups/:groupId", handler.AuthMiddleware(tokenService, roleService, "access_keys:delete_group"), accessKeyHandler.DeleteAccessKeyGroup)
	}

	// Nhóm các API quản lý Webhook
	webhooks := rg.Group("/webhooks")
	webhooks.Use(handler.AuthMiddleware(tokenService, roleService, "webhooks:read"))
	{
		webhooks.POST("", handler.AuthMiddleware(tokenService, roleService, "webhooks:create"), webhookHandler.CreateWebhook)
		webhooks.GET("", webhookHandler.ListWebhooks)
		webhooks.GET("/:id", webhookHandler.GetWebhook)
		webhooks.PUT("/:id", handler.AuthMiddleware(tokenService, roleService, "webhooks:update"), webhookHandler.UpdateWebhook)
		webhooks.DELETE("/:id", handler.AuthMiddleware(tokenService, roleService, "webhooks:delete"), webhookHandler.DeleteWebhook)
	}

	// Nhóm các API quản lý Ticket
	tickets := rg.Group("/tickets")
	tickets.Use(handler.AuthMiddleware(tokenService, roleService, "tickets:read"))
	{
		tickets.POST("", handler.AuthMiddleware(tokenService, roleService, "tickets:create"), ticketHandler.CreateTicket)
		tickets.GET("/:id", ticketHandler.GetTicket)
		tickets.PUT("/:id/status", handler.AuthMiddleware(tokenService, roleService, "tickets:update_status"), ticketHandler.UpdateTicketStatus)
		tickets.POST("/:id/reply", handler.AuthMiddleware(tokenService, roleService, "tickets:reply"), ticketHandler.ReplyToTicket)
	}

	// Nhóm các API quản lý Audit Log
	auditLogs := rg.Group("/audit-logs")
	auditLogs.Use(handler.AuthMiddleware(tokenService, roleService, "audit_logs:read"))
	{
		auditLogs.GET("", auditLogHandler.ListAuditLogs)
	}

	// Nhóm các API quản lý MFA
	mfa := rg.Group("/mfa")
	{
		mfa.POST("/enable", userHandler.EnableMFA)
		mfa.POST("/verify", userHandler.VerifyMFA)
		mfa.POST("/disable", userHandler.DisableMFA)
	}

	// Nhóm các API quản lý Subscription
	subscriptions := rg.Group("/subscriptions")
	subscriptions.Use(handler.AuthMiddleware(tokenService, roleService, "subscriptions:read"))
	{
		subscriptions.GET("", subscriptionHandler.GetSubscription)
	}
}
