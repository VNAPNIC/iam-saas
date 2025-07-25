package v1

import (
	"iam-saas/internal/domain"
	"iam-saas/internal/handler"

	"github.com/gin-gonic/gin"
)

func RegisterRoutes(
	api *gin.RouterGroup,
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
	tokenService domain.TokenService,
	tenantService domain.TenantService,
	roleService domain.RoleService,
) {
	v1 := api.Group("/v1")
	{
		// Public routes
		public := v1.Group("/public")

		RegisterPublicRoutes(public, userHandler, tenantService)

		// Protected routes
		protected := v1.Group("/protected")
		protected.Use(handler.TenantValidationMiddleware(tenantService))
		protected.Use(handler.AuthMiddleware(tokenService, roleService))
		RegisterProtectedRoutes(
			protected,
			userHandler,
			roleHandler,
			policyHandler,
			ssoHandler,
			accessKeyHandler,
			webhookHandler,
			ticketHandler,
			auditLogHandler,
			subscriptionHandler,
			tokenService,
			roleService,
		)

		// Super Admin routes
		superAdmin := v1.Group("/sa")
		superAdmin.Use(handler.TenantValidationMiddleware(tenantService))
		superAdmin.Use(handler.AuthMiddleware(tokenService, roleService, "super_admin"))
		RegisterSuperAdminRoutes(superAdmin, tenantHandler, planHandler, requestHandler, ticketHandler, subscriptionHandler, alertHandler)
	}
}
