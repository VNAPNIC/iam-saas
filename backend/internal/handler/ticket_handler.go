package handler

import (
	"iam-saas/internal/domain"
	"iam-saas/pkg/app_error"
	"iam-saas/pkg/i18n"
	"iam-saas/pkg/utils"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

type TicketHandler struct {
	ticketService domain.TicketService
}

func NewTicketHandler(ticketService domain.TicketService) *TicketHandler {
	return &TicketHandler{ticketService}
}

type createTicketRequest struct {
	Subject     string `json:"subject" binding:"required"`
	Description string `json:"description" binding:"required"`
	Priority    string `json:"priority"`
	Category    string `json:"category"`
}

type updateTicketStatusRequest struct {
	Status string `json:"status" binding:"required"`
}

type addTicketReplyRequest struct {
	Content string `json:"content" binding:"required"`
}

// CreateTicket creates a new support ticket
func (h *TicketHandler) CreateTicket(c *gin.Context) {
	claims := c.MustGet(AuthPayloadKey).(*utils.Claims)

	var req createTicketRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		h.handleError(c, app_error.NewInvalidInputError(err.Error()))
		return
	}

	ticket, err := h.ticketService.CreateTicket(
		c.Request.Context(),
		claims.TenantID,
		req.Subject,
		req.Description,
		claims.UserEmail,
	)
	if err != nil {
		h.handleError(c, err)
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"success": true,
		"message": "Ticket created successfully",
		"data":    ticket,
	})
}

// GetTicket retrieves a specific ticket
func (h *TicketHandler) GetTicket(c *gin.Context) {
	claims := c.MustGet(AuthPayloadKey).(*utils.Claims)
	
	ticketIDStr := c.Param("id")
	ticketID, err := strconv.ParseInt(ticketIDStr, 10, 64)
	if err != nil {
		h.handleError(c, app_error.NewInvalidInputError("Invalid ticket ID"))
		return
	}

	ticket, err := h.ticketService.GetTicket(c.Request.Context(), claims.TenantID, ticketID)
	if err != nil {
		h.handleError(c, err)
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Ticket retrieved successfully",
		"data":    ticket,
	})
}

// ListTickets retrieves all tickets for a tenant
func (h *TicketHandler) ListTickets(c *gin.Context) {
	claims := c.MustGet(AuthPayloadKey).(*utils.Claims)
	
	status := c.Query("status")

	tickets, err := h.ticketService.ListTickets(c.Request.Context(), claims.TenantID, status)
	if err != nil {
		h.handleError(c, err)
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Tickets retrieved successfully",
		"data":    tickets,
	})
}

// UpdateTicketStatus updates the status of a ticket
func (h *TicketHandler) UpdateTicketStatus(c *gin.Context) {
	claims := c.MustGet(AuthPayloadKey).(*utils.Claims)

	ticketIDStr := c.Param("id")
	ticketID, err := strconv.ParseInt(ticketIDStr, 10, 64)
	if err != nil {
		h.handleError(c, app_error.NewInvalidInputError("Invalid ticket ID"))
		return
	}

	var req updateTicketStatusRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		h.handleError(c, app_error.NewInvalidInputError(err.Error()))
		return
	}

	ticket, err := h.ticketService.UpdateTicketStatus(
		c.Request.Context(),
		claims.TenantID,
		ticketID,
		req.Status,
	)
	if err != nil {
		h.handleError(c, err)
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Ticket status updated successfully",
		"data":    ticket,
	})
}

// ReplyToTicket adds a reply to a ticket
func (h *TicketHandler) ReplyToTicket(c *gin.Context) {
	claims := c.MustGet(AuthPayloadKey).(*utils.Claims)

	ticketIDStr := c.Param("id")
	ticketID, err := strconv.ParseInt(ticketIDStr, 10, 64)
	if err != nil {
		h.handleError(c, app_error.NewInvalidInputError("Invalid ticket ID"))
		return
	}

	var req addTicketReplyRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		h.handleError(c, app_error.NewInvalidInputError(err.Error()))
		return
	}

	reply, err := h.ticketService.ReplyToTicket(
		c.Request.Context(),
		claims.TenantID,
		ticketID,
		req.Content,
		claims.UserEmail,
	)
	if err != nil {
		h.handleError(c, err)
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"success": true,
		"message": "Reply added successfully",
		"data":    reply,
	})
}

func (h *TicketHandler) handleError(c *gin.Context, err error) {
	if appErr, ok := err.(*app_error.AppError); ok {
		c.JSON(appErr.GetStatusCode(), gin.H{
			"success": false,
			"message": appErr.Message,
			"code":    string(appErr.Code),
		})
	} else {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": string(i18n.InternalServerError),
			"code":    string(app_error.CodeInternalError),
			"error":   err.Error(),
		})
	}
}