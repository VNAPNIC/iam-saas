package handler

import (
	"errors"
	"iam-saas/internal/domain"
	"iam-saas/pkg/app_error"
	"iam-saas/pkg/i18n"
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
	// TenantContextKey là key để lưu tenantKey trong Gin context.
	TenantContextKey = "tenant_key"
)

func TenantValidationMiddleware(tenantService domain.TenantService) gin.HandlerFunc {
	return func(c *gin.Context) {
		tenantKey := c.GetHeader("X-Tenant-Key")
		if tenantKey == "" {
			err := app_error.NewInvalidInputError(string(i18n.InvalidInput))
			c.AbortWithStatusJSON(http.StatusBadRequest, NewErrorResponse(err.Message, string(err.Code), "Tenant key is missing from X-Tenant-Key header"))
			return
		}

		tenant, err := tenantService.GetTenantConfig(c.Request.Context(), tenantKey)
		if err != nil {
			appErr, ok := err.(*app_error.AppError)
			if ok {
				c.AbortWithStatusJSON(appErr.StatusCode, NewErrorResponse(appErr.Message, string(appErr.Code), appErr.Error()))
			} else {
				c.AbortWithStatusJSON(http.StatusInternalServerError, NewErrorResponse(string(i18n.InternalServerError), string(app_error.CodeInternalError), err.Error()))
			}
			return
		}

		if tenant == nil {
			c.AbortWithStatusJSON(http.StatusUnauthorized, NewErrorResponse(string(i18n.Unauthorized), string(app_error.CodeUnauthorized), "Invalid tenant key"))
			return
		}

		if tenant.Status == "suspended" {
			c.AbortWithStatusJSON(http.StatusForbidden, NewErrorResponse(string(i18n.TenantIsSuspended), string(app_error.CodeForbidden), "Tenant is not active"))
			return
		}

		if tenant.Status == "pending_verification" {
			c.AbortWithStatusJSON(http.StatusForbidden, NewErrorResponse(string(i18n.TenantPendingVerification), string(app_error.CodeForbidden), "Tenant is not active"))
			return
		}

		c.Set(TenantContextKey, tenant.Key)
		c.Next()
	}
}

func AuthMiddleware(tokenService domain.TokenService, roleService domain.RoleService, requiredPermissions ...string) gin.HandlerFunc {
	return func(c *gin.Context) {
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

		authType := strings.ToLower(fields[0])
		if authType != AuthorizationTypeBearer {
			err := app_error.NewUnauthorizedError(string(i18n.Unauthorized))
			c.AbortWithStatusJSON(http.StatusUnauthorized, NewErrorResponse(err.Message, string(err.Code), "Unsupported authorization type"))
			return
		}

		accessToken := fields[1]

		payload, err := tokenService.ValidateToken(c.Request.Context(), accessToken)
		if err != nil {
			err := app_error.NewUnauthorizedError(string(i18n.Unauthorized))
			c.AbortWithStatusJSON(http.StatusUnauthorized, NewErrorResponse(err.Message, string(err.Code), err.Error()))
			return
		}

		tenantKeyFromCtx, exists := c.Get(TenantContextKey)
		if !exists {
			err := app_error.NewInternalServerError(errors.New("tenant context not found, ensure TenantValidationMiddleware runs first"))
			c.AbortWithStatusJSON(http.StatusInternalServerError, NewErrorResponse(err.Message, string(err.Code), err.Error()))
			return
		}

		tenantKey, ok := tenantKeyFromCtx.(string)
		if !ok {
			err := app_error.NewInternalServerError(errors.New("tenant context has invalid type"))
			c.AbortWithStatusJSON(http.StatusInternalServerError, NewErrorResponse(err.Message, string(err.Code), err.Error()))
			return
		}

		if payload.TenantKey != tenantKey {
			err := app_error.NewForbiddenError(string(i18n.CodeForbidden))
			c.AbortWithStatusJSON(http.StatusForbidden, NewErrorResponse(err.Message, string(err.Code), "You do not have permission to access this tenant's resources"))
			return
		}

		if len(requiredPermissions) > 0 {
			userPermissions, err := roleService.GetRolePermissions(c.Request.Context(), payload.RoleIDs)
			if err != nil {
				c.AbortWithStatusJSON(http.StatusInternalServerError, NewErrorResponse(string(i18n.InternalServerError), string(app_error.CodeInternalError), err.Error()))
				return
			}

			userPermissionSet := make(map[string]struct{}, len(userPermissions))
			for _, p := range userPermissions {
				userPermissionSet[p] = struct{}{}
			}

			hasRequiredPermission := false
			for _, requiredPermission := range requiredPermissions {
				if _, found := userPermissionSet[requiredPermission]; found {
					hasRequiredPermission = true
					break
				}
			}

			if !hasRequiredPermission {
				err := app_error.NewForbiddenError(string(i18n.CodeForbidden))
				c.AbortWithStatusJSON(http.StatusForbidden, NewErrorResponse(err.Message, string(err.Code), "You do not have permission to perform this action"))
				return
			}
		}

		c.Set(AuthPayloadKey, payload)
		c.Next()
	}
}
