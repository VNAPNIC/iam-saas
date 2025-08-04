package v1

import (
	"iam-saas/internal/domain"
	"iam-saas/internal/handler"

	"github.com/gin-gonic/gin"
)

func RegisterProtectedRoutes(
	router *gin.RouterGroup,
	userHandler *handler.UserHandler,
	roleHandler *handler.RoleHandler,
	tenantHandler *handler.TenantHandler,
	planHandler *handler.PlanHandler,
	requestHandler *handler.RequestHandler,
	policyHandler *handler.PolicyHandler,
	ssoHandler *handler.SsoHandler,
	accessKeyHandler *handler.AccessKeyHandler,
	webhookHandler *handler.WebhookHandler,
	ticketHandler *handler.TicketHandler,
	auditLogHandler *handler.AuditLogHandler,
	subscriptionHandler *handler.SubscriptionHandler,
	alertHandler *handler.AlertHandler,
	integrationHandler *handler.IntegrationHandler,
	serviceRoleHandler *handler.ServiceRoleHandler,
	sessionHandler *handler.SessionHandler,
	tokenService domain.TokenService,
	tenantService domain.TenantService,
	roleService domain.RoleService,
) {
	protected := router.Group("/protected")
	protected.Use(handler.AuthMiddleware(tokenService, roleService))
	protected.Use(handler.TenantValidationMiddleware(tenantService))
	{
		// User routes
		protected.GET("/users/me", userHandler.GetMe)
		
		protected.POST("/users/invite", userHandler.InviteUser)
		protected.GET("/users", userHandler.ListUsers)
		protected.GET("/users/:id", userHandler.GetUser)
		protected.PUT("/users/me", userHandler.UpdateMe)
		protected.DELETE("/users/:id", userHandler.DeleteUser)

		// Role routes
		protected.GET("/roles", roleHandler.ListRoles)
		protected.POST("/roles", roleHandler.CreateRole)
		protected.GET("/roles/:id", roleHandler.GetRole)
		protected.PUT("/roles/:id", roleHandler.UpdateRole)
		protected.DELETE("/roles/:id", roleHandler.DeleteRole)

		// Tenant routes
		protected.GET("/tenants/current", tenantHandler.GetCurrentTenant)
		protected.PUT("/tenants/current", tenantHandler.UpdateCurrentTenant)
		
		// HỆ THỐNG 1: Onboarding routes
		protected.GET("/tenant/onboarding-status", tenantHandler.GetOnboardingStatus)
		protected.PUT("/tenant/branding", tenantHandler.UpdateTenantBrandingOnboarding)
		protected.PUT("/tenant/settings", tenantHandler.UpdateTenantSettings)
		protected.POST("/tenant/complete-onboarding", tenantHandler.CompleteOnboarding)

		// Plan routes
		protected.GET("/plans", planHandler.ListPlans)

		// Request routes
		protected.GET("/requests/tenant", requestHandler.ListTenantRequests)
		protected.GET("/requests/quota", requestHandler.ListQuotaRequests)
		protected.PUT("/requests/:id/approve", requestHandler.ApproveRequest)
		protected.PUT("/requests/:id/reject", requestHandler.DenyRequest)

		// Policy routes
		protected.GET("/policies", policyHandler.ListPolicies)
		protected.POST("/policies", policyHandler.CreatePolicy)
		protected.GET("/policies/:id", policyHandler.GetPolicy)
		protected.PUT("/policies/:id", policyHandler.UpdatePolicy)
		protected.DELETE("/policies/:id", policyHandler.DeletePolicy)

		// SSO routes
		protected.GET("/sso", ssoHandler.GetSsoConfig)
		protected.PUT("/sso", ssoHandler.UpdateSsoConfig)
		protected.DELETE("/sso", ssoHandler.DeleteSsoConfig)

		// Access Key routes
		protected.GET("/access-keys", accessKeyHandler.ListAccessKeyGroups)
		protected.POST("/access-keys", accessKeyHandler.CreateAccessKey)
		protected.DELETE("/access-keys/:id", accessKeyHandler.DeleteAccessKey)

		// Webhook routes
		protected.GET("/webhooks", webhookHandler.ListWebhooks)
		protected.POST("/webhooks", webhookHandler.CreateWebhook)
		protected.GET("/webhooks/:id", webhookHandler.GetWebhook)
		protected.PUT("/webhooks/:id", webhookHandler.UpdateWebhook)
		protected.DELETE("/webhooks/:id", webhookHandler.DeleteWebhook)

		// Ticket routes
		protected.GET("/tickets", ticketHandler.ListTickets)
		protected.POST("/tickets", ticketHandler.CreateTicket)
		protected.GET("/tickets/:id", ticketHandler.GetTicket)
		protected.POST("/tickets/:id/replies", ticketHandler.ReplyToTicket)

		// Audit Log routes
		protected.GET("/audit-logs", auditLogHandler.ListAuditLogs)

		// Subscription routes
		protected.GET("/subscriptions", subscriptionHandler.GetSubscription)

		// Alert routes
		protected.GET("/alerts", alertHandler.ListAlerts)
		protected.PUT("/alerts/:id/acknowledge", alertHandler.UpdateAlertStatus)

		// Integration routes
		protected.GET("/integrations", integrationHandler.ListIntegrations)
		protected.GET("/integrations/:id", integrationHandler.GetIntegration)
		protected.PUT("/integrations/:id", integrationHandler.UpdateIntegrationStatus)

		// Service Role routes
		protected.GET("/service-roles", serviceRoleHandler.ListServiceRoles)
		protected.POST("/service-roles", serviceRoleHandler.CreateServiceRole)
		protected.GET("/service-roles/:id", serviceRoleHandler.GetServiceRole)
		protected.PUT("/service-roles/:id", serviceRoleHandler.UpdateServiceRole)
		protected.DELETE("/service-roles/:id", serviceRoleHandler.DeleteServiceRole)

		// Session routes
		protected.GET("/sessions", sessionHandler.ListSessions)
		protected.DELETE("/sessions/:id", sessionHandler.RevokeSession)
	}
}