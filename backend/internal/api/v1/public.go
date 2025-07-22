package v1

import (
	"iam-saas/internal/handler"

	"github.com/gin-gonic/gin"
)

// RegisterPublicRoutes đăng ký các API không yêu cầu xác thực.
func RegisterPublicRoutes(rg *gin.RouterGroup, userHandler *handler.UserHandler) {
	public := rg.Group("/")

	public.POST("/register", userHandler.Register)
	public.POST("/login", userHandler.Login)
	public.POST("/forgot-password", userHandler.ForgotPassword)
	public.POST("/reset-password", userHandler.ResetPassword)

	// Thêm các public API khác ở đây
}
