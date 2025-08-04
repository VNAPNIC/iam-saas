package v1

import (
	"iam-saas/internal/monitoring"
	"iam-saas/internal/realtime"
	"iam-saas/internal/websocket"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
)

// RegisterRealtimeRoutes registers real-time and monitoring routes
func RegisterRealtimeRoutes(
	api *gin.RouterGroup,
	websocketHub *websocket.Hub,
	realtimeManager *realtime.RealtimeManager,
	performanceMonitor *monitoring.PerformanceMonitor,
) {
	// WebSocket endpoint
	api.GET("/ws", websocketHub.HandleWebSocket)

	// Real-time management endpoints
	realtime := api.Group("/realtime")
	{
		realtime.GET("/metrics", func(c *gin.Context) {
			metrics := realtimeManager.GetMetrics()
			c.JSON(200, gin.H{
				"success": true,
				"data":    metrics,
			})
		})

		realtime.GET("/events/:tenant_id", func(c *gin.Context) {
			tenantID := c.Param("tenant_id")
			// Get recent events for tenant
			events, err := realtimeManager.GetRecentEvents(tenantID, time.Now().Add(-1*time.Hour))
			if err != nil {
				c.JSON(500, gin.H{
					"success": false,
					"error":   err.Error(),
				})
				return
			}

			c.JSON(200, gin.H{
				"success": true,
				"data":    events,
			})
		})

		realtime.POST("/broadcast/:tenant_id", func(c *gin.Context) {
			tenantID := c.Param("tenant_id")

			var request struct {
				Type     string                 `json:"type" binding:"required"`
				Data     map[string]interface{} `json:"data"`
				UserID   string                 `json:"user_id,omitempty"`
				Priority int                    `json:"priority"`
			}

			if err := c.ShouldBindJSON(&request); err != nil {
				c.JSON(400, gin.H{
					"success": false,
					"error":   err.Error(),
				})
				return
			}

			err := realtimeManager.PublishEvent(request.Type, tenantID, request.UserID, request.Data, request.Priority)
			if err != nil {
				c.JSON(500, gin.H{
					"success": false,
					"error":   err.Error(),
				})
				return
			}

			c.JSON(200, gin.H{
				"success": true,
				"message": "Event broadcasted successfully",
			})
		})
	}

	// Performance monitoring endpoints
	monitoring := api.Group("/monitoring")
	{
		monitoring.GET("/health", func(c *gin.Context) {
			health := performanceMonitor.GetHealthSummary()
			c.JSON(200, gin.H{
				"success": true,
				"data":    health,
			})
		})

		monitoring.GET("/metrics", func(c *gin.Context) {
			metrics := performanceMonitor.GetAllMetrics()
			c.JSON(200, gin.H{
				"success": true,
				"data":    metrics,
			})
		})

		monitoring.GET("/metrics/:name", func(c *gin.Context) {
			name := c.Param("name")
			metric, exists := performanceMonitor.GetMetric(name)
			if !exists {
				c.JSON(404, gin.H{
					"success": false,
					"error":   "Metric not found",
				})
				return
			}

			c.JSON(200, gin.H{
				"success": true,
				"data":    metric,
			})
		})

		monitoring.GET("/alerts", func(c *gin.Context) {
			limit := 50
			if l := c.Query("limit"); l != "" {
				if parsed, err := strconv.Atoi(l); err == nil && parsed > 0 {
					limit = parsed
				}
			}

			alerts, err := performanceMonitor.GetRecentAlerts(limit)
			if err != nil {
				c.JSON(500, gin.H{
					"success": false,
					"error":   err.Error(),
				})
				return
			}

			c.JSON(200, gin.H{
				"success": true,
				"data":    alerts,
			})
		})

		monitoring.GET("/websocket/metrics", func(c *gin.Context) {
			metrics := websocketHub.GetConnectionMetrics()
			c.JSON(200, gin.H{
				"success": true,
				"data":    metrics,
			})
		})
	}
}
