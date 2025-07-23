package v1

import (
	"iam-saas/internal/domain"
	"iam-saas/internal/handler"

	"github.com/gin-gonic/gin"
)

// RegisterProtectedRoutes đăng ký tất cả các API yêu cầu xác thực.
func RegisterProtectedRoutes(rg *gin.RouterGroup, userHandler *handler.UserHandler, roleHandler *handler.RoleHandler, policyHandler *handler.PolicyHandler, ssoHandler *handler.SsoHandler, accessKeyHandler *handler.AccessKeyHandler, webhookHandler *handler.WebhookHandler, ticketHandler *handler.TicketHandler, roleService domain.RoleService) {
	// Endpoint để lấy thông tin user hiện tại
	rg.GET("/me", userHandler.GetMe)
	rg.PUT("/tenant/branding", userHandler.UpdateTenantBranding)

	// Nhóm các API quản lý người dùng
	users := rg.Group("/users")
	users.Use(handler.AuthMiddleware(roleService, "users:read"))
	{
		users.GET("", userHandler.ListUsers)
		users.POST("/invite", handler.AuthMiddleware(roleService, "users:create"), userHandler.InviteUser)
		users.PUT("/:id", handler.AuthMiddleware(roleService, "users:update"), userHandler.UpdateUser)
		users.DELETE("/:id", handler.AuthMiddleware(roleService, "users:delete"), userHandler.DeleteUser)
	}

	// Nhóm các API quản lý vai trò
	roles := rg.Group("/roles")
	roles.Use(handler.AuthMiddleware(roleService, "roles:read"))
	{
		roles.POST("", handler.AuthMiddleware(roleService, "roles:create"), roleHandler.CreateRole)
		roles.GET("", roleHandler.ListRoles)
		roles.GET("/:id", roleHandler.GetRole)
		roles.PUT("/:id", handler.AuthMiddleware(roleService, "roles:update"), roleHandler.UpdateRole)
		roles.DELETE("/:id", handler.AuthMiddleware(roleService, "roles:delete"), roleHandler.DeleteRole)
	}

	// API để lấy danh sách tất cả các quyền
	rg.GET("/permissions", handler.AuthMiddleware(roleService, "roles:read"), roleHandler.ListPermissions)

	// Nhóm các API quản lý chính sách
	policies := rg.Group("/policies")
	policies.Use(handler.AuthMiddleware(roleService, "policies:read"))
	{
		policies.POST("", handler.AuthMiddleware(roleService, "policies:create"), policyHandler.CreatePolicy)
		policies.GET("", policyHandler.ListPolicies)
		policies.GET("/:id", policyHandler.GetPolicy)
		policies.PUT("/:id", handler.AuthMiddleware(roleService, "policies:update"), policyHandler.UpdatePolicy)
		policies.DELETE("/:id", handler.AuthMiddleware(roleService, "policies:delete"), policyHandler.DeletePolicy)
		policies.POST("/simulate", handler.AuthMiddleware(roleService, "policies:simulate"), policyHandler.SimulatePolicy)
	}

	// Nhóm các API quản lý SSO
	sso := rg.Group("/sso-settings")
	sso.Use(handler.AuthMiddleware(roleService, "sso:read"))
	{
		sso.GET("", ssoHandler.GetSsoConfig)
		sso.PUT("", handler.AuthMiddleware(roleService, "sso:update"), ssoHandler.UpdateSsoConfig)
		sso.DELETE("", handler.AuthMiddleware(roleService, "sso:delete"), ssoHandler.DeleteSsoConfig)
		sso.POST("/test", handler.AuthMiddleware(roleService, "sso:test"), ssoHandler.TestSsoConnection)
	}

	// Nhóm các API quản lý Access Key
	accessKeys := rg.Group("/access-keys")
	accessKeys.Use(handler.AuthMiddleware(roleService, "access_keys:read"))
	{
		accessKeys.POST("/groups", handler.AuthMiddleware(roleService, "access_keys:create_group"), accessKeyHandler.CreateAccessKeyGroup)
		accessKeys.POST("/groups/:groupId/keys", handler.AuthMiddleware(roleService, "access_keys:create_key"), accessKeyHandler.CreateAccessKey)
		accessKeys.GET("", accessKeyHandler.ListAccessKeyGroups)
		accessKeys.DELETE("/keys/:keyId", handler.AuthMiddleware(roleService, "access_keys:delete_key"), accessKeyHandler.DeleteAccessKey)
		accessKeys.DELETE("/groups/:groupId", handler.AuthMiddleware(roleService, "access_keys:delete_group"), accessKeyHandler.DeleteAccessKeyGroup)
	}

	// Nhóm các API quản lý Webhook
	webhooks := rg.Group("/webhooks")
	webhooks.Use(handler.AuthMiddleware(roleService, "webhooks:read"))
	{
		webhooks.POST("", handler.AuthMiddleware(roleService, "webhooks:create"), webhookHandler.CreateWebhook)
		webhooks.GET("", webhookHandler.ListWebhooks)
		webhooks.GET("/:id", webhookHandler.GetWebhook)
		webhooks.PUT("/:id", handler.AuthMiddleware(roleService, "webhooks:update"), webhookHandler.UpdateWebhook)
		webhooks.DELETE("/:id", handler.AuthMiddleware(roleService, "webhooks:delete"), webhookHandler.DeleteWebhook)
	}

	// Nhóm các API quản lý Ticket
	tickets := rg.Group("/tickets")
	tickets.Use(handler.AuthMiddleware(roleService, "tickets:read"))
	{
		tickets.POST("", handler.AuthMiddleware(roleService, "tickets:create"), ticketHandler.CreateTicket)
		tickets.GET("/:id", ticketHandler.GetTicket)
		tickets.PUT("/:id/status", handler.AuthMiddleware(roleService, "tickets:update_status"), ticketHandler.UpdateTicketStatus)
		tickets.POST("/:id/reply", handler.AuthMiddleware(roleService, "tickets:reply"), ticketHandler.ReplyToTicket)
	}
}
