package entities

import "time"

type Ticket struct {
	ID          int64     `json:"id"`
	Subject     string    `json:"subject"`
	Description string    `json:"description"`
	SenderEmail string    `json:"senderEmail"`
	Status      string    `json:"status"` // new, pending, closed
	CreatedAt   time.Time `json:"createdAt"`
	UpdatedAt   time.Time `json:"updatedAt"`

	Replies []TicketReply `json:"replies,omitempty" gorm:"foreignKey:TicketID"`
}

func (t *Ticket) TableName() string {
	return "tickets"
}

type TicketReply struct {
	ID         int64     `json:"id"`
	TicketID   int64     `json:"ticketId"`
	Content    string    `json:"content"`
	ReplierEmail string    `json:"replierEmail"`
	CreatedAt  time.Time `json:"createdAt"`
}

func (tr *TicketReply) TableName() string {
	return "ticket_replies"
}
