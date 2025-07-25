package entities

import "time"

type Alert struct {
	ID        int64     `json:"id"`
	TenantID  *int64    `json:"tenantId,omitempty"` // Nullable for system-wide alerts
	UserID    *int64    `json:"userId,omitempty"`   // Nullable for system-wide alerts
	Type      string    `json:"type"` // e.g., "login_failure", "quota_exceeded"
	Event     string    `json:"event"`
	Message   string    `json:"message"`
	Description string    `json:"description"`
	Severity  string    `json:"severity"` // INFO, WARNING, ERROR, CRITICAL
	Status    string    `json:"status"`   // NEW, ACKNOWLEDGED, RESOLVED
	CreatedAt time.Time `json:"createdAt"`
	UpdatedAt time.Time `json:"updatedAt"`
}

func (a *Alert) TableName() string {
	return "alerts"
}
