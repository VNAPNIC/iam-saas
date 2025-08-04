package handler

import (
	"iam-saas/internal/domain"
	"iam-saas/pkg/app_error"
	"iam-saas/pkg/utils"
	"net/http"

	"github.com/gin-gonic/gin"
)

// SuperAdminMiddleware kiểm tra quyền Super Admin
func SuperAdminMiddleware(roleService domain.RoleService) gin.HandlerFunc {
	return func(c *gin.Context) {
		claims, exists := c.Get(AuthPayloadKey)
		if !exists {
			c.JSON(http.StatusUnauthorized, NewErrorResponse("Authentication required", string(app_error.CodeUnauthorized), nil))
			c.Abort()
			return
		}

		userClaims := claims.(*utils.Claims)

		// Kiểm tra quyền super_admin
		hasPermission, err := roleService.CheckPermission(c.Request.Context(), userClaims.UserID, "super_admin")
		if err != nil {
			c.JSON(http.StatusInternalServerError, NewErrorResponse("Permission check failed", string(app_error.CodeInternalError), err.Error()))
			c.Abort()
			return
		}

		if !hasPermission {
			c.JSON(http.StatusForbidden, NewErrorResponse("Super admin access required", string(app_error.CodeForbidden), nil))
			c.Abort()
			return
		}

		c.Next()
	}
}

// TenantAdminMiddleware kiểm tra quyền Admin của tenant
func TenantAdminMiddleware(roleService domain.RoleService) gin.HandlerFunc {
	return func(c *gin.Context) {
		claims, exists := c.Get(AuthPayloadKey)
		if !exists {
			c.JSON(http.StatusUnauthorized, NewErrorResponse("Authentication required", string(app_error.CodeUnauthorized), nil))
			c.Abort()
			return
		}

		userClaims := claims.(*utils.Claims)

		// Kiểm tra quyền super_admin hoặc tenant admin permissions
		permissions := []string{"super_admin", "users:create", "users:delete", "roles:create", "roles:delete"}
		hasAnyPermission := false

		for _, permission := range permissions {
			hasPermission, err := roleService.CheckPermission(c.Request.Context(), userClaims.UserID, permission)
			if err != nil {
				c.JSON(http.StatusInternalServerError, NewErrorResponse("Permission check failed", string(app_error.CodeInternalError), err.Error()))
				c.Abort()
				return
			}
			if hasPermission {
				hasAnyPermission = true
				break
			}
		}

		if !hasAnyPermission {
			c.JSON(http.StatusForbidden, NewErrorResponse("Admin access required", string(app_error.CodeForbidden), nil))
			c.Abort()
			return
		}

		c.Next()
	}
}