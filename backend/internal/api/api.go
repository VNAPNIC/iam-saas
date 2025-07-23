package api

import (
	v1 "iam-saas/internal/api/v1"
	"iam-saas/internal/domain"
	"iam-saas/internal/handler"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

// NewApi nhận các service đã được khởi tạo
func NewApi(userService domain.UserService, roleService domain.RoleService) *gin.Engine {
	r := gin.Default()

	// Add the CORS middleware.
	// cors.Default() allows all origins, which is fine for development.
	// For production, you should use a more restrictive configuration.
	// Example: r.Use(cors.New(cors.Config{
	//     AllowOrigins:     []string{"https://your-frontend-domain.com"},
	//     AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
	//     AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
	//     AllowCredentials: true,
	// }))
	r.Use(cors.Default())
	// Khởi tạo Handlers
	userHandler := handler.NewUserHandler(userService)
	roleHandler := handler.NewRoleHandler(roleService)

	api := r.Group("/api")
	v1.RegisterRoutes(api, userHandler, roleHandler)

	return r
}
