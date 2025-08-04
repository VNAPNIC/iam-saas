package entities

import "time"

type ServiceRole struct {
	ID          int64     `json:"id"`
	TenantID    int64     `json:"tenantId"`
	Name        string    `json:"name"`
	Description string    `json:"description"`
	Permissions string    `json:"permissions"` // JSON array of permission strings
	CreatedAt   time.Time `json:"createdAt"`
	UpdatedAt   time.Time `json:"updatedAt"`
}

func (sr *ServiceRole) TableName() string {
	return "service_roles"
}