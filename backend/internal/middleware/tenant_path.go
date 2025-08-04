package middleware

import (
	"context"
	"iam-saas/internal/domain"
	"net/http"

	"github.com/gin-gonic/gin"
)

// TenantPathMiddleware extracts tenant information from URL path
// Dành cho HỆ THỐNG 2: Dịch vụ IAM của Tenant
func TenantPathMiddleware(tenantService domain.TenantService) gin.HandlerFunc {
	return func(c *gin.Context) {
		tenantPath := c.Param("tenant_path")
		if tenantPath == "" {
			c.JSON(http.StatusBadRequest, gin.H{
				"error": "tenant_path is required",
			})
			c.Abort()
			return
		}

		// Tìm tenant theo domain_path (key)
		tenant, err := tenantService.GetTenantConfig(context.Background(), tenantPath)
		if err != nil {
			c.JSON(http.StatusNotFound, gin.H{
				"error": "tenant not found",
			})
			c.Abort()
			return
		}

		// Kiểm tra tenant có active không
		if tenant.Status != "active" {
			c.JSON(http.StatusForbidden, gin.H{
				"error": "tenant is not active",
			})
			c.Abort()
			return
		}

		// Lưu tenant info vào context
		c.Set("tenant", tenant)
		c.Set("tenant_id", tenant.ID)
		c.Set("tenant_path", tenantPath)

		c.Next()
	}
}