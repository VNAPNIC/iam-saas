package entities

import (
	"database/sql/driver"
	"encoding/json"
	"time"
)

type Tenant struct {
	ID                int64     `json:"id"`
	PlanID            int64     `json:"planId"`
	Key               string    `json:"key"` // Unique key for tenant path (e.g., "quantum-leap-key")
	Domain            string    `json:"domain"` // Domain is now the primary identifier
	DomainVerified    bool      `json:"domainVerified"` // Whether the custom domain has been verified
	Name              string    `json:"name"`
	Status            string    `json:"status"` // pending_verification, active, suspended
	UserQuota         int       `json:"userQuota"`
	LogoURL           *string   `json:"logoUrl"`
	PrimaryColor      *string   `json:"primaryColor"`
	AllowPublicSignup bool      `json:"allowPublicSignup"`
	IsOnboarded       bool      `json:"isOnboarded"`
	CreatedAt         time.Time `json:"createdAt"`
	UpdatedAt         time.Time `json:"updatedAt"`
	EmailProvider     string    `json:"emailProvider"` // e.g., "ses", "smtp", "console"
	EmailConfig       JSONMap   `json:"emailConfig"`   // Provider-specific configuration
	PasswordPolicy    JSONMap   `json:"passwordPolicy"` // Password policy configuration
}

// JSONMap is a wrapper for JSONB fields
type JSONMap map[string]interface{}

// Scan implements the Scanner interface for JSONMap
func (jm *JSONMap) Scan(value interface{}) error {
	if value == nil {
		*jm = make(JSONMap)
		return nil
	}
	
	bytes, ok := value.([]byte)
	if !ok {
		return nil
	}
	
	result := make(JSONMap)
	if err := json.Unmarshal(bytes, &result); err != nil {
		return err
	}
	*jm = result
	return nil
}

// Value implements the Valuer interface for JSONMap
func (jm JSONMap) Value() (driver.Value, error) {
	if jm == nil {
		return nil, nil
	}
	return json.Marshal(jm)
}

func (t *Tenant) TableName() string {
	return "tenants"
}
