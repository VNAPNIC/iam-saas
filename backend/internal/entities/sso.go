package entities

import "time"

type SsoConfig struct {
	ID           int64     `json:"id"`
	TenantID     int64     `json:"tenantId"`
	Provider     string    `json:"provider"`
	MetadataURL  string    `json:"metadataUrl"`
	ClientID     string    `json:"clientId"`
	ClientSecret string    `json:"-"` // Never expose
	Status       string    `json:"status"` // enabled, disabled
	CreatedAt    time.Time `json:"createdAt"`
	UpdatedAt    time.Time `json:"updatedAt"`
}

func (s *SsoConfig) TableName() string {
	return "sso_configs"
}
