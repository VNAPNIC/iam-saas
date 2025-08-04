package events

import (
	"context"
	"fmt"
	"log"
	"sync"
	"time"
)

// EventBus handles event-driven architecture for real-time updates
type EventBus struct {
	subscribers map[string][]EventHandler
	mutex       sync.RWMutex
	buffer      chan Event
	ctx         context.Context
	cancel      context.CancelFunc
}

// Event represents a system event
type Event struct {
	ID        string                 `json:"id"`
	Type      string                 `json:"type"`
	TenantID  string                 `json:"tenant_id,omitempty"`
	UserID    string                 `json:"user_id,omitempty"`
	Data      map[string]interface{} `json:"data"`
	Timestamp time.Time              `json:"timestamp"`
	Source    string                 `json:"source"`
}

// EventHandler is a function that handles events
type EventHandler func(event Event) error

// NewEventBus creates a new event bus
func NewEventBus() *EventBus {
	ctx, cancel := context.WithCancel(context.Background())
	
	bus := &EventBus{
		subscribers: make(map[string][]EventHandler),
		buffer:      make(chan Event, 1000), // Buffer for 1000 events
		ctx:         ctx,
		cancel:      cancel,
	}
	
	// Start event processing
	go bus.processEvents()
	
	return bus
}

// Subscribe adds an event handler for a specific event type
func (eb *EventBus) Subscribe(eventType string, handler EventHandler) {
	eb.mutex.Lock()
	defer eb.mutex.Unlock()
	
	eb.subscribers[eventType] = append(eb.subscribers[eventType], handler)
	log.Printf("Subscribed to event type: %s", eventType)
}

// Publish publishes an event to all subscribers
func (eb *EventBus) Publish(event Event) error {
	event.ID = generateEventID()
	event.Timestamp = time.Now()
	
	select {
	case eb.buffer <- event:
		return nil
	default:
		return fmt.Errorf("event buffer full, dropping event: %s", event.Type)
	}
}

// PublishTenantEvent publishes a tenant-specific event
func (eb *EventBus) PublishTenantEvent(eventType, tenantID string, data map[string]interface{}) error {
	event := Event{
		Type:     eventType,
		TenantID: tenantID,
		Data:     data,
		Source:   "tenant_service",
	}
	
	return eb.Publish(event)
}

// PublishUserEvent publishes a user-specific event
func (eb *EventBus) PublishUserEvent(eventType, tenantID, userID string, data map[string]interface{}) error {
	event := Event{
		Type:     eventType,
		TenantID: tenantID,
		UserID:   userID,
		Data:     data,
		Source:   "user_service",
	}
	
	return eb.Publish(event)
}

// processEvents processes events from the buffer
func (eb *EventBus) processEvents() {
	for {
		select {
		case event := <-eb.buffer:
			eb.handleEvent(event)
		case <-eb.ctx.Done():
			return
		}
	}
}

// handleEvent distributes an event to all subscribers
func (eb *EventBus) handleEvent(event Event) {
	eb.mutex.RLock()
	handlers := eb.subscribers[event.Type]
	eb.mutex.RUnlock()
	
	for _, handler := range handlers {
		go func(h EventHandler, e Event) {
			if err := h(e); err != nil {
				log.Printf("Error handling event %s: %v", e.Type, err)
			}
		}(handler, event)
	}
}

// Close shuts down the event bus
func (eb *EventBus) Close() {
	eb.cancel()
}

// Event types constants
const (
	// Tenant events
	EventTenantCreated        = "tenant.created"
	EventTenantUpdated        = "tenant.updated"
	EventTenantSuspended      = "tenant.suspended"
	EventTenantActivated      = "tenant.activated"
	EventTenantBrandingUpdated = "tenant.branding.updated"
	EventTenantSettingsUpdated = "tenant.settings.updated"
	EventTenantEmailSettingsUpdated = "tenant.email_settings.updated"
	EventTenantPasswordPolicyUpdated = "tenant.password_policy.updated"
	EventTenantDomainUpdated = "tenant.domain.updated"
	EventTenantDomainVerified = "tenant.domain.verified"
	EventTenantStatusUpdated = "tenant.status.updated"
	EventTenantMFASettingsUpdated = "tenant.mfa_settings.updated"
	
	// SSO events
	EventSSOProviderCreated = "sso.provider.created"
	EventSSOProviderUpdated = "sso.provider.updated"
	EventSSOProviderDeleted = "sso.provider.deleted"
	EventSSOProviderTested = "sso.provider.tested"
	EventSSOProviderValidated = "sso.provider.validated"
	
	// Webhook events
	EventWebhookCreated = "webhook.created"
	EventWebhookUpdated = "webhook.updated"
	EventWebhookDeleted = "webhook.deleted"
	EventWebhookDeliverySuccess = "webhook.delivery.success"
	EventWebhookDeliveryFailed = "webhook.delivery.failed"
	EventWebhookDeliveryRetry = "webhook.delivery.retry"
	
	// Rate limiting events
	EventRateLimitExceeded = "rate_limit.exceeded"
	EventRateLimitConfigUpdated = "rate_limit.config.updated"
	EventRateLimitReset = "rate_limit.reset"
	
	// User events
	EventUserCreated          = "user.created"
	EventUserUpdated          = "user.updated"
	EventUserDeactivated      = "user.deactivated"
	EventUserActivated        = "user.activated"
	EventUserRoleAssigned     = "user.role.assigned"
	EventUserRoleRemoved      = "user.role.removed"
	EventUserPermissionsUpdated = "user.permissions.updated"
	
	// Application events
	EventApplicationCreated   = "application.created"
	EventApplicationUpdated   = "application.updated"
	EventApplicationDeleted   = "application.deleted"
	
	// Policy events
	EventPolicyCreated        = "policy.created"
	EventPolicyUpdated        = "policy.updated"
	EventPolicyDeleted        = "policy.deleted"
	
	// Authentication events
	EventUserLogin            = "user.login"
	EventUserLogout           = "user.logout"
	EventUserLoginFailed      = "user.login.failed"
	EventMFAEnabled           = "user.mfa.enabled"
	EventMFADisabled          = "user.mfa.disabled"
	
	// Security events
	EventSecurityAlert        = "security.alert"
	EventSuspiciousActivity   = "security.suspicious"
	EventPasswordChanged      = "user.password.changed"
	
	// System events
	EventSystemAlert          = "system.alert"
	EventPerformanceAlert     = "system.performance.alert"
)

// generateEventID generates a unique event ID
func generateEventID() string {
	return fmt.Sprintf("evt_%d", time.Now().UnixNano())
}

// EventSubscriptions sets up all event subscriptions
func SetupEventSubscriptions(eventBus *EventBus, cacheManager CacheManager, websocketHub WebSocketHub) {
	// Tenant branding updates
	eventBus.Subscribe(EventTenantBrandingUpdated, func(event Event) error {
		// Invalidate tenant config cache
		cacheKey := fmt.Sprintf("tenant:%s:config", event.TenantID)
		_ = cacheManager.InvalidatePattern(cacheKey)
		
		// Broadcast to WebSocket clients
		websocketHub.BroadcastToTenant(event.TenantID, "BRANDING_UPDATED", event.Data)
		
		log.Printf("Processed tenant branding update for tenant: %s", event.TenantID)
		return nil
	})
	
	// User permission updates
	eventBus.Subscribe(EventUserPermissionsUpdated, func(event Event) error {
		// Invalidate user permissions cache
		cacheKey := fmt.Sprintf("user:%s:permissions", event.UserID)
		_ = cacheManager.InvalidatePattern(cacheKey)
		
		// Broadcast to specific user
		websocketHub.BroadcastToUser(event.TenantID, event.UserID, "PERMISSIONS_UPDATED", event.Data)
		
		log.Printf("Processed user permissions update for user: %s", event.UserID)
		return nil
	})
	
	// User status changes
	eventBus.Subscribe(EventUserDeactivated, func(event Event) error {
		// Invalidate user cache
		cacheKey := fmt.Sprintf("user:%s:*", event.UserID)
		_ = cacheManager.InvalidatePattern(cacheKey)
		
		// Revoke user sessions (would call session service)
		// sessionService.RevokeUserSessions(event.UserID)
		
		// Notify user of deactivation
		websocketHub.BroadcastToUser(event.TenantID, event.UserID, "ACCOUNT_DEACTIVATED", event.Data)
		
		log.Printf("Processed user deactivation for user: %s", event.UserID)
		return nil
	})
	
	// Policy updates
	eventBus.Subscribe(EventPolicyUpdated, func(event Event) error {
		// Invalidate policy cache
		cacheKey := fmt.Sprintf("tenant:%s:policies", event.TenantID)
		_ = cacheManager.InvalidatePattern(cacheKey)
		
		// Broadcast policy update to all tenant users
		websocketHub.BroadcastToTenant(event.TenantID, "POLICY_UPDATED", event.Data)
		
		log.Printf("Processed policy update for tenant: %s", event.TenantID)
		return nil
	})
	
	// Application configuration updates
	eventBus.Subscribe(EventApplicationUpdated, func(event Event) error {
		// Invalidate OAuth client cache
		cacheKey := fmt.Sprintf("tenant:%s:oauth:clients", event.TenantID)
		_ = cacheManager.InvalidatePattern(cacheKey)
		
		// Broadcast to tenant admins
		websocketHub.BroadcastToTenant(event.TenantID, "APPLICATION_UPDATED", event.Data)
		
		log.Printf("Processed application update for tenant: %s", event.TenantID)
		return nil
	})
	
	// Security events
	eventBus.Subscribe(EventSecurityAlert, func(event Event) error {
		// Broadcast security alert to admins
		websocketHub.BroadcastToTenant(event.TenantID, "SECURITY_ALERT", event.Data)
		
		// Log security event (would integrate with SIEM)
		log.Printf("Security alert for tenant %s: %v", event.TenantID, event.Data)
		return nil
	})
}

// CacheManager interface for cache operations
type CacheManager interface {
	InvalidatePattern(pattern string) error
}

// WebSocketHub interface for WebSocket operations
type WebSocketHub interface {
	BroadcastToTenant(tenantID, messageType string, data interface{})
	BroadcastToUser(tenantID, userID, messageType string, data interface{})
}