package v1

import (
	"iam-saas/internal/handler"

	"github.com/gin-gonic/gin"
)

func RegisterPublicRoutes(
	router *gin.RouterGroup,
	userHandler *handler.UserHandler,
	tenantHandler *handler.TenantHandler,
) {
	// HỆ THỐNG 1: Public routes cho Tenant Admin
	auth := router.Group("/auth")
	{
		auth.POST("/login", userHandler.Login)
		auth.POST("/signup", userHandler.TenantAdminSignup)
		auth.POST("/verify-email", userHandler.VerifyEmailToken)
		auth.POST("/resend-verification", userHandler.ResendVerification)
		auth.POST("/refresh-token", userHandler.RefreshToken)
		auth.POST("/forgot-password", userHandler.ForgotPassword)
		auth.POST("/reset-password", userHandler.ResetPassword)
	}

	// Legacy public routes
	public := router.Group("/public")
	{
		public.POST("/login", userHandler.Login)
		public.POST("/register", userHandler.Register)
		public.POST("/refresh-token", userHandler.RefreshToken)
		public.POST("/forgot-password", userHandler.ForgotPassword)
		public.POST("/reset-password", userHandler.ResetPassword)
		public.POST("/verify-email", userHandler.VerifyEmail)
		public.POST("/accept-invitation", userHandler.AcceptInvitation)
		public.GET("/tenants/by-domain", tenantHandler.GetTenantDetails)
	}
}
