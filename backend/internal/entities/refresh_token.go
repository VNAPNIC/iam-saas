package entities

import (
	"time"
)

type RefreshToken struct {
	Token     string    `gorm:"primaryKey" json:"token"`
	UserID    int64     `json:"user_id"`
	ExpiresAt time.Time `json:"expires_at"`
	CreatedAt time.Time `json:"created_at"`
}
