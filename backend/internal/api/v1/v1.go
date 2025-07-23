package v1

import (
	"iam-saas/internal/domain"
	"iam-saas/internal/handler"

	"github.com/gin-gonic/gin"
)

func RegisterRoutes(api *gin.RouterGroup, userHandler *handler.UserHandler, roleHandler *handler.RoleHandler, tenantHandler *handler.TenantHandler, planHandler *handler.PlanHandler, requestHandler *handler.RequestHandler, policyHandler *handler.PolicyHandler, ssoHandler *handler.SsoHandler, accessKeyHandler *handler.AccessKeyHandler, webhookHandler *handler.WebhookHandler, ticketHandler *handler.TicketHandler, roleService domain.RoleService) {
	v1 := api.Group("/v1")
	{
		// Public routes
		public := v1.Group("/public")
		RegisterPublicRoutes(public, userHandler)

		// Protected routes with tenantKey
		protected := v1.Group("/:tenantKey/protected")
		protected.Use(handler.AuthMiddleware(roleService)) // Default middleware for all protected routes
		RegisterProtectedRoutes(protected, userHandler, roleHandler, policyHandler, ssoHandler, accessKeyHandler, webhookHandler, ticketHandler, roleService)

		// Super Admin routes
		superAdmin := v1.Group("/sa")
		superAdmin.Use(handler.AuthMiddleware(roleService, "super_admin")) // Super admin role check
		RegisterSuperAdminRoutes(superAdmin, tenantHandler, planHandler, requestHandler, ticketHandler)
	}
}