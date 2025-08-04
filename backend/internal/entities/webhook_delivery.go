package entities

import "time"

// WebhookDelivery represents a webhook delivery attempt
type WebhookDelivery struct {
	ID           int64                  `json:"id" gorm:"primaryKey"`
	WebhookID    int64                  `json:"webhook_id" gorm:"not null"`
	EventType    string                 `json:"event_type" gorm:"not null"`
	Payload      string                 `json:"payload" gorm:"type:text"`
	Status       string                 `json:"status" gorm:"not null"` // "pending", "success", "failed", "retrying"
	Attempts     int                    `json:"attempts" gorm:"default:0"`
	MaxAttempts  int                    `json:"max_attempts" gorm:"default:5"`
	NextRetry    *time.Time             `json:"next_retry,omitempty"`
	LastAttempt  *time.Time             `json:"last_attempt,omitempty"`
	Response     string                 `json:"response,omitempty" gorm:"type:text"`
	StatusCode   int                    `json:"status_code,omitempty"`
	CreatedAt    time.Time              `json:"created_at" gorm:"autoCreateTime"`
	UpdatedAt    time.Time              `json:"updated_at" gorm:"autoUpdateTime"`
}

// WebhookEvent represents a webhook event payload
type WebhookEvent struct {
	ID        string                 `json:"id"`
	Type      string                 `json:"type"`
	TenantID  string                 `json:"tenant_id"`
	Data      map[string]interface{} `json:"data"`
	Timestamp time.Time              `json:"timestamp"`
	Signature string                 `json:"signature,omitempty"`
}