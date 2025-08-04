package v1

import (
	"iam-saas/internal/domain"
	"iam-saas/internal/handler"

	"github.com/gin-gonic/gin"
)

func RegisterSuperAdminRoutes(
	router *gin.RouterGroup,
	tenantHandler *handler.TenantHandler,
	planHandler *handler.PlanHandler,
	tokenService domain.TokenService,
	roleService domain.RoleService,
) {
	superAdmin := router.Group("/sa")
	superAdmin.Use(handler.AuthMiddleware(tokenService, roleService))
	superAdmin.Use(handler.SuperAdminMiddleware(roleService))
	{
		// Tenant management
		superAdmin.GET("/tenants", tenantHandler.ListTenants)
		superAdmin.POST("/tenants", tenantHandler.CreateTenant)
		superAdmin.GET("/tenants/:id", tenantHandler.GetTenantDetails)
		superAdmin.PUT("/tenants/:id", tenantHandler.UpdateTenant)
		superAdmin.DELETE("/tenants/:id", tenantHandler.DeleteTenant)

		// Plan management
		superAdmin.POST("/plans", planHandler.CreatePlan)
		superAdmin.PUT("/plans/:id", planHandler.UpdatePlan)
		superAdmin.DELETE("/plans/:id", planHandler.DeletePlan)

		// Other super admin routes...
	}
}
