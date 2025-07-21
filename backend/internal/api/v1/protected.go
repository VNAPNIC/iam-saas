package v1

import (
	"iam-saas/internal/handler"

	"github.com/gin-gonic/gin"
)

// RegisterProtectedRoutes đăng ký tất cả các API yêu cầu xác thực.
func RegisterProtectedRoutes(rg *gin.RouterGroup, userHandler *handler.UserHandler) {
	// Áp dụng middleware cho tất cả các route trong group này.
	protected := rg.Group("/")
	protected.Use(handler.AuthMiddleware())

	// Nhóm các API quản lý người dùng
	users := protected.Group("/users")
	{
		users.POST("/invite", userHandler.InviteUser)
		// users.GET("", userHandler.ListUsers)
		// users.PUT("/:id", userHandler.UpdateUser)
	}
}
