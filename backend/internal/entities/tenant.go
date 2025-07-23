package entities

import "time"

type Tenant struct {
	ID                int64     `json:"id"`
	PlanID            int64     `json:"planId"`
	Name              string    `json:"name"`
	Status            string    `json:"status"` // pending_verification, active, suspended
	UserQuota         int       `json:"userQuota"`
	LogoURL           *string   `json:"logoUrl"`
	PrimaryColor      *string   `json:"primaryColor"`
	AllowPublicSignup bool      `json:"allowPublicSignup"`
	CreatedAt         time.Time `json:"createdAt"`
	UpdatedAt         time.Time `json:"updatedAt"`
}
