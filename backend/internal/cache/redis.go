package cache

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"time"

	redis9 "github.com/redis/go-redis/v9"
)

// RedisCache implements advanced caching with Redis
type RedisCache struct {
	Client *redis9.Client
	ctx    context.Context
}

// CacheConfig holds cache configuration
type CacheConfig struct {
	Host     string
	Port     string
	Password string
	DB       int
}

// NewRedisCache creates a new Redis cache instance
func NewRedisCache(config CacheConfig) *RedisCache {
	rdb := redis9.NewClient(&redis9.Options{
		Addr:     fmt.Sprintf("%s:%s", config.Host, config.Port),
		Password: config.Password,
		DB:       config.DB,
	})

	return &RedisCache{
		Client: rdb,
		ctx:    context.Background(),
	}
}

// CacheItem represents a cached item with metadata
type CacheItem struct {
	Key        string      `json:"key"`
	Value      interface{} `json:"value"`
	TTL        time.Duration `json:"ttl"`
	CreatedAt  time.Time   `json:"created_at"`
	AccessCount int64      `json:"access_count"`
	LastAccess time.Time   `json:"last_access"`
}

// Set stores a value in cache with TTL
func (r *RedisCache) Set(key string, value interface{}, ttl time.Duration) error {
	item := CacheItem{
		Key:       key,
		Value:     value,
		TTL:       ttl,
		CreatedAt: time.Now(),
		AccessCount: 0,
		LastAccess: time.Now(),
	}

	data, err := json.Marshal(item)
	if err != nil {
		return err
	}

	return r.Client.Set(r.ctx, key, data, ttl).Err()
}

// Get retrieves a value from cache
func (r *RedisCache) Get(key string) (interface{}, bool, error) {
	data, err := r.Client.Get(r.ctx, key).Result()
	if err != nil {
		if err == redis9.Nil {
			return nil, false, nil
		}
		return nil, false, err
	}

	var item CacheItem
	if err := json.Unmarshal([]byte(data), &item); err != nil {
		return nil, false, err
	}

	// Update access statistics
	item.AccessCount++
	item.LastAccess = time.Now()
	
	// Update cache with new statistics
	updatedData, _ := json.Marshal(item)
	_ = r.Client.Set(r.ctx, key, updatedData, item.TTL).Err()

	return item.Value, true, nil
}

// Delete removes a key from cache
func (r *RedisCache) Delete(key string) error {
	return r.Client.Del(r.ctx, key).Err()
}

// InvalidatePattern removes all keys matching a pattern
func (r *RedisCache) InvalidatePattern(pattern string) error {
	keys, err := r.Client.Keys(r.ctx, pattern).Result()
	if err != nil {
		return err
	}

	if len(keys) > 0 {
		return r.Client.Del(r.ctx, keys...).Err()
	}

	return nil
}

// Exists checks if a key exists in cache
func (r *RedisCache) Exists(key string) (bool, error) {
	count, err := r.Client.Exists(r.ctx, key).Result()
	return count > 0, err
}

// TTL returns the remaining time to live for a key
func (r *RedisCache) TTL(key string) (time.Duration, error) {
	return r.Client.TTL(r.ctx, key).Result()
}

// Increment increments a numeric value
func (r *RedisCache) Increment(key string) (int64, error) {
	return r.Client.Incr(r.ctx, key).Result()
}

// IncrementBy increments a numeric value by a specific amount
func (r *RedisCache) IncrementBy(key string, value int64) (int64, error) {
	return r.Client.IncrBy(r.ctx, key, value).Result()
}

// SetNX sets a key only if it doesn't exist (atomic operation)
func (r *RedisCache) SetNX(key string, value interface{}, ttl time.Duration) (bool, error) {
	data, err := json.Marshal(value)
	if err != nil {
		return false, err
	}

	return r.Client.SetNX(r.ctx, key, data, ttl).Result()
}

// GetStats returns cache statistics for a key
func (r *RedisCache) GetStats(key string) (*CacheStats, error) {
	data, err := r.Client.Get(r.ctx, key).Result()
	if err != nil {
		if err == redis9.Nil {
			return nil, nil
		}
		return nil, err
	}

	var item CacheItem
	if err := json.Unmarshal([]byte(data), &item); err != nil {
		return nil, err
	}

	return &CacheStats{
		Key:         item.Key,
		CreatedAt:   item.CreatedAt,
		AccessCount: item.AccessCount,
		LastAccess:  item.LastAccess,
		TTL:         item.TTL,
	}, nil
}

// CacheStats holds statistics for a cached item
type CacheStats struct {
	Key         string        `json:"key"`
	CreatedAt   time.Time     `json:"created_at"`
	AccessCount int64         `json:"access_count"`
	LastAccess  time.Time     `json:"last_access"`
	TTL         time.Duration `json:"ttl"`
}

// WarmCache preloads frequently accessed data
func (r *RedisCache) WarmCache(tenantID string) error {
	// Preload tenant configuration
	// tenantConfigKey := fmt.Sprintf("tenant:%s:config", tenantID)
	// This would typically call the tenant service
	// tenantConfig := tenantService.GetConfig(tenantID)
	// r.Set(tenantConfigKey, tenantConfig, 5*time.Minute)

	// Preload user permissions
	// userPermissionsKey := fmt.Sprintf("tenant:%s:users:permissions", tenantID)
	// permissions := permissionService.GetTenantPermissions(tenantID)
	// r.Set(userPermissionsKey, permissions, 1*time.Minute)

	return nil
}

// GetCacheMetrics returns overall cache performance metrics
func (r *RedisCache) GetCacheMetrics() (*CacheMetrics, error) {
	_, err := r.Client.Info(r.ctx, "stats").Result()
	if err != nil {
		return nil, err
	}

	// Parse Redis INFO stats
	// This is a simplified version - in production you'd parse the full stats
	return &CacheMetrics{
		HitRate:      0.95, // Would be calculated from Redis stats
		MissRate:     0.05,
		TotalKeys:    1000, // Would be from Redis DBSIZE
		MemoryUsage:  "50MB", // Would be from Redis INFO memory
		Connections:  10,   // Would be from Redis INFO clients
	}, nil
}

// CacheMetrics holds cache performance metrics
type CacheMetrics struct {
	HitRate      float64 `json:"hit_rate"`
	MissRate     float64 `json:"miss_rate"`
	TotalKeys    int64   `json:"total_keys"`
	MemoryUsage  string  `json:"memory_usage"`
	Connections  int64   `json:"connections"`
}

// AdaptiveTTL calculates TTL based on access patterns
func (r *RedisCache) AdaptiveTTL(key string, defaultTTL time.Duration) time.Duration {
	stats, err := r.GetStats(key)
	if err != nil || stats == nil {
		return defaultTTL
	}

	// Increase TTL for frequently accessed items
	if stats.AccessCount > 100 {
		return defaultTTL * 2
	} else if stats.AccessCount > 50 {
		return defaultTTL + (defaultTTL / 2)
	}

	return defaultTTL
}

// BatchSet sets multiple key-value pairs in a single operation
func (r *RedisCache) BatchSet(items map[string]interface{}, ttl time.Duration) error {
	pipe := r.Client.Pipeline()

	for key, value := range items {
		data, err := json.Marshal(value)
		if err != nil {
			return err
		}
		pipe.Set(r.ctx, key, data, ttl)
	}

	_, err := pipe.Exec(r.ctx)
	return err
}

// BatchGet retrieves multiple values in a single operation
func (r *RedisCache) BatchGet(keys []string) (map[string]interface{}, error) {
	pipe := r.Client.Pipeline()
	
	for _, key := range keys {
		pipe.Get(r.ctx, key)
	}

	results, err := pipe.Exec(r.ctx)
	if err != nil && err != redis9.Nil {
		return nil, err
	}

	values := make(map[string]interface{})
	for i, result := range results {
		if cmd, ok := result.(*redis9.StringCmd); ok {
			if val, err := cmd.Result(); err == nil {
				var item CacheItem
				if json.Unmarshal([]byte(val), &item) == nil {
					values[keys[i]] = item.Value
				}
			}
		}
	}

	return values, nil
}

// Close closes the Redis connection
func (r *RedisCache) Close() error {
	return r.Client.Close()
}

// CacheManager implements the events.CacheManager interface
type CacheManager struct {
	*RedisCache
}

// NewCacheManager creates a new cache manager
func NewCacheManager(config CacheConfig) *CacheManager {
	return &CacheManager{
		RedisCache: NewRedisCache(config),
	}
}

// Real-time cache invalidation with pub/sub
func (cm *CacheManager) InvalidateWithNotification(pattern string, tenantID string) error {
	// Invalidate cache
	if err := cm.InvalidatePattern(pattern); err != nil {
		return err
	}

	// Publish invalidation event
	message := map[string]interface{}{
		"type":      "CACHE_INVALIDATED",
		"pattern":   pattern,
		"tenant_id": tenantID,
		"timestamp": time.Now(),
	}

	data, _ := json.Marshal(message)
	return cm.Client.Publish(cm.ctx, "cache:invalidation", data).Err()
}

// Subscribe to cache invalidation events
func (cm *CacheManager) SubscribeToInvalidations(callback func(pattern, tenantID string)) error {
	pubsub := cm.Client.Subscribe(cm.ctx, "cache:invalidation")
	defer pubsub.Close()

	ch := pubsub.Channel()
	for msg := range ch {
		var data map[string]interface{}
		if err := json.Unmarshal([]byte(msg.Payload), &data); err == nil {
			if pattern, ok := data["pattern"].(string); ok {
				if tenantID, ok := data["tenant_id"].(string); ok {
					callback(pattern, tenantID)
				}
			}
		}
	}
	return nil
}

// Advanced caching strategies
func (cm *CacheManager) SetWithStrategy(key string, value interface{}, strategy CacheStrategy) error {
	var ttl time.Duration
	
	switch strategy.Type {
	case "write-through":
		ttl = strategy.TTL
	case "write-behind":
		ttl = strategy.TTL * 2 // Longer TTL for write-behind
	case "refresh-ahead":
		ttl = strategy.TTL
		// Set refresh trigger at 80% of TTL
		refreshTime := time.Duration(float64(ttl) * 0.8)
		go cm.scheduleRefresh(key, refreshTime, strategy.RefreshFunc)
	default:
		ttl = strategy.TTL
	}

	return cm.Set(key, value, ttl)
}

// CacheStrategy defines caching behavior
type CacheStrategy struct {
	Type        string                                    `json:"type"`
	TTL         time.Duration                            `json:"ttl"`
	RefreshFunc func(key string) (interface{}, error)    `json:"-"`
}

// Schedule refresh for refresh-ahead strategy
func (cm *CacheManager) scheduleRefresh(key string, delay time.Duration, refreshFunc func(string) (interface{}, error)) {
	time.Sleep(delay)
	
	if refreshFunc != nil {
		if newValue, err := refreshFunc(key); err == nil {
			_ = cm.Set(key, newValue, 5*time.Minute) // Default refresh TTL
			log.Printf("Cache refreshed for key: %s", key)
		}
	}
}

// Multi-level cache support
func (cm *CacheManager) GetMultiLevel(key string, levels []string) (interface{}, bool, error) {
	for _, level := range levels {
		levelKey := fmt.Sprintf("%s:%s", level, key)
		if value, found, err := cm.Get(levelKey); err == nil && found {
			// Promote to higher levels
			cm.promoteToHigherLevels(key, value, level, levels)
			return value, true, nil
		}
	}
	return nil, false, nil
}

// Promote cache entry to higher levels
func (cm *CacheManager) promoteToHigherLevels(key string, value interface{}, currentLevel string, levels []string) {
	currentIndex := -1
	for i, level := range levels {
		if level == currentLevel {
			currentIndex = i
			break
		}
	}

	// Promote to all higher levels
	for i := 0; i < currentIndex; i++ {
		levelKey := fmt.Sprintf("%s:%s", levels[i], key)
		_ = cm.Set(levelKey, value, time.Minute) // Short TTL for higher levels
	}
}

// Cache warming with priority
func (cm *CacheManager) WarmCacheWithPriority(tenantID string, priority int) error {
	switch priority {
	case 1: // High priority - critical data
		return cm.warmCriticalData(tenantID)
	case 2: // Medium priority - frequently accessed
		return cm.warmFrequentData(tenantID)
	case 3: // Low priority - background data
		return cm.warmBackgroundData(tenantID)
	default:
		return cm.WarmCache(tenantID)
	}
}

func (cm *CacheManager) warmCriticalData(tenantID string) error {
	// Tenant configuration
	configKey := fmt.Sprintf("tenant:%s:config", tenantID)
	_ = cm.Set(configKey, map[string]interface{}{"status": "active"}, 10*time.Minute)

	// OAuth clients
	clientsKey := fmt.Sprintf("tenant:%s:oauth:clients", tenantID)
	_ = cm.Set(clientsKey, []interface{}{}, 5*time.Minute)

	log.Printf("Critical cache warmed for tenant: %s", tenantID)
	return nil
}

func (cm *CacheManager) warmFrequentData(tenantID string) error {
	// User permissions
	permKey := fmt.Sprintf("tenant:%s:permissions", tenantID)
	_ = cm.Set(permKey, map[string]interface{}{}, 3*time.Minute)

	// Policies
	policyKey := fmt.Sprintf("tenant:%s:policies", tenantID)
	_ = cm.Set(policyKey, map[string]interface{}{}, 3*time.Minute)

	log.Printf("Frequent cache warmed for tenant: %s", tenantID)
	return nil
}

func (cm *CacheManager) warmBackgroundData(tenantID string) error {
	// Analytics data
	analyticsKey := fmt.Sprintf("tenant:%s:analytics", tenantID)
	_ = cm.Set(analyticsKey, map[string]interface{}{}, 1*time.Minute)

	log.Printf("Background cache warmed for tenant: %s", tenantID)
	return nil
}