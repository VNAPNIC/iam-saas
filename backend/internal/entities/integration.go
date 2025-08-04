package entities

import "time"

type Integration struct {
	ID        int64     `json:"id"`
	TenantID  int64     `json:"tenantId"`
	Type      string    `json:"type"` // "scim", "siem", "webhook"
	Name      string    `json:"name"`
	Status    string    `json:"status"` // "enabled", "disabled", "error"
	Config    string    `json:"config"` // JSON configuration
	CreatedAt time.Time `json:"createdAt"`
	UpdatedAt time.Time `json:"updatedAt"`
}

func (i *Integration) TableName() string {
	return "integrations"
}

// SCIM specific configuration
type SCIMConfig struct {
	BaseURL  string `json:"baseUrl"`
	APIToken string `json:"apiToken"`
	Enabled  bool   `json:"enabled"`
}

// SIEM specific configuration
type SIEMConfig struct {
	EndpointURL string `json:"endpointUrl"`
	AuthHeader  string `json:"authHeader"`
	Enabled     bool   `json:"enabled"`
	Format      string `json:"format"` // "json", "syslog", "cef"
}

// Webhook specific configuration
type WebhookConfig struct {
	URL         string            `json:"url"`
	Secret      string            `json:"secret"`
	Events      []string          `json:"events"`
	Headers     map[string]string `json:"headers"`
	Enabled     bool              `json:"enabled"`
	RetryPolicy RetryPolicy       `json:"retryPolicy"`
}

type RetryPolicy struct {
	MaxRetries int `json:"maxRetries"`
	BackoffMs  int `json:"backoffMs"`
}