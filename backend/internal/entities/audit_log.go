package entities

import "time"

type AuditLog struct {
	ID        int64     `json:"id"`
	TenantID  int64     `json:"tenantId"`
	UserID    int64     `json:"userId"`
	UserEmail string    `json:"userEmail"`
	IPAddress string    `json:"ipAddress"`
	Event     string    `json:"event"`
	Status    string    `json:"status"`
	Severity  string    `json:"severity"`
	Details   string    `json:"details"` // JSON string or text
	CreatedAt time.Time `json:"createdAt"`
}

func (al *AuditLog) TableName() string {
	return "audit_logs"
}
