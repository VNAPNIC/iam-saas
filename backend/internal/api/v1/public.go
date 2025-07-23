package v1

import (
	"iam-saas/internal/handler"

	"github.com/gin-gonic/gin"
)

// RegisterPublicRoutes đăng ký các API không yêu cầu xác thực.
func RegisterPublicRoutes(rg *gin.RouterGroup, userHandler *handler.UserHandler) {
	public := rg.Group("/")

	public.POST("/login", userHandler.Login)
	public.POST("/refresh-token", userHandler.RefreshToken)
	public.POST("/forgot-password", userHandler.ForgotPassword)
	public.POST("/reset-password", userHandler.ResetPassword)
	public.POST("/accept-invitation", userHandler.AcceptInvitation)
	public.POST("/verify-email", userHandler.VerifyEmail)
	public.GET("/tenant-config/:tenantKey", userHandler.GetTenantConfig)
}
