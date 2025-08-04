package entities

import "time"

type Session struct {
	ID           int64     `json:"id"`
	UserID       int64     `json:"userId"`
	TenantID     int64     `json:"tenantId"`
	RefreshToken string    `json:"refreshToken"`
	DeviceInfo   string    `json:"deviceInfo"` // JSON string containing OS, browser, device
	IPAddress    string    `json:"ipAddress"`
	Location     string    `json:"location"` // JSON string containing country, city
	ExpiresAt    time.Time `json:"expiresAt"`
	LastActivity time.Time `json:"lastActivity"`
	CreatedAt    time.Time `json:"createdAt"`
	UpdatedAt    time.Time `json:"updatedAt"`
	IsActive     bool      `json:"isActive"`

	// Relations
	User *User `json:"user,omitempty" gorm:"foreignKey:UserID"`
}

func (s *Session) TableName() string {
	return "sessions"
}