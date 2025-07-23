package entities

import "time"

type Policy struct {
	ID        int64     `json:"id"`
	TenantID  int64     `json:"tenantId"`
	Name      string    `json:"name"`
	Target    string    `json:"target"`    // e.g., "role:admin", "all_users"
	Condition string    `json:"condition"` // e.g., "time_range:0900-1700", "ip_range:192.168.1.0/24"
	Status    string    `json:"status"`    // "active", "inactive"
	CreatedAt time.Time `json:"createdAt"`
	UpdatedAt time.Time `json:"updatedAt"`
}

func (p *Policy) TableName() string {
	return "policies"
}
