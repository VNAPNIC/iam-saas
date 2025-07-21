package handler

import (
	"iam-saas/pkg/app_error"
	"iam-saas/pkg/i18n"
	"iam-saas/pkg/utils"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
)

const (
	// AuthorizationHeaderKey là key cho header chứa token.
	AuthorizationHeaderKey = "Authorization"
	// AuthorizationTypeBearer là loại token được sử dụng.
	AuthorizationTypeBearer = "bearer"
	// AuthPayloadKey là key để lưu thông tin user trong Gin context.
	AuthPayloadKey = "authorization_payload"
)

// AuthMiddleware tạo một middleware của Gin để xác thực token JWT.
func AuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		// 1. Lấy header Authorization.
		authHeader := c.GetHeader(AuthorizationHeaderKey)
		if len(authHeader) == 0 {
			err := app_error.NewUnauthorizedError(string(i18n.Unauthorized))
			c.AbortWithStatusJSON(http.StatusUnauthorized, NewErrorResponse(err.Message, string(err.Code), "Authorization header is not provided"))
			return
		}

		// 2. Tách header để lấy token. Format: "Bearer <token>"
		fields := strings.Fields(authHeader)
		if len(fields) < 2 {
			err := app_error.NewUnauthorizedError(string(i18n.Unauthorized))
			c.AbortWithStatusJSON(http.StatusUnauthorized, NewErrorResponse(err.Message, string(err.Code), "Invalid authorization header format"))
			return
		}

		// 3. Kiểm tra loại token.
		authType := strings.ToLower(fields[0])
		if authType != AuthorizationTypeBearer {
			err := app_error.NewUnauthorizedError(string(i18n.Unauthorized))
			c.AbortWithStatusJSON(http.StatusUnauthorized, NewErrorResponse(err.Message, string(err.Code), "Unsupported authorization type"))
			return
		}

		// 4. Xác thực token.
		accessToken := fields[1]
		payload, err := utils.ParseToken(accessToken)
		if err != nil {
			err := app_error.NewUnauthorizedError(string(i18n.Unauthorized))
			c.AbortWithStatusJSON(http.StatusUnauthorized, NewErrorResponse(err.Message, string(err.Code), err.Error()))
			return
		}

		// 5. Lưu payload vào context và cho phép request đi tiếp.
		c.Set(AuthPayloadKey, payload)
		c.Next()
	}
}
