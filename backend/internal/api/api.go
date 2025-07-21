package api

import (
	v1 "iam-saas/internal/api/v1"
	"iam-saas/internal/domain"
	"iam-saas/internal/handler"

	"github.com/gin-gonic/gin"
)

// NewApi nhận các service đã được khởi tạo
func NewApi(userService domain.UserService) *gin.Engine {
	router := gin.Default()

	// Khởi tạo các handler và inject service tương ứng
	userHandler := handler.NewUserHandler(userService)

	// Định tuyến
	apiV1 := router.Group("/api/v1")
	{
		// Đăng ký các route và truyền handler đã được inject
		v1.RegisterPublicRoutes(apiV1, userHandler)
		v1.RegisterProtectedRoutes(apiV1, userHandler)
	}

	return router
}
