package postgres

import (
	"context"
	"iam-saas/internal/domain"
	"iam-saas/internal/entities"

	"gorm.io/gorm"
)

type ticketRepository struct {
	db *gorm.DB
}

func NewTicketRepository(db *gorm.DB) domain.TicketRepository {
	return &ticketRepository{db}
}

func (r *ticketRepository) Create(ctx context.Context, tx *gorm.DB, ticket *entities.Ticket) error {
	db := r.db
	if tx != nil {
		db = tx
	}
	return db.WithContext(ctx).Create(ticket).Error
}

func (r *ticketRepository) FindByID(ctx context.Context, id int64) (*entities.Ticket, error) {
	var ticket entities.Ticket
	query := `
		SELECT id, subject, description, sender_email, status, created_at, updated_at
		FROM tickets
		WHERE id = $1;
	`
	rows, err := r.db.WithContext(ctx).Raw(query, id).Rows()
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	if rows.Next() {
		err := rows.Scan(&ticket.ID, &ticket.Subject, &ticket.Description, &ticket.SenderEmail, &ticket.Status, &ticket.CreatedAt, &ticket.UpdatedAt)
		if err != nil {
			return nil, err
		}
		return &ticket, nil
	}
	return nil, nil
}

func (r *ticketRepository) ListTickets(ctx context.Context, status string) ([]entities.Ticket, error) {
	var tickets []entities.Ticket
	query := `
		SELECT id, subject, description, sender_email, status, created_at, updated_at
		FROM tickets
		WHERE status = $1 OR $1 = ''
		ORDER BY created_at DESC;
	`
	rows, err := r.db.WithContext(ctx).Raw(query, status).Rows()
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	for rows.Next() {
		var ticket entities.Ticket
		err := rows.Scan(&ticket.ID, &ticket.Subject, &ticket.Description, &ticket.SenderEmail, &ticket.Status, &ticket.CreatedAt, &ticket.UpdatedAt)
		if err != nil {
			return nil, err
		}
		tickets = append(tickets, ticket)
	}
	return tickets, nil
}

func (r *ticketRepository) Update(ctx context.Context, ticket *entities.Ticket) error {
	query := `UPDATE tickets SET subject = ?, description = ?, sender_email = ?, status = ?, updated_at = NOW() WHERE id = ?`
	return r.db.WithContext(ctx).Exec(query, ticket.Subject, ticket.Description, ticket.SenderEmail, ticket.Status, ticket.ID).Error
}

func (r *ticketRepository) CreateReply(ctx context.Context, tx *gorm.DB, reply *entities.TicketReply) error {
	db := r.db
	if tx != nil {
		db = tx
	}
	return db.WithContext(ctx).Create(reply).Error
}

func (r *ticketRepository) ListRepliesByTicketID(ctx context.Context, ticketID int64) ([]entities.TicketReply, error) {
	var replies []entities.TicketReply
	query := `
		SELECT id, ticket_id, content, replier_email, created_at
		FROM ticket_replies
		WHERE ticket_id = $1
		ORDER BY created_at ASC;
	`
	rows, err := r.db.WithContext(ctx).Raw(query, ticketID).Rows()
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	for rows.Next() {
		var reply entities.TicketReply
		err := rows.Scan(&reply.ID, &reply.TicketID, &reply.Content, &reply.ReplierEmail, &reply.CreatedAt)
		if err != nil {
			return nil, err
		}
		replies = append(replies, reply)
	}
	return replies, nil
}
