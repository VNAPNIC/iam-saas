package entities

import "time"

// Role represents a role within a tenant or a system-wide role.
type Role struct {
	ID          int64     `json:"id"`
	TenantID    *int64    `json:"tenantId,omitempty"` // Null for system roles
	Name        string    `json:"name"`
	Description string    `json:"description"`
	IsSystemRole bool      `json:"isSystemRole"`
	CreatedAt   time.Time `json:"createdAt"`
	UpdatedAt   time.Time `json:"updatedAt"`

	Permissions []Permission `json:"permissions,omitempty" gorm:"many2many:role_permissions;"`
}

func (r *Role) TableName() string {
	return "roles"
}
