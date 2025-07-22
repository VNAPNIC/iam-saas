package api

import (
	v1 "iam-saas/internal/api/v1"
	"iam-saas/internal/domain"
	"iam-saas/internal/handler"

	"github.com/gin-gonic/gin"
)

// NewApi nhận các service đã được khởi tạo
func NewApi(userService domain.UserService, roleService domain.RoleService) *gin.Engine {
	r := gin.Default()

	// Khởi tạo Handlers
	userHandler := handler.NewUserHandler(userService)
	roleHandler := handler.NewRoleHandler(roleService)

	// Định nghĩa các nhóm routes
	api := r.Group("/api")
	v1.RegisterRoutes(api, userHandler, roleHandler)

	return r
}
