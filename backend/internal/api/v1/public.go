package v1

import (
	"iam-saas/internal/domain"
	"iam-saas/internal/handler"

	"github.com/gin-gonic/gin"
)

// RegisterPublicRoutes đăng ký các API không yêu cầu xác thực.
func RegisterPublicRoutes(rg *gin.RouterGroup, userHandler *handler.UserHandler, tenantService domain.TenantService) {
	public := rg.Group("/")
	public.POST("/login", handler.TenantValidationMiddleware(tenantService), userHandler.Login)
	public.POST("/refresh-token", handler.TenantValidationMiddleware(tenantService), userHandler.RefreshToken)
	public.POST("/forgot-password", handler.TenantValidationMiddleware(tenantService), userHandler.ForgotPassword)
	public.POST("/reset-password", handler.TenantValidationMiddleware(tenantService), userHandler.ResetPassword)
	public.POST("/accept-invitation", handler.TenantValidationMiddleware(tenantService), userHandler.AcceptInvitation)
	public.POST("/verify-email", handler.TenantValidationMiddleware(tenantService), userHandler.VerifyEmail)
	// Không cần verify tenant
	public.GET("/tenant-config/:tenantKey", userHandler.GetTenantConfig)
}
