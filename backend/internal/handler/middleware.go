package handler

import (
	"iam-saas/internal/domain"
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

// AuthMiddleware tạo một middleware của Gin để xác thực token JWT và tenant.
func AuthMiddleware(roleService domain.RoleService, requiredPermissions ...string) gin.HandlerFunc {
	return func(c *gin.Context) {
		tenantKeyFromURL := c.Param("tenantKey")
		if tenantKeyFromURL == "" {
			err := app_error.NewInvalidInputError(string(i18n.InvalidInput))
			c.AbortWithStatusJSON(http.StatusBadRequest, NewErrorResponse(err.Message, string(err.Code), "Tenant key is missing from URL"))
			return
		}

		authHeader := c.GetHeader(AuthorizationHeaderKey)
		if len(authHeader) == 0 {
			err := app_error.NewUnauthorizedError(string(i18n.Unauthorized))
			c.AbortWithStatusJSON(http.StatusUnauthorized, NewErrorResponse(err.Message, string(err.Code), "Authorization header is not provided"))
			return
		}

		fields := strings.Fields(authHeader)
		if len(fields) < 2 {
			err := app_error.NewUnauthorizedError(string(i18n.Unauthorized))
			c.AbortWithStatusJSON(http.StatusUnauthorized, NewErrorResponse(err.Message, string(err.Code), "Invalid authorization header format"))
			return
		}

		// Kiểm tra loại token.
		authType := strings.ToLower(fields[0])
		if authType != AuthorizationTypeBearer {
			err := app_error.NewUnauthorizedError(string(i18n.Unauthorized))
			c.AbortWithStatusJSON(http.StatusUnauthorized, NewErrorResponse(err.Message, string(err.Code), "Unsupported authorization type"))
			return
		}

		// Xác thực token.
		accessToken := fields[1]
		payload, err := utils.ParseToken(accessToken)
		if err != nil {
			err := app_error.NewUnauthorizedError(string(i18n.Unauthorized))
			c.AbortWithStatusJSON(http.StatusUnauthorized, NewErrorResponse(err.Message, string(err.Code), err.Error()))
			return
		}

		// **Tenant Verification**
		if payload.TenantKey != tenantKeyFromURL {
			err := app_error.NewUnauthorizedError(string(i18n.Unauthorized))
			c.AbortWithStatusJSON(http.StatusForbidden, NewErrorResponse(err.Message, string(err.Code), "You do not have permission to access this tenant"))
			return
		}

		// **Permission Verification**
		if len(requiredPermissions) > 0 {
			userPermissions, err := roleService.GetRolePermissions(c.Request.Context(), payload.RoleIDs)
			if err != nil {
				c.AbortWithStatusJSON(http.StatusInternalServerError, NewErrorResponse(string(i18n.InternalServerError), string(app_error.CodeInternalError), err.Error()))
				return
			}

			hasPermission := false
			for _, requiredPermission := range requiredPermissions {
				for _, userPermission := range userPermissions {
					if userPermission == requiredPermission {
						hasPermission = true
						break
					}
				}
				if hasPermission {
					break
				}
			}

			if !hasPermission {
				err := app_error.NewUnauthorizedError(string(i18n.Unauthorized))
				c.AbortWithStatusJSON(http.StatusForbidden, NewErrorResponse(err.Message, string(err.Code), "You do not have permission to perform this action"))
				return
			}
		}

		c.Set(AuthPayloadKey, payload)
		c.Next()
	}
}
