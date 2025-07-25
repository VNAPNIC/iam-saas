package entities

import "time"

type Subscription struct {
	ID                   int64     `json:"id"`
	TenantID             int64     `json:"tenantId"`
	PlanID               int64     `json:"planId"`
	StripeCustomerID     string    `json:"stripeCustomerId"`
	StripeSubscriptionID string    `json:"stripeSubscriptionId"`
	Status               string    `json:"status"` // active, cancelled, past_due
	StartDate            time.Time `json:"startDate"`
	EndDate              time.Time `json:"endDate"`
	CurrentPeriodEnd     time.Time `json:"currentPeriodEnd"`
	CreatedAt            time.Time `json:"createdAt"`
	UpdatedAt            time.Time `json:"updatedAt"`
}

func (s *Subscription) TableName() string {
	return "subscriptions"
}
