package entities

import (
	"database/sql/driver"
	"encoding/json"
	"errors"
	"time"
)

type Webhook struct {
	ID        int64     `json:"id"`
	TenantID  int64     `json:"tenantId"`
	URL       string    `json:"url"`
	Secret    string    `json:"-"` // Never expose
	Events    WebhookEvents `json:"events" gorm:"type:jsonb"`
	Status    string    `json:"status"` // active, inactive
	CreatedAt time.Time `json:"createdAt"`
	UpdatedAt time.Time `json:"updatedAt"`
}

func (w *Webhook) TableName() string {
	return "webhooks"
}

type WebhookEvents []string

// Value implements the driver.Valuer interface.
func (we WebhookEvents) Value() (driver.Value, error) {
	if we == nil {
		return nil, nil
	}
	return json.Marshal(we)
}

// Scan implements the sql.Scanner interface.
func (we *WebhookEvents) Scan(value interface{}) error {
	if value == nil {
		*we = nil
		return nil
	}
	b, ok := value.([]byte)
	if !ok {
		return errors.New("type assertion to []byte failed")
	}
	return json.Unmarshal(b, &we)
}
