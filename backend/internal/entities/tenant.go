package entities

import "time"

type Tenant struct {
	ID                int64     `json:"id"`
	PlanID            int64     `json:"planId"`
	Key               string    `json:"key"`
	Name              string    `json:"name"`
	Status            string    `json:"status"` // pending_verification, active, suspended
	UserQuota         int       `json:"userQuota"`
	LogoURL           *string   `json:"logoUrl"`
	PrimaryColor      *string   `json:"primaryColor"`
	AllowPublicSignup bool      `json:"allowPublicSignup"`
	IsOnboarded       bool      `json:"isOnboarded"`
	CreatedAt         time.Time `json:"createdAt"`
	UpdatedAt         time.Time `json:"updatedAt"`
}
