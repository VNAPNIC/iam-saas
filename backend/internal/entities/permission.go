package entities

// Permission represents an action that can be performed on a resource.
type Permission struct {
	ID          int64  `json:"id"`
	Action      string `json:"action"`      // e.g., 'create', 'read', 'update', 'delete'
	Resource    string `json:"resource"`    // e.g., 'users', 'roles', 'settings'
	Description string `json:"description"`
}

func (p *Permission) TableName() string {
	return "permissions"
}
