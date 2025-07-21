package entities

import "time"

type User struct {
	ID                int64
	TenantID          int64
	Name              string
	Email             string
	PasswordHash      string
	VerificationToken *string `gorm:"column:verification_token"`
	Status            string  `gorm:"column:status;default:'pending'"`
	CreatedAt         time.Time
	UpdatedAt         time.Time
}
