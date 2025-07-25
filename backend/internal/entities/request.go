package entities

import "time"

type Request struct {
	ID                int64     `json:"id"`
	TenantID          int64     `json:"tenantId"`
	RequestType       string    `json:"requestType"` // e.g., "tenant_approval", "quota_increase"
	Status            string    `json:"status"`      // e.g., "pending", "approved", "denied"
	RequestedByUserID int64     `json:"requestedByUserId"`
	RequestedByEmail  string    `json:"requestedByEmail"`
	Details           string    `json:"details"` // JSON string or text describing the request
	DenialReason      *string   `json:"denialReason,omitempty"`
	CreatedAt         time.Time `json:"createdAt"`
	UpdatedAt         time.Time `json:"updatedAt"`
}

func (r *Request) TableName() string {
	return "requests"
}
