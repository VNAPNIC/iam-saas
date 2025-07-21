package entities

import "time"

type User struct {
	ID                int64     `json:"id"`
	TenantID          int64     `json:"tenantId"`
	Name              string    `json:"name"`
	Email             string    `json:"email"`
	PasswordHash      string    `json:"-"` // Không bao giờ trả về password hash
	VerificationToken *string   `json:"-"`
	Status            string    `json:"status"`
	AvatarURL         *string   `json:"avatarUrl"`
	PhoneNumber       *string   `json:"phoneNumber"`
	CreatedAt         time.Time `json:"createdAt"`
	UpdatedAt         time.Time `json:"updatedAt"`
}
