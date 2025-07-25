package service

import (
	"context"
	"iam-saas/internal/domain"
	"iam-saas/internal/entities"
	"iam-saas/pkg/app_error"

	"gorm.io/gorm"
)

type ticketService struct {
	db         *gorm.DB
	ticketRepo domain.TicketRepository
}

func NewTicketService(db *gorm.DB, ticketRepo domain.TicketRepository) domain.TicketService {
	return &ticketService{db, ticketRepo}
}

func (s *ticketService) CreateTicket(ctx context.Context, tenantID int64, subject, description, senderEmail string) (*entities.Ticket, error) {
	newTicket := &entities.Ticket{
		TenantID:    tenantID,
		Subject:     subject,
		Description: description,
		SenderEmail: senderEmail,
		Status:      "new",
	}

	if err := s.ticketRepo.Create(ctx, nil, newTicket); err != nil {
		return nil, app_error.NewInternalServerError(err)
	}

	return newTicket, nil
}

func (s *ticketService) GetTicket(ctx context.Context, tenantID int64, id int64) (*entities.Ticket, error) {
	ticket, err := s.ticketRepo.FindByID(ctx, id)
	if err != nil {
		return nil, app_error.NewInternalServerError(err)
	}
	if ticket == nil || ticket.TenantID != tenantID {
		return nil, app_error.NewNotFoundError("Ticket not found or not in tenant")
	}
	return ticket, nil
}

func (s *ticketService) ListTickets(ctx context.Context, tenantID int64, status string) ([]entities.Ticket, error) {
	return s.ticketRepo.ListTickets(ctx, tenantID, status)
}

func (s *ticketService) ReplyToTicket(ctx context.Context, tenantID int64, ticketID int64, replyContent, replierEmail string) (*entities.TicketReply, error) {
	tx := s.db.WithContext(ctx).Begin()
	if tx.Error != nil {
		return nil, app_error.NewInternalServerError(tx.Error)
	}

	ticket, err := s.ticketRepo.FindByID(ctx, ticketID)
	if err != nil {
		tx.Rollback()
		return nil, app_error.NewInternalServerError(err)
	}
	if ticket == nil || ticket.TenantID != tenantID {
		tx.Rollback()
		return nil, app_error.NewNotFoundError("Ticket not found or not in tenant")
	}

	reply := &entities.TicketReply{
		TicketID:     ticketID,
		Content:      replyContent,
		ReplierEmail: replierEmail,
	}

	if err := s.ticketRepo.CreateReply(ctx, tx, reply); err != nil {
		tx.Rollback()
		return nil, app_error.NewInternalServerError(err)
	}

	// Update ticket status to 'pending' if it was 'new'
	if ticket.Status == "new" {
		if err := s.ticketRepo.Update(ctx, &entities.Ticket{ID: ticketID, Status: "pending"}); err != nil {
			tx.Rollback()
			return nil, app_error.NewInternalServerError(err)
		}
	}

	return reply, tx.Commit().Error
}

func (s *ticketService) UpdateTicketStatus(ctx context.Context, tenantID int64, id int64, status string) (*entities.Ticket, error) {
	ticket, err := s.ticketRepo.FindByID(ctx, id)
	if err != nil {
		return nil, app_error.NewInternalServerError(err)
	}
	if ticket == nil || ticket.TenantID != tenantID {
		return nil, app_error.NewNotFoundError("Ticket not found or not in tenant")
	}

	ticket.Status = status
	if err := s.ticketRepo.Update(ctx, ticket); err != nil {
		return nil, app_error.NewInternalServerError(err)
	}

	return ticket, nil
}
