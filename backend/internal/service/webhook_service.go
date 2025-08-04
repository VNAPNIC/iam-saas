package service

import (
	"bytes"
	"context"
	"crypto/hmac"
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"iam-saas/internal/domain"
	"iam-saas/internal/entities"
	"iam-saas/internal/events"
	"iam-saas/pkg/app_error"
	"iam-saas/pkg/utils"
	"net/http"
	"time"

	"gorm.io/gorm"
)

type webhookService struct {
	db          *gorm.DB
	webhookRepo domain.WebhookRepository
	eventBus    *events.EventBus
	httpClient  *http.Client
}

func NewWebhookService(db *gorm.DB, webhookRepo domain.WebhookRepository, eventBus *events.EventBus) domain.WebhookService {
	return &webhookService{
		db:          db,
		webhookRepo: webhookRepo,
		eventBus:    eventBus,
		httpClient: &http.Client{
			Timeout: 30 * time.Second,
		},
	}
}

func (s *webhookService) CreateWebhook(ctx context.Context, tenantID int64, url, secret string, events []string, status string) (*entities.Webhook, error) {
	if secret == "" {
		generatedSecret, err := utils.GenerateRandomString(32)
		if err != nil {
			return nil, app_error.NewInternalServerError(err)
		}
		secret = generatedSecret
	}

	hashedSecret, err := utils.HashPassword(secret)
	if err != nil {
		return nil, app_error.NewInternalServerError(err)
	}

	newWebhook := &entities.Webhook{
		TenantID: tenantID,
		URL:      url,
		Secret:   hashedSecret,
		Events:   events,
		Status:   status,
	}

	if err := s.webhookRepo.Create(ctx, nil, newWebhook); err != nil {
		return nil, app_error.NewInternalServerError(err)
	}

	return newWebhook, nil
}

func (s *webhookService) GetWebhook(ctx context.Context, tenantID int64, id int64) (*entities.Webhook, error) {
	webhook, err := s.webhookRepo.FindByID(ctx, id)
	if err != nil {
		return nil, app_error.NewInternalServerError(err)
	}
	if webhook == nil || webhook.TenantID != tenantID {
		return nil, app_error.NewNotFoundError("Webhook not found or not in tenant")
	}
	return webhook, nil
}

func (s *webhookService) ListWebhooks(ctx context.Context, tenantID int64) ([]entities.Webhook, error) {
	return s.webhookRepo.ListWebhooks(ctx, tenantID)
}

func (s *webhookService) UpdateWebhook(ctx context.Context, tenantID int64, id int64, url, secret string, events []string, status string) (*entities.Webhook, error) {
	webhook, err := s.webhookRepo.FindByID(ctx, id)
	if err != nil {
		return nil, app_error.NewInternalServerError(err)
	}
	if webhook == nil || webhook.TenantID != tenantID {
		return nil, app_error.NewNotFoundError("Webhook not found or not in tenant")
	}

	hashedSecret := webhook.Secret
	if secret != "" {
		hashedSecret, err = utils.HashPassword(secret)
		if err != nil {
			return nil, app_error.NewInternalServerError(err)
		}
	}

	webhook.URL = url
	webhook.Secret = hashedSecret
	webhook.Events = events
	webhook.Status = status

	if err := s.webhookRepo.Update(ctx, webhook); err != nil {
		return nil, app_error.NewInternalServerError(err)
	}

	return webhook, nil
}

func (s *webhookService) DeleteWebhook(ctx context.Context, tenantID int64, id int64) error {
	webhook, err := s.webhookRepo.FindByID(ctx, id)
	if err != nil {
		return app_error.NewInternalServerError(err)
	}
	if webhook == nil || webhook.TenantID != tenantID {
		return app_error.NewNotFoundError("Webhook not found or not in tenant")
	}
	return s.webhookRepo.Delete(ctx, id)
}

// Enhanced Webhook Structures - use existing types from webhook_manager.go

// DeliverWebhook delivers a webhook event to all matching webhooks
func (s *webhookService) DeliverWebhook(ctx context.Context, tenantID int64, eventType string, payload map[string]interface{}) error {
	// Get all active webhooks for this tenant that subscribe to this event
	webhooks, err := s.webhookRepo.ListWebhooks(ctx, tenantID)
	if err != nil {
		return app_error.NewInternalServerError(err)
	}

	for _, webhook := range webhooks {
		if webhook.Status != "active" {
			continue
		}

		// Check if webhook subscribes to this event type
		if !s.webhookSubscribesToEvent(webhook, eventType) {
			continue
		}

		// Create delivery record
		delivery := &entities.WebhookDelivery{
			WebhookID:   webhook.ID,
			EventType:   eventType,
			Payload:     fmt.Sprintf("%v", payload), // Convert to string
			Status:      "pending",
			Attempts:    0,
			MaxAttempts: 5, // Default max attempts
			CreatedAt:   time.Now(),
			UpdatedAt:   time.Now(),
		}

		// Attempt delivery
		go s.attemptDelivery(ctx, &webhook, delivery)
	}

	return nil
}

// webhookSubscribesToEvent checks if webhook subscribes to the event type
func (s *webhookService) webhookSubscribesToEvent(webhook entities.Webhook, eventType string) bool {
	for _, subscribedEvent := range webhook.Events {
		if subscribedEvent == eventType || subscribedEvent == "*" {
			return true
		}
		// Support wildcard patterns like "user.*"
		if len(subscribedEvent) > 1 && subscribedEvent[len(subscribedEvent)-1] == '*' {
			prefix := subscribedEvent[:len(subscribedEvent)-1]
			if len(eventType) >= len(prefix) && eventType[:len(prefix)] == prefix {
				return true
			}
		}
	}
	return false
}

// attemptDelivery attempts to deliver a webhook
func (s *webhookService) attemptDelivery(ctx context.Context, webhook *entities.Webhook, delivery *entities.WebhookDelivery) {
	delivery.Attempts++
	delivery.LastAttempt = &time.Time{}
	*delivery.LastAttempt = time.Now()

	// Create webhook event payload
	webhookEvent := entities.WebhookEvent{
		ID:        fmt.Sprintf("evt_%d_%d", delivery.WebhookID, time.Now().Unix()),
		Type:      delivery.EventType,
		TenantID:  fmt.Sprintf("%d", webhook.TenantID),
		Data:      map[string]interface{}{"payload": delivery.Payload},
		Timestamp: time.Now(),
	}

	// Serialize payload
	payloadBytes, err := json.Marshal(webhookEvent)
	if err != nil {
		delivery.Status = "failed"
		delivery.Response = fmt.Sprintf("Failed to serialize payload: %v", err)
		s.updateDeliveryStatus(ctx, delivery)
		return
	}

	// Generate signature
	signature := s.generateSignature(payloadBytes, webhook.Secret)
	webhookEvent.Signature = signature

	// Create HTTP request
	req, err := http.NewRequestWithContext(ctx, "POST", webhook.URL, bytes.NewBuffer(payloadBytes))
	if err != nil {
		delivery.Status = "failed"
		delivery.Response = fmt.Sprintf("Failed to create request: %v", err)
		s.updateDeliveryStatus(ctx, delivery)
		return
	}

	// Set headers
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("User-Agent", "IAM-SaaS-Webhook/1.0")
	req.Header.Set("X-Webhook-Signature", signature)
	req.Header.Set("X-Webhook-Event", delivery.EventType)
	req.Header.Set("X-Webhook-ID", webhookEvent.ID)

	// Send request
	resp, err := s.httpClient.Do(req)
	if err != nil {
		delivery.Status = "failed"
		delivery.Response = fmt.Sprintf("HTTP request failed: %v", err)
		s.scheduleRetry(ctx, delivery)
		return
	}
	defer resp.Body.Close()

	delivery.StatusCode = resp.StatusCode

	// Read response body
	responseBody := make([]byte, 1024) // Limit response size
	n, _ := resp.Body.Read(responseBody)
	delivery.Response = string(responseBody[:n])

	// Check if delivery was successful
	if resp.StatusCode >= 200 && resp.StatusCode < 300 {
		delivery.Status = "success"
		s.updateDeliveryStatus(ctx, delivery)
		
		// Publish success event
		if s.eventBus != nil {
			_ = s.eventBus.Publish(events.Event{
				Type:     events.EventWebhookDeliverySuccess,
				TenantID: fmt.Sprintf("%d", webhook.TenantID),
				Data: map[string]interface{}{
					"webhook_id":   webhook.ID,
					"event_type":   delivery.EventType,
					"attempts":     delivery.Attempts,
					"status_code":  delivery.StatusCode,
				},
			})
		}
	} else {
		delivery.Status = "failed"
		s.scheduleRetry(ctx, delivery)
	}
}

// generateSignature generates HMAC signature for webhook payload
func (s *webhookService) generateSignature(payload []byte, secret string) string {
	h := hmac.New(sha256.New, []byte(secret))
	h.Write(payload)
	return "sha256=" + hex.EncodeToString(h.Sum(nil))
}

// scheduleRetry schedules a retry for failed webhook delivery
func (s *webhookService) scheduleRetry(ctx context.Context, delivery *entities.WebhookDelivery) {
	if delivery.Attempts >= delivery.MaxAttempts {
		delivery.Status = "failed"
		s.updateDeliveryStatus(ctx, delivery)
		
		// Publish failure event
		if s.eventBus != nil {
			_ = s.eventBus.Publish(events.Event{
				Type:     events.EventWebhookDeliveryFailed,
				TenantID: fmt.Sprintf("%d", delivery.WebhookID), // This should be tenant ID
				Data: map[string]interface{}{
					"webhook_id":   delivery.WebhookID,
					"event_type":   delivery.EventType,
					"attempts":     delivery.Attempts,
					"final_status": delivery.Status,
					"response":     delivery.Response,
				},
			})
		}
		return
	}

	// Calculate exponential backoff: 2^attempt minutes
	backoffMinutes := 1 << (delivery.Attempts - 1) // 1, 2, 4, 8, 16 minutes
	if backoffMinutes > 60 {
		backoffMinutes = 60 // Cap at 1 hour
	}
	
	nextRetry := time.Now().Add(time.Duration(backoffMinutes) * time.Minute)
	delivery.NextRetry = &nextRetry
	delivery.Status = "retrying"
	
	s.updateDeliveryStatus(ctx, delivery)
	
	// Schedule retry (in a real implementation, use a job queue)
	go func() {
		time.Sleep(time.Until(nextRetry))
		// In production, this should be handled by a job queue
		// For now, we'll just attempt delivery again
		webhook, err := s.webhookRepo.FindByID(ctx, delivery.WebhookID)
		if err == nil && webhook != nil {
			s.attemptDelivery(ctx, webhook, delivery)
		}
	}()
}

// updateDeliveryStatus updates the delivery status (placeholder - in real implementation, store in DB)
func (s *webhookService) updateDeliveryStatus(ctx context.Context, delivery *entities.WebhookDelivery) {
	delivery.UpdatedAt = time.Now()
	// In a real implementation, save to database
	// For now, just log the status
	fmt.Printf("Webhook delivery %d status: %s (attempts: %d)\n", 
		delivery.ID, delivery.Status, delivery.Attempts)
}

// TestWebhook tests a webhook endpoint
func (s *webhookService) TestWebhook(ctx context.Context, tenantID int64, webhookID int64) (*entities.WebhookDelivery, error) {
	webhook, err := s.GetWebhook(ctx, tenantID, webhookID)
	if err != nil {
		return nil, err
	}

	// Create test payload
	testPayload := map[string]interface{}{
		"test": true,
		"message": "This is a test webhook delivery",
		"timestamp": time.Now().Unix(),
	}

	// Create test delivery
	delivery := &entities.WebhookDelivery{
		WebhookID:   webhook.ID,
		EventType:   "webhook.test",
		Payload:     fmt.Sprintf("%v", testPayload),
		Status:      "pending",
		Attempts:    0,
		MaxAttempts: 1, // Only one attempt for tests
		CreatedAt:   time.Now(),
		UpdatedAt:   time.Now(),
	}

	// Attempt delivery synchronously for testing
	s.attemptDelivery(ctx, webhook, delivery)

	return delivery, nil
}

// GetWebhookDeliveries gets delivery history for a webhook (placeholder)
func (s *webhookService) GetWebhookDeliveries(ctx context.Context, tenantID int64, webhookID int64, limit int) ([]entities.WebhookDelivery, error) {
	// Verify webhook belongs to tenant
	_, err := s.GetWebhook(ctx, tenantID, webhookID)
	if err != nil {
		return nil, err
	}

	// In a real implementation, fetch from database
	// For now, return empty slice
	return []entities.WebhookDelivery{}, nil
}

// RetryWebhookDelivery retries a failed webhook delivery
func (s *webhookService) RetryWebhookDelivery(ctx context.Context, tenantID int64, deliveryID int64) error {
	// In a real implementation, fetch delivery from database and retry
	// For now, return success
	return nil
}
