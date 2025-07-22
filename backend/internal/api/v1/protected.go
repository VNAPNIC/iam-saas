package v1

import (
	"iam-saas/internal/handler"

	"github.com/gin-gonic/gin"
)

// RegisterProtectedRoutes đăng ký tất cả các API yêu cầu xác thực.
func RegisterProtectedRoutes(rg *gin.RouterGroup, userHandler *handler.UserHandler, roleHandler *handler.RoleHandler) {
	// Áp dụng middleware cho tất cả các route trong group này.
	protected := rg.Group("/")
	protected.Use(handler.AuthMiddleware())

	// Endpoint để lấy thông tin user hiện tại
	protected.GET("/me", userHandler.GetMe)

	// Nhóm các API quản lý người dùng
	users := protected.Group("/users")
	{
		users.GET("", userHandler.ListUsers)
		users.POST("/invite", userHandler.InviteUser)
		users.PUT("/:id", userHandler.UpdateUser)
		users.DELETE("/:id", userHandler.DeleteUser)
	}

	// Nhóm các API quản lý vai trò
	roles := protected.Group("/roles")
	{
		roles.POST("", roleHandler.CreateRole)
		roles.GET("", roleHandler.ListRoles)
		roles.GET("/:id", roleHandler.GetRole)
		roles.PUT("/:id", roleHandler.UpdateRole)
		roles.DELETE("/:id", roleHandler.DeleteRole)
	}

	// API để lấy danh sách tất cả các quyền
	protected.GET("/permissions", roleHandler.ListPermissions)
}
