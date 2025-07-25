package entities

import "time"

type User struct {
	ID                          int64      `json:"id"`
	TenantID                    int64      `json:"tenantId"`
	TenantKey                   string     `json:"tenantKey,omitempty"`
	Name                        string     `json:"name"`
	Email                       string     `json:"email"`
	PasswordHash                string     `json:"-"` // Không bao giờ trả về password hash
	MFASecret                   *string    `json:"-"`
	VerificationToken           *string    `json:"-"`
	Status                      string     `json:"status"`
	AvatarURL                   *string    `json:"avatarUrl"`
	PhoneNumber                 *string    `json:"phoneNumber"`
	EmailVerifiedAt             *time.Time `json:"emailVerifiedAt,omitempty"`
	PhoneVerifiedAt             *time.Time `json:"phoneVerifiedAt,omitempty"`
	LastLoginAt                 *time.Time `json:"lastLoginAt,omitempty"`
	CreatedAt                   time.Time  `json:"createdAt"`
	UpdatedAt                   time.Time  `json:"updatedAt"`
	PasswordResetToken          *string    `json:"-"`
	PasswordResetTokenExpiresAt *time.Time `json:"-"`
	InvitationToken             *string    `json:"-"`
	RoleIDs                     []int64    `gorm:"-"`
}
