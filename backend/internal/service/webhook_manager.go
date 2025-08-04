package service

import (
	"bytes"
	"context"
	"crypto/hmac"
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"iam-saas/internal/cache"
	"iam-saas/internal/domain"
	"iam-saas/internal/entities"
	"iam-saas/internal/events"
	"iam-saas/pkg/app_error"
	"log"
	"net/http"
	"strconv"
	"time"
)

// WebhookManager handles webhook delivery and management
type WebhookManager struct {
	webhookService domain.WebhookService
	eventBus       *events.EventBus
	cacheManager   *cache.CacheManager
	httpClient     *http.Client
}

// NewWebhookManager creates a new webhook manager
func NewWebhookManager(
	webhookService domain.WebhookService,
	eventBus *events.EventBus,
	cacheManager *cache.CacheManager,
) *WebhookManager {
	wm := &WebhookManager{
		webhookService: webhookService,
		eventBus:       eventBus,
		cacheManager:   cacheManager,
		httpClient: &http.Client{
			Timeout: 30 * time.Second,
		},
	}

	// Setup event subscriptions for webhook delivery
	wm.setupEventSubscriptions()

	return wm
}

// WebhookEvent represents an event to be sent via webhook
type WebhookEvent struct {
	ID        string                 `json:"id"`
	Type      string                 `json:"type"`
	TenantID  string                 `json:"tenant_id"`
	Data      map[string]interface{} `json:"data"`
	Timestamp time.Time              `json:"timestamp"`
	Version   string                 `json:"version"`
}

// WebhookDelivery represents a webhook delivery attempt
type WebhookDelivery struct {
	ID        string            `json:"id"`
	WebhookID int64             `json:"webhook_id"`
	EventID   string            `json:"event_id"`
	URL       string            `json:"url"`
	Method    string            `json:"method"`
	Headers   map[string]string `json:"headers"`
	Payload   string            `json:"payload"`
	StatusCode int               `json:"status_code"`
	Response  string            `json:"response"`
	Duration  time.Duration     `json:"duration"`
	Timestamp time.Time         `json:"timestamp"`
	Success   bool              `json:"success"`
	Attempt   int               `json:"attempt"`
	NextRetry *time.Time        `json:"next_retry,omitempty"`
}

// Setup event subscriptions for webhook delivery
func (wm *WebhookManager) setupEventSubscriptions() {
	// User events
	wm.eventBus.Subscribe(events.EventUserCreated, wm.handleUserEvent)
	wm.eventBus.Subscribe(events.EventUserUpdated, wm.handleUserEvent)
	wm.eventBus.Subscribe("user.deleted", wm.handleUserEvent)
	wm.eventBus.Subscribe(events.EventUserPermissionsUpdated, wm.handleUserEvent)

	// Tenant events
	wm.eventBus.Subscribe(events.EventTenantBrandingUpdated, wm.handleTenantEvent)
	wm.eventBus.Subscribe(events.EventPolicyUpdated, wm.handleTenantEvent)
	wm.eventBus.Subscribe(events.EventApplicationUpdated, wm.handleTenantEvent)

	// Security events
	wm.eventBus.Subscribe(events.EventSecurityAlert, wm.handleSecurityEvent)

	log.Println("Webhook event subscriptions setup completed")
}

// Handle user-related events
func (wm *WebhookManager) handleUserEvent(event events.Event) error {
	webhookEvent := WebhookEvent{
		ID:        fmt.Sprintf("evt_%d", time.Now().UnixNano()),
		Type:      event.Type,
		TenantID:  event.TenantID,
		Data:      event.Data,
		Timestamp: time.Now(),
		Version:   "1.0",
	}

	return wm.deliverWebhook(event.TenantID, "user", webhookEvent)
}

// Handle tenant-related events
func (wm *WebhookManager) handleTenantEvent(event events.Event) error {
	webhookEvent := WebhookEvent{
		ID:        fmt.Sprintf("evt_%d", time.Now().UnixNano()),
		Type:      event.Type,
		TenantID:  event.TenantID,
		Data:      event.Data,
		Timestamp: time.Now(),
		Version:   "1.0",
	}

	return wm.deliverWebhook(event.TenantID, "tenant", webhookEvent)
}

// Handle security-related events
func (wm *WebhookManager) handleSecurityEvent(event events.Event) error {
	webhookEvent := WebhookEvent{
		ID:        fmt.Sprintf("evt_%d", time.Now().UnixNano()),
		Type:      event.Type,
		TenantID:  event.TenantID,
		Data:      event.Data,
		Timestamp: time.Now(),
		Version:   "1.0",
	}

	return wm.deliverWebhook(event.TenantID, "security", webhookEvent)
}

// Deliver webhook to all registered endpoints for a tenant
func (wm *WebhookManager) deliverWebhook(tenantID, eventCategory string, event WebhookEvent) error {
	// Get tenant ID as int64
	tenantIDInt, err := strconv.ParseInt(tenantID, 10, 64)
	if err != nil {
		return err
	}

	// Get all webhooks for the tenant
	webhooks, err := wm.webhookService.ListWebhooks(context.Background(), tenantIDInt)
	if err != nil {
		return err
	}

	// Filter webhooks that are interested in this event type
	for _, webhook := range webhooks {
		if wm.shouldDeliverEvent(webhook, event.Type) {
			go wm.deliverToWebhook(webhook, event)
		}
	}

	return nil
}

// Check if webhook should receive this event type
func (wm *WebhookManager) shouldDeliverEvent(webhook entities.Webhook, eventType string) bool {
	if webhook.Status != "active" {
		return false
	}

	// Check if webhook is subscribed to this event type
	for _, subscribedEvent := range webhook.Events {
		if subscribedEvent == eventType || subscribedEvent == "*" {
			return true
		}
	}

	return false
}

// Deliver event to a specific webhook
func (wm *WebhookManager) deliverToWebhook(webhook entities.Webhook, event WebhookEvent) {
	deliveryID := fmt.Sprintf("del_%d", time.Now().UnixNano())
	
	delivery := &WebhookDelivery{
		ID:        deliveryID,
		WebhookID: webhook.ID,
		EventID:   event.ID,
		URL:       webhook.URL,
		Method:    "POST",
		Headers: map[string]string{
			"Content-Type":       "application/json",
			"User-Agent":         "IAM-SaaS-Webhook/1.0",
			"X-Webhook-ID":       fmt.Sprintf("%d", webhook.ID),
			"X-Event-ID":         event.ID,
			"X-Event-Type":       event.Type,
			"X-Delivery-ID":      deliveryID,
			"X-Webhook-Timestamp": fmt.Sprintf("%d", time.Now().Unix()),
		},
		Timestamp: time.Now(),
		Attempt:   1,
	}

	// Serialize event payload
	payload, err := json.Marshal(event)
	if err != nil {
		log.Printf("Error marshaling webhook payload: %v", err)
		return
	}
	delivery.Payload = string(payload)

	// Generate signature
	signature := wm.generateSignature(payload, webhook.Secret)
	delivery.Headers["X-Webhook-Signature"] = signature

	// Attempt delivery with retries
	wm.attemptDelivery(delivery, webhook, payload)
}

// Attempt webhook delivery with retries
func (wm *WebhookManager) attemptDelivery(delivery *WebhookDelivery, webhook entities.Webhook, payload []byte) {
	maxRetries := 3
	retryDelays := []time.Duration{
		1 * time.Minute,
		5 * time.Minute,
		15 * time.Minute,
	}

	for attempt := 1; attempt <= maxRetries; attempt++ {
		delivery.Attempt = attempt
		startTime := time.Now()

		// Create HTTP request
		req, err := http.NewRequest(delivery.Method, delivery.URL, bytes.NewBuffer(payload))
		if err != nil {
			log.Printf("Error creating webhook request: %v", err)
			continue
		}

		// Set headers
		for key, value := range delivery.Headers {
			req.Header.Set(key, value)
		}

		// Make request
		resp, err := wm.httpClient.Do(req)
		delivery.Duration = time.Since(startTime)

		if err != nil {
			delivery.Success = false
			delivery.Response = err.Error()
			log.Printf("Webhook delivery failed (attempt %d): %v", attempt, err)
		} else {
			delivery.StatusCode = resp.StatusCode
			delivery.Success = resp.StatusCode >= 200 && resp.StatusCode < 300

			// Read response body
			var responseBody bytes.Buffer
			_, _ = responseBody.ReadFrom(resp.Body)
			delivery.Response = responseBody.String()
			resp.Body.Close()

			if delivery.Success {
				log.Printf("Webhook delivered successfully to %s", delivery.URL)
				break
			} else {
				log.Printf("Webhook delivery failed with status %d (attempt %d)", resp.StatusCode, attempt)
			}
		}

		// Store delivery attempt
		wm.storeDeliveryAttempt(delivery)

		// Schedule retry if not successful and not last attempt
		if !delivery.Success && attempt < maxRetries {
			nextRetry := time.Now().Add(retryDelays[attempt-1])
			delivery.NextRetry = &nextRetry
			
			// Schedule retry
			go func(retryDelay time.Duration, retryDelivery *WebhookDelivery) {
				time.Sleep(retryDelay)
				wm.attemptDelivery(retryDelivery, webhook, payload)
			}(retryDelays[attempt-1], delivery)
			
			break
		}
	}

	// Store final delivery result
	wm.storeDeliveryAttempt(delivery)
}

// Generate HMAC signature for webhook payload
func (wm *WebhookManager) generateSignature(payload []byte, secret string) string {
	h := hmac.New(sha256.New, []byte(secret))
	h.Write(payload)
	return "sha256=" + hex.EncodeToString(h.Sum(nil))
}

// Store delivery attempt in cache for monitoring
func (wm *WebhookManager) storeDeliveryAttempt(delivery *WebhookDelivery) {
	// Store individual delivery
	deliveryKey := fmt.Sprintf("webhook:delivery:%s", delivery.ID)
	_ = wm.cacheManager.Set(deliveryKey, delivery, 24*time.Hour)

	// Add to webhook delivery history
	historyKey := fmt.Sprintf("webhook:%d:deliveries", delivery.WebhookID)
	deliveryData, _ := json.Marshal(delivery)
	wm.cacheManager.RedisCache.Client.LPush(context.Background(), historyKey, deliveryData)
	wm.cacheManager.RedisCache.Client.LTrim(context.Background(), historyKey, 0, 99) // Keep last 100 deliveries
	wm.cacheManager.RedisCache.Client.Expire(context.Background(), historyKey, 7*24*time.Hour) // 7 days
}

// Get webhook delivery history
func (wm *WebhookManager) GetDeliveryHistory(webhookID int64, limit int) ([]WebhookDelivery, error) {
	historyKey := fmt.Sprintf("webhook:%d:deliveries", webhookID)
	
	deliveryStrings, err := wm.cacheManager.RedisCache.Client.LRange(context.Background(), historyKey, 0, int64(limit-1)).Result()
	if err != nil {
		return nil, err
	}

	var deliveries []WebhookDelivery
	for _, deliveryString := range deliveryStrings {
		var delivery WebhookDelivery
		if err := json.Unmarshal([]byte(deliveryString), &delivery); err == nil {
			deliveries = append(deliveries, delivery)
		}
	}

	return deliveries, nil
}

// Test webhook endpoint
func (wm *WebhookManager) TestWebhook(ctx context.Context, tenantID int64, webhookID int64) (*WebhookDelivery, error) {
	webhook, err := wm.webhookService.GetWebhook(ctx, tenantID, webhookID)
	if err != nil {
		return nil, err
	}

	// Create test event
	testEvent := WebhookEvent{
		ID:       fmt.Sprintf("test_%d", time.Now().UnixNano()),
		Type:     "webhook.test",
		TenantID: fmt.Sprintf("%d", tenantID),
		Data: map[string]interface{}{
			"message": "This is a test webhook delivery",
			"test":    true,
		},
		Timestamp: time.Now(),
		Version:   "1.0",
	}

	// Create delivery
	delivery := &WebhookDelivery{
		ID:        fmt.Sprintf("test_del_%d", time.Now().UnixNano()),
		WebhookID: webhook.ID,
		EventID:   testEvent.ID,
		URL:       webhook.URL,
		Method:    "POST",
		Headers: map[string]string{
			"Content-Type":       "application/json",
			"User-Agent":         "IAM-SaaS-Webhook/1.0",
			"X-Webhook-ID":       fmt.Sprintf("%d", webhook.ID),
			"X-Event-ID":         testEvent.ID,
			"X-Event-Type":       testEvent.Type,
			"X-Delivery-ID":      fmt.Sprintf("%d", webhook.ID),
			"X-Webhook-Timestamp": fmt.Sprintf("%d", time.Now().Unix()),
		},
		Timestamp: time.Now(),
		Attempt:   1,
	}

	// Serialize payload
	payload, err := json.Marshal(testEvent)
	if err != nil {
		return nil, err
	}
	delivery.Payload = string(payload)

	// Generate signature
	signature := wm.generateSignature(payload, webhook.Secret)
	delivery.Headers["X-Webhook-Signature"] = signature

	// Make test request
	startTime := time.Now()
	req, err := http.NewRequest(delivery.Method, delivery.URL, bytes.NewBuffer(payload))
	if err != nil {
		return nil, err
	}

	// Set headers
	for key, value := range delivery.Headers {
		req.Header.Set(key, value)
	}

	// Make request
	resp, err := wm.httpClient.Do(req)
	delivery.Duration = time.Since(startTime)

	if err != nil {
		delivery.Success = false
		delivery.Response = err.Error()
	} else {
		delivery.StatusCode = resp.StatusCode
		delivery.Success = resp.StatusCode >= 200 && resp.StatusCode < 300

		// Read response body
		var responseBody bytes.Buffer
		_, _ = responseBody.ReadFrom(resp.Body)
		delivery.Response = responseBody.String()
		resp.Body.Close()
	}

	// Store test delivery
	wm.storeDeliveryAttempt(delivery)

	return delivery, nil
}

// Get webhook statistics
func (wm *WebhookManager) GetWebhookStats(webhookID int64) (*WebhookStats, error) {
	deliveries, err := wm.GetDeliveryHistory(webhookID, 100)
	if err != nil {
		return nil, err
	}

	stats := &WebhookStats{
		WebhookID:      webhookID,
		TotalDeliveries: len(deliveries),
		SuccessfulDeliveries: 0,
		FailedDeliveries: 0,
		AverageResponseTime: 0,
		LastDelivery: nil,
	}

	if len(deliveries) == 0 {
		return stats, nil
	}

	var totalDuration time.Duration
	for _, delivery := range deliveries {
		if delivery.Success {
			stats.SuccessfulDeliveries++
		} else {
			stats.FailedDeliveries++
		}
		totalDuration += delivery.Duration
	}

	stats.AverageResponseTime = totalDuration / time.Duration(len(deliveries))
	stats.LastDelivery = &deliveries[0] // Most recent delivery
	stats.SuccessRate = float64(stats.SuccessfulDeliveries) / float64(stats.TotalDeliveries) * 100

	return stats, nil
}

// WebhookStats represents webhook delivery statistics
type WebhookStats struct {
	WebhookID            int64            `json:"webhook_id"`
	TotalDeliveries      int              `json:"total_deliveries"`
	SuccessfulDeliveries int              `json:"successful_deliveries"`
	FailedDeliveries     int              `json:"failed_deliveries"`
	SuccessRate          float64          `json:"success_rate"`
	AverageResponseTime  time.Duration    `json:"average_response_time"`
	LastDelivery         *WebhookDelivery `json:"last_delivery"`
}

// ResendWebhookEvent resends a specific event
func (wm *WebhookManager) ResendWebhookEvent(deliveryID string) error {
	deliveryKey := fmt.Sprintf("webhook:delivery:%s", deliveryID)
	
	deliveryData, err := wm.cacheManager.RedisCache.Client.Get(context.Background(), deliveryKey).Bytes()
	if err != nil {
		return app_error.NewNotFoundError("Delivery not found")
	}

	var delivery WebhookDelivery
	if err := json.Unmarshal(deliveryData, &delivery); err != nil {
		return app_error.NewInternalServerError(err)
	}

	// Get webhook
	webhook, err := wm.webhookService.GetWebhook(context.Background(), 0, delivery.WebhookID) // TenantID 0 for internal use
	if err != nil {
		return err
	}

	// Resend webhook
	go wm.deliverToWebhook(*webhook, WebhookEvent{
		ID:        delivery.EventID,
		Type:      delivery.Headers["X-Event-Type"],
		TenantID:  "", // Not available in delivery object
		Data:      map[string]interface{}{}, // Not available in delivery object
		Timestamp: time.Now(),
		Version:   "1.0",
	})

	return nil
}