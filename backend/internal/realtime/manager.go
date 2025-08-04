package realtime

import (
	"context"
	"encoding/json"
	"fmt"
	"iam-saas/internal/cache"
	"iam-saas/internal/events"
	"iam-saas/internal/websocket"
	"log"
	"sync"
	"time"
)

// RealtimeManager coordinates real-time updates across the system
type RealtimeManager struct {
	websocketHub *websocket.Hub
	eventBus     *events.EventBus
	cacheManager *cache.CacheManager
	subscribers  map[string][]chan RealtimeEvent
	mutex        sync.RWMutex
}

// RealtimeEvent represents a real-time event
type RealtimeEvent struct {
	Type      string                 `json:"type"`
	TenantID  string                 `json:"tenant_id"`
	UserID    string                 `json:"user_id,omitempty"`
	Data      map[string]interface{} `json:"data"`
	Timestamp time.Time              `json:"timestamp"`
	Priority  int                    `json:"priority"` // 1=high, 2=medium, 3=low
}

// NewRealtimeManager creates a new realtime manager
func NewRealtimeManager(hub *websocket.Hub, eventBus *events.EventBus, cacheManager *cache.CacheManager) *RealtimeManager {
	rm := &RealtimeManager{
		websocketHub: hub,
		eventBus:     eventBus,
		cacheManager: cacheManager,
		subscribers:  make(map[string][]chan RealtimeEvent),
	}

	// Setup event subscriptions
	rm.setupEventSubscriptions()
	
	return rm
}

// Setup event subscriptions for real-time propagation
func (rm *RealtimeManager) setupEventSubscriptions() {
	// Tenant configuration changes
	rm.eventBus.Subscribe(events.EventTenantBrandingUpdated, func(event events.Event) error {
		realtimeEvent := RealtimeEvent{
			Type:      "TENANT_BRANDING_UPDATED",
			TenantID:  event.TenantID,
			Data:      event.Data,
			Timestamp: time.Now(),
			Priority:  1, // High priority
		}
		
		return rm.propagateEvent(realtimeEvent)
	})

	// User permission changes
	rm.eventBus.Subscribe(events.EventUserPermissionsUpdated, func(event events.Event) error {
		realtimeEvent := RealtimeEvent{
			Type:      "USER_PERMISSIONS_UPDATED",
			TenantID:  event.TenantID,
			UserID:    event.UserID,
			Data:      event.Data,
			Timestamp: time.Now(),
			Priority:  1, // High priority
		}
		
		return rm.propagateEvent(realtimeEvent)
	})

	// Policy updates
	rm.eventBus.Subscribe(events.EventPolicyUpdated, func(event events.Event) error {
		realtimeEvent := RealtimeEvent{
			Type:      "POLICY_UPDATED",
			TenantID:  event.TenantID,
			Data:      event.Data,
			Timestamp: time.Now(),
			Priority:  2, // Medium priority
		}
		
		return rm.propagateEvent(realtimeEvent)
	})

	// Security alerts
	rm.eventBus.Subscribe(events.EventSecurityAlert, func(event events.Event) error {
		realtimeEvent := RealtimeEvent{
			Type:      "SECURITY_ALERT",
			TenantID:  event.TenantID,
			Data:      event.Data,
			Timestamp: time.Now(),
			Priority:  1, // High priority
		}
		
		return rm.propagateEvent(realtimeEvent)
	})

	log.Println("Real-time event subscriptions setup completed")
}

// Propagate event to all connected channels
func (rm *RealtimeManager) propagateEvent(event RealtimeEvent) error {
	// 1. Send to WebSocket clients
	if err := rm.sendToWebSocketClients(event); err != nil {
		log.Printf("Error sending to WebSocket clients: %v", err)
	}

	// 2. Update cache with real-time data
	if err := rm.updateRealtimeCache(event); err != nil {
		log.Printf("Error updating real-time cache: %v", err)
	}

	// 3. Notify local subscribers
	rm.notifySubscribers(event)

	// 4. Store event for replay (for clients that reconnect)
	if err := rm.storeEventForReplay(event); err != nil {
		log.Printf("Error storing event for replay: %v", err)
	}

	return nil
}

// Send event to WebSocket clients
func (rm *RealtimeManager) sendToWebSocketClients(event RealtimeEvent) error {
	message := map[string]interface{}{
		"type":      event.Type,
		"data":      event.Data,
		"timestamp": event.Timestamp,
		"priority":  event.Priority,
	}

	// Send to specific user if UserID is provided
	if event.UserID != "" {
		rm.websocketHub.BroadcastToUser(event.TenantID, event.UserID, event.Type, message)
	} else {
		// Send to all tenant users
		rm.websocketHub.BroadcastToTenant(event.TenantID, event.Type, message)
	}

	return nil
}

// Update cache with real-time data
func (rm *RealtimeManager) updateRealtimeCache(event RealtimeEvent) error {
	// Cache the event for recent events lookup
	eventKey := fmt.Sprintf("realtime:events:%s:%d", event.TenantID, time.Now().Unix())
	if err := rm.cacheManager.Set(eventKey, event, 5*time.Minute); err != nil {
		return err
	}

	// Update specific cache based on event type
	switch event.Type {
	case "TENANT_BRANDING_UPDATED":
		cacheKey := fmt.Sprintf("tenant:%s:branding", event.TenantID)
		_ = rm.cacheManager.Set(cacheKey, event.Data, 10*time.Minute)
		
	case "USER_PERMISSIONS_UPDATED":
		cacheKey := fmt.Sprintf("tenant:%s:user:%s:permissions", event.TenantID, event.UserID)
		_ = rm.cacheManager.Set(cacheKey, event.Data, 5*time.Minute)
		
	case "POLICY_UPDATED":
		cacheKey := fmt.Sprintf("tenant:%s:policies", event.TenantID)
		_ = rm.cacheManager.InvalidatePattern(cacheKey + "*")
	}

	return nil
}

// Notify local subscribers
func (rm *RealtimeManager) notifySubscribers(event RealtimeEvent) {
	rm.mutex.RLock()
	defer rm.mutex.RUnlock()

	// Notify subscribers for this event type
	if subscribers, exists := rm.subscribers[event.Type]; exists {
		for _, subscriber := range subscribers {
			select {
			case subscriber <- event:
			default:
				// Channel is full, skip this subscriber
				log.Printf("Subscriber channel full for event type: %s", event.Type)
			}
		}
	}

	// Notify wildcard subscribers
	if subscribers, exists := rm.subscribers["*"]; exists {
		for _, subscriber := range subscribers {
			select {
			case subscriber <- event:
			default:
				log.Printf("Wildcard subscriber channel full")
			}
		}
	}
}

// Store event for replay to reconnecting clients
func (rm *RealtimeManager) storeEventForReplay(event RealtimeEvent) error {
	// Store in a list for the tenant
	replayKey := fmt.Sprintf("realtime:replay:%s", event.TenantID)
	
	eventData, err := json.Marshal(event)
	if err != nil {
		return err
	}

	// Add to list (keep last 100 events)
	pipe := rm.cacheManager.RedisCache.Client.Pipeline()
	pipe.LPush(context.Background(), replayKey, eventData)
	pipe.LTrim(context.Background(), replayKey, 0, 99) // Keep only last 100
	pipe.Expire(context.Background(), replayKey, 1*time.Hour)
	
	_, err = pipe.Exec(context.Background())
	return err
}

// Subscribe to real-time events
func (rm *RealtimeManager) Subscribe(eventType string) <-chan RealtimeEvent {
	rm.mutex.Lock()
	defer rm.mutex.Unlock()

	ch := make(chan RealtimeEvent, 100) // Buffered channel
	
	if rm.subscribers[eventType] == nil {
		rm.subscribers[eventType] = make([]chan RealtimeEvent, 0)
	}
	
	rm.subscribers[eventType] = append(rm.subscribers[eventType], ch)
	
	return ch
}

// Unsubscribe from real-time events
func (rm *RealtimeManager) Unsubscribe(eventType string, ch <-chan RealtimeEvent) {
	rm.mutex.Lock()
	defer rm.mutex.Unlock()

	if subscribers, exists := rm.subscribers[eventType]; exists {
		for i, subscriber := range subscribers {
			if subscriber == ch {
				// Remove this subscriber
				rm.subscribers[eventType] = append(subscribers[:i], subscribers[i+1:]...)
				close(subscriber)
				break
			}
		}
	}
}

// Get recent events for a tenant (for client reconnection)
func (rm *RealtimeManager) GetRecentEvents(tenantID string, since time.Time) ([]RealtimeEvent, error) {
	replayKey := fmt.Sprintf("realtime:replay:%s", tenantID)
	
	// Get all events from the replay list
	eventStrings, err := rm.cacheManager.RedisCache.Client.LRange(context.Background(), replayKey, 0, -1).Result()
	if err != nil {
		return nil, err
	}

	var events []RealtimeEvent
	for _, eventString := range eventStrings {
		var event RealtimeEvent
		if err := json.Unmarshal([]byte(eventString), &event); err == nil {
			if event.Timestamp.After(since) {
				events = append(events, event)
			}
		}
	}

	return events, nil
}

// Publish a custom real-time event
func (rm *RealtimeManager) PublishEvent(eventType, tenantID, userID string, data map[string]interface{}, priority int) error {
	event := RealtimeEvent{
		Type:      eventType,
		TenantID:  tenantID,
		UserID:    userID,
		Data:      data,
		Timestamp: time.Now(),
		Priority:  priority,
	}

	return rm.propagateEvent(event)
}

// Get real-time metrics
func (rm *RealtimeManager) GetMetrics() *RealtimeMetrics {
	rm.mutex.RLock()
	defer rm.mutex.RUnlock()

	totalSubscribers := 0
	for _, subscribers := range rm.subscribers {
		totalSubscribers += len(subscribers)
	}

	return &RealtimeMetrics{
		ActiveSubscribers:    totalSubscribers,
		EventTypes:          len(rm.subscribers),
		WebSocketConnections: rm.websocketHub.GetConnectionCount(),
		Timestamp:           time.Now(),
	}
}

// RealtimeMetrics holds real-time system metrics
type RealtimeMetrics struct {
	ActiveSubscribers    int       `json:"active_subscribers"`
	EventTypes          int       `json:"event_types"`
	WebSocketConnections int       `json:"websocket_connections"`
	Timestamp           time.Time `json:"timestamp"`
}