package v1

import (
	"iam-saas/internal/handler"

	"github.com/gin-gonic/gin"
)

// RegisterPublicRoutes đăng ký các API không yêu cầu xác thực.
func RegisterPublicRoutes(router *gin.RouterGroup, userHandler *handler.UserHandler) {
	auth := router.Group("/auth")
	{
		auth.POST("/login", userHandler.Login)
		auth.POST("/register", userHandler.Register)
	}
}
