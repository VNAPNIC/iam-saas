package entities

import "time"

type Plan struct {
	ID        int64     `json:"id"`
	Name      string    `json:"name"`
	Price     float64   `json:"price"`
	UserQuota int       `json:"userQuota"`
	APIQuota  int       `json:"apiQuota"`
	Status    string    `json:"status"`
	CreatedAt time.Time `json:"createdAt"`
	UpdatedAt time.Time `json:"updatedAt"`
}

func (p *Plan) TableName() string {
	return "plans"
}
