package v1

import (
	"iam-saas/internal/handler"

	"github.com/gin-gonic/gin"
)

// RegisterSuperAdminRoutes đăng ký các API chỉ dành cho Super Admin.
// Hiện tại chưa có route nào, đây là placeholder.
func RegisterSuperAdminRoutes(rg *gin.RouterGroup, userHandler *handler.UserHandler) {
	// superAdmin := rg.Group("/")
	// superAdmin.Use(handler.AuthMiddleware())
	// superAdmin.Use(handler.SuperAdminMiddleware()) // Cần một middleware riêng để check vai trò Super Admin
}