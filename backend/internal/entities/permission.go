package entities

import "time"

// Permission represents an action that can be performed on a resource.
type Permission struct {
	ID          int64     `json:"id"`
	Key         string    `json:"key"` // e.g., 'users:create', 'roles:read'
	Description string    `json:"description"`
	CreatedAt   time.Time `json:"createdAt"`
	UpdatedAt   time.Time `json:"updatedAt"`
}

func (p *Permission) TableName() string {
	return "permissions"
}
