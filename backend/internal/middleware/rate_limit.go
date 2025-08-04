package middleware

import (
	"context"
	"fmt"
	"iam-saas/internal/cache"
	"iam-saas/internal/events"
	"net/http"
	"strconv"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
)

// RateLimiter provides rate limiting functionality
type RateLimiter struct {
	cacheManager *cache.CacheManager
	eventBus     *events.EventBus
}

// RateLimitConfig represents rate limit configuration
type RateLimitConfig struct {
	TenantID        int64         `json:"tenant_id"`
	Endpoint        string        `json:"endpoint"`        // API endpoint pattern
	Method          string        `json:"method"`          // HTTP method
	RequestsPerHour int           `json:"requests_per_hour"`
	RequestsPerDay  int           `json:"requests_per_day"`
	BurstLimit      int           `json:"burst_limit"`     // Max requests in burst window
	BurstWindow     time.Duration `json:"burst_window"`    // Burst window duration
	Enabled         bool          `json:"enabled"`
	CreatedAt       time.Time     `json:"created_at"`
	UpdatedAt       time.Time     `json:"updated_at"`
}

// RateLimitStatus represents current rate limit status
type RateLimitStatus struct {
	TenantID        int64     `json:"tenant_id"`
	Endpoint        string    `json:"endpoint"`
	Method          string    `json:"method"`
	CurrentHour     int       `json:"current_hour"`
	CurrentDay      int       `json:"current_day"`
	CurrentBurst    int       `json:"current_burst"`
	LimitHour       int       `json:"limit_hour"`
	LimitDay        int       `json:"limit_day"`
	LimitBurst      int       `json:"limit_burst"`
	ResetTime       time.Time `json:"reset_time"`
	BurstResetTime  time.Time `json:"burst_reset_time"`
	Blocked         bool      `json:"blocked"`
	BlockedUntil    time.Time `json:"blocked_until,omitempty"`
}

// NewRateLimiter creates a new rate limiter
func NewRateLimiter(cacheManager *cache.CacheManager, eventBus *events.EventBus) *RateLimiter {
	return &RateLimiter{
		cacheManager: cacheManager,
		eventBus:     eventBus,
	}
}

// RateLimitMiddleware creates a rate limiting middleware
func (rl *RateLimiter) RateLimitMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		// Extract tenant ID from context
		tenantID := rl.extractTenantID(c)
		if tenantID == 0 {
			// No tenant context, skip rate limiting for public endpoints
			c.Next()
			return
		}

		// Get rate limit configuration for this endpoint
		config := rl.getRateLimitConfig(c, tenantID)
		if config == nil || !config.Enabled {
			// No rate limit configured or disabled
			c.Next()
			return
		}

		// Check rate limits
		status, allowed := rl.checkRateLimit(c.Request.Context(), config, c.ClientIP())
		
		// Set rate limit headers
		rl.setRateLimitHeaders(c, status)

		if !allowed {
			// Rate limit exceeded
			rl.handleRateLimitExceeded(c, status)
			return
		}

		// Increment counters
		rl.incrementCounters(c.Request.Context(), config, c.ClientIP())

		c.Next()
	}
}

// extractTenantID extracts tenant ID from request context
func (rl *RateLimiter) extractTenantID(c *gin.Context) int64 {
	// Try to get from context (set by tenant middleware)
	if tenantID, exists := c.Get("tenant_id"); exists {
		if id, ok := tenantID.(int64); ok {
			return id
		}
	}

	// Try to extract from path (for tenant-specific endpoints)
	path := c.Request.URL.Path
	if strings.HasPrefix(path, "/api/v1/tenant/") {
		// Extract tenant from path like /api/v1/tenant/{tenant_id}/...
		parts := strings.Split(path, "/")
		if len(parts) > 4 {
			if id, err := strconv.ParseInt(parts[4], 10, 64); err == nil {
				return id
			}
		}
	}

	return 0
}

// getRateLimitConfig gets rate limit configuration for endpoint
func (rl *RateLimiter) getRateLimitConfig(c *gin.Context, tenantID int64) *RateLimitConfig {
	endpoint := rl.normalizeEndpoint(c.Request.URL.Path)
	method := c.Request.Method

	// Try to get from cache first
	cacheKey := fmt.Sprintf("rate_limit_config:%d:%s:%s", tenantID, method, endpoint)
	
	var config RateLimitConfig
	if data, exists, err := rl.cacheManager.Get(cacheKey); err == nil && exists {
		if configData, ok := data.(RateLimitConfig); ok {
			config = configData
		}
		return &config
	}

	// Default rate limits if no specific config found
	defaultConfig := &RateLimitConfig{
		TenantID:        tenantID,
		Endpoint:        endpoint,
		Method:          method,
		RequestsPerHour: 1000,  // Default: 1000 requests per hour
		RequestsPerDay:  10000, // Default: 10000 requests per day
		BurstLimit:      100,   // Default: 100 requests in burst
		BurstWindow:     time.Minute,
		Enabled:         true,
		CreatedAt:       time.Now(),
		UpdatedAt:       time.Now(),
	}

	// Cache the default config
	_ = rl.cacheManager.Set(cacheKey, defaultConfig, 5*time.Minute)

	return defaultConfig
}

// normalizeEndpoint normalizes API endpoint for rate limiting
func (rl *RateLimiter) normalizeEndpoint(path string) string {
	// Remove tenant-specific parts and normalize to pattern
	// Example: /api/v1/tenant/123/users/456 -> /api/v1/tenant/*/users/*
	
	parts := strings.Split(path, "/")
	normalized := make([]string, 0, len(parts))
	
	for i, part := range parts {
		if part == "" {
			continue
		}
		
		// Replace numeric IDs with wildcards
		if rl.isNumeric(part) {
			// Check if this looks like an ID (previous part suggests it)
			if i > 0 && rl.isResourceName(parts[i-1]) {
				normalized = append(normalized, "*")
			} else {
				normalized = append(normalized, part)
			}
		} else {
			normalized = append(normalized, part)
		}
	}
	
	return "/" + strings.Join(normalized, "/")
}

// isNumeric checks if string is numeric
func (rl *RateLimiter) isNumeric(s string) bool {
	_, err := strconv.ParseInt(s, 10, 64)
	return err == nil
}

// isResourceName checks if string looks like a resource name
func (rl *RateLimiter) isResourceName(s string) bool {
	resourceNames := []string{"users", "roles", "policies", "webhooks", "applications", "tenants"}
	for _, name := range resourceNames {
		if s == name {
			return true
		}
	}
	return false
}

// checkRateLimit checks if request is within rate limits
func (rl *RateLimiter) checkRateLimit(ctx context.Context, config *RateLimitConfig, clientIP string) (*RateLimitStatus, bool) {
	now := time.Now()
	
	// Create rate limit keys
	hourKey := fmt.Sprintf("rate_limit:hour:%d:%s:%s:%s", 
		config.TenantID, config.Method, config.Endpoint, now.Format("2006010215"))
	dayKey := fmt.Sprintf("rate_limit:day:%d:%s:%s:%s", 
		config.TenantID, config.Method, config.Endpoint, now.Format("20060102"))
	burstKey := fmt.Sprintf("rate_limit:burst:%d:%s:%s:%s", 
		config.TenantID, config.Method, config.Endpoint, clientIP)

	// Get current counts
	hourCount := rl.getCounter(hourKey)
	dayCount := rl.getCounter(dayKey)
	burstCount := rl.getBurstCounter(burstKey, config.BurstWindow)

	// Calculate reset times
	hourReset := now.Truncate(time.Hour).Add(time.Hour)
	dayReset := now.Truncate(24 * time.Hour).Add(24 * time.Hour)
	burstReset := now.Add(config.BurstWindow)

	status := &RateLimitStatus{
		TenantID:       config.TenantID,
		Endpoint:       config.Endpoint,
		Method:         config.Method,
		CurrentHour:    hourCount,
		CurrentDay:     dayCount,
		CurrentBurst:   burstCount,
		LimitHour:      config.RequestsPerHour,
		LimitDay:       config.RequestsPerDay,
		LimitBurst:     config.BurstLimit,
		ResetTime:      hourReset,
		BurstResetTime: burstReset,
		Blocked:        false,
	}

	// Check limits
	if hourCount >= config.RequestsPerHour {
		status.Blocked = true
		status.BlockedUntil = hourReset
		return status, false
	}

	if dayCount >= config.RequestsPerDay {
		status.Blocked = true
		status.BlockedUntil = dayReset
		return status, false
	}

	if burstCount >= config.BurstLimit {
		status.Blocked = true
		status.BlockedUntil = burstReset
		return status, false
	}

	return status, true
}

// getCounter gets counter value from cache
func (rl *RateLimiter) getCounter(key string) int {
	if data, exists, err := rl.cacheManager.Get(key); err == nil && exists {
		if count, ok := data.(int); ok {
			return count
		}
	}
	return 0
}

// getBurstCounter gets burst counter with sliding window
func (rl *RateLimiter) getBurstCounter(key string, window time.Duration) int {
	// For burst limiting, we use a sliding window approach
	// This is a simplified implementation - in production, use Redis sorted sets
	if data, exists, err := rl.cacheManager.Get(key); err == nil && exists {
		if count, ok := data.(int); ok {
			return count
		}
	}
	return 0
}

// incrementCounters increments rate limit counters
func (rl *RateLimiter) incrementCounters(ctx context.Context, config *RateLimitConfig, clientIP string) {
	now := time.Now()
	
	// Create rate limit keys
	hourKey := fmt.Sprintf("rate_limit:hour:%d:%s:%s:%s", 
		config.TenantID, config.Method, config.Endpoint, now.Format("2006010215"))
	dayKey := fmt.Sprintf("rate_limit:day:%d:%s:%s:%s", 
		config.TenantID, config.Method, config.Endpoint, now.Format("20060102"))
	burstKey := fmt.Sprintf("rate_limit:burst:%d:%s:%s:%s", 
		config.TenantID, config.Method, config.Endpoint, clientIP)

	// Increment counters
	rl.incrementCounter(hourKey, time.Hour)
	rl.incrementCounter(dayKey, 24*time.Hour)
	rl.incrementCounter(burstKey, config.BurstWindow)
}

// incrementCounter increments a counter with expiration
func (rl *RateLimiter) incrementCounter(key string, expiration time.Duration) {
	current := rl.getCounter(key)
	_ = rl.cacheManager.Set(key, current+1, expiration)
}

// setRateLimitHeaders sets rate limit headers in response
func (rl *RateLimiter) setRateLimitHeaders(c *gin.Context, status *RateLimitStatus) {
	c.Header("X-RateLimit-Limit-Hour", strconv.Itoa(status.LimitHour))
	c.Header("X-RateLimit-Remaining-Hour", strconv.Itoa(max(0, status.LimitHour-status.CurrentHour)))
	c.Header("X-RateLimit-Reset-Hour", strconv.FormatInt(status.ResetTime.Unix(), 10))
	
	c.Header("X-RateLimit-Limit-Day", strconv.Itoa(status.LimitDay))
	c.Header("X-RateLimit-Remaining-Day", strconv.Itoa(max(0, status.LimitDay-status.CurrentDay)))
	
	c.Header("X-RateLimit-Limit-Burst", strconv.Itoa(status.LimitBurst))
	c.Header("X-RateLimit-Remaining-Burst", strconv.Itoa(max(0, status.LimitBurst-status.CurrentBurst)))
	
	if status.Blocked {
		c.Header("Retry-After", strconv.FormatInt(int64(time.Until(status.BlockedUntil).Seconds()), 10))
	}
}

// handleRateLimitExceeded handles rate limit exceeded scenario
func (rl *RateLimiter) handleRateLimitExceeded(c *gin.Context, status *RateLimitStatus) {
	// Publish rate limit exceeded event
	if rl.eventBus != nil {
		_ = rl.eventBus.Publish(events.Event{
			Type:     events.EventRateLimitExceeded,
			TenantID: fmt.Sprintf("%d", status.TenantID),
			Data: map[string]interface{}{
				"endpoint":      status.Endpoint,
				"method":        status.Method,
				"current_hour":  status.CurrentHour,
				"current_day":   status.CurrentDay,
				"current_burst": status.CurrentBurst,
				"client_ip":     c.ClientIP(),
				"blocked_until": status.BlockedUntil,
			},
		})
	}

	c.JSON(http.StatusTooManyRequests, gin.H{
		"error":   "Rate limit exceeded",
		"message": "Too many requests. Please try again later.",
		"retry_after": int64(time.Until(status.BlockedUntil).Seconds()),
		"limits": gin.H{
			"hour":  status.LimitHour,
			"day":   status.LimitDay,
			"burst": status.LimitBurst,
		},
		"current": gin.H{
			"hour":  status.CurrentHour,
			"day":   status.CurrentDay,
			"burst": status.CurrentBurst,
		},
	})
	c.Abort()
}

// max returns the maximum of two integers
func max(a, b int) int {
	if a > b {
		return a
	}
	return b
}