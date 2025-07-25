package entities

import "time"

type Token struct {
	TokenKey     string `gorm:"primary_key"`
	Token        string `gorm:"unique;not null"`
	RefreshToken *string
	TokenType    string
	Expiration   time.Time `gorm:"not null"`
	CreatedAt    time.Time
	RevokedAt    *time.Time
}
