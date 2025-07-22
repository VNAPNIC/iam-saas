package v1

import (
	"iam-saas/internal/handler"

	"github.com/gin-gonic/gin"
)

func RegisterRoutes(api *gin.RouterGroup, userHandler *handler.UserHandler, roleHandler *handler.RoleHandler) {
	v1 := api.Group("/v1")
	{
		// Public routes
		public := v1.Group("/public")
		RegisterPublicRoutes(public, userHandler)

		// Protected routes
		protected := v1.Group("/protected")
		RegisterProtectedRoutes(protected, userHandler, roleHandler)

		// Super Admin routes (nếu có)
		// superAdmin := v1.Group("/super-admin")
		// RegisterSuperAdminRoutes(superAdmin, userHandler)
	}
}