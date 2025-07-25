package domain

import (
	"context"
	"iam-saas/internal/entities"

	"gorm.io/gorm"
)

type TicketRepository interface {
	Create(ctx context.Context, tx *gorm.DB, ticket *entities.Ticket) error
	FindByID(ctx context.Context, id int64) (*entities.Ticket, error)
	ListTickets(ctx context.Context, tenantID int64, status string) ([]entities.Ticket, error)
	Update(ctx context.Context, ticket *entities.Ticket) error
	CreateReply(ctx context.Context, tx *gorm.DB, reply *entities.TicketReply) error
	ListRepliesByTicketID(ctx context.Context, ticketID int64) ([]entities.TicketReply, error)
}

type TicketService interface {
	CreateTicket(ctx context.Context, tenantID int64, subject, description, senderEmail string) (*entities.Ticket, error)
	GetTicket(ctx context.Context, tenantID int64, id int64) (*entities.Ticket, error)
	ListTickets(ctx context.Context, tenantID int64, status string) ([]entities.Ticket, error)
	ReplyToTicket(ctx context.Context, tenantID int64, ticketID int64, replyContent, replierEmail string) (*entities.TicketReply, error)
	UpdateTicketStatus(ctx context.Context, tenantID int64, id int64, status string) (*entities.Ticket, error)
}
