package entities

import "time"

type AccessKeyGroup struct {
	ID          int64     `json:"id"`
	TenantID    int64     `json:"tenantId"`
	Name        string    `json:"name"`
	ServiceRole string    `json:"serviceRole"`
	KeyType     string    `json:"keyType"` // e.g., "user-key", "direct-key"
	CreatedAt   time.Time `json:"createdAt"`
	UpdatedAt   time.Time `json:"updatedAt"`

	Keys []AccessKey `json:"keys,omitempty" gorm:"foreignKey:GroupID"`
}

func (g *AccessKeyGroup) TableName() string {
	return "access_key_groups"
}

type AccessKey struct {
	ID          int64     `json:"id"`
	GroupID     int64     `json:"groupId"`
	AccessKeyID string    `json:"accessKeyId"`
	SecretKey   string    `json:"-"` // Never expose
	Status      string    `json:"status"` // active, inactive
	CreatedAt   time.Time `json:"createdAt"`
	UpdatedAt   time.Time `json:"updatedAt"`
}

func (k *AccessKey) TableName() string {
	return "access_keys"
}
