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
	tenantService domain.TenantService
}

func NewTicketHandler(ticketService domain.TicketService, tenantService domain.TenantService) *TicketHandler {
	return &TicketHandler{ticketService: ticketService, tenantService: tenantService}
}

// --- Request Structs ---
type createTicketRequest struct {
	Subject     string `json:"subject" binding:"required"`
	Description string `json:"description" binding:"required"`
}

type replyTicketRequest struct {
	Content string `json:"content" binding:"required"`
}

type updateTicketStatusRequest struct {
	Status string `json:"status" binding:"required"`
}

// --- Handlers ---

func (h *TicketHandler) CreateTicket(c *gin.Context) {
	claims := c.MustGet(AuthPayloadKey).(*utils.Claims)
	var req createTicketRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		h.handleError(c, app_error.NewInvalidInputError(err.Error()))
		return
	}
	tenantKeyVal, _ := c.Get(TenantContextKey)
	tenantKey := tenantKeyVal.(string)
	tenant, err := h.tenantService.GetTenantConfig(c.Request.Context(), tenantKey)
	if err != nil {
		h.handleError(c, err)
		return
	}

	ticket, err := h.ticketService.CreateTicket(c.Request.Context(), tenant.ID, req.Subject, req.Description, claims.UserEmail) // Assuming UserEmail is in claims
	if err != nil {
		h.handleError(c, err)
		return
	}

	c.JSON(http.StatusCreated, NewSuccessResponse(ticket, string(i18n.ActionSuccessful)))
}

func (h *TicketHandler) GetTicket(c *gin.Context) {
	ticketID, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		h.handleError(c, app_error.NewInvalidInputError(err.Error()))
		return
	}
	tenantKeyVal, _ := c.Get(TenantContextKey)
	tenantKey := tenantKeyVal.(string)
	tenant, err := h.tenantService.GetTenantConfig(c.Request.Context(), tenantKey)
	if err != nil {
		h.handleError(c, err)
		return
	}
	ticket, err := h.ticketService.GetTicket(c.Request.Context(), tenant.ID, ticketID)
	if err != nil {
		h.handleError(c, err)
		return
	}
	c.JSON(http.StatusOK, NewSuccessResponse(ticket, string(i18n.ActionSuccessful)))
}

func (h *TicketHandler) ListTickets(c *gin.Context) {
	status := c.Query("status")
	tenantKeyVal, _ := c.Get(TenantContextKey)
	tenantKey := tenantKeyVal.(string)
	tenant, err := h.tenantService.GetTenantConfig(c.Request.Context(), tenantKey)
	if err != nil {
		h.handleError(c, err)
		return
	}
	tickets, err := h.ticketService.ListTickets(c.Request.Context(), tenant.ID, status)
	if err != nil {
		h.handleError(c, err)
		return
	}
	c.JSON(http.StatusOK, NewSuccessResponse(tickets, string(i18n.ActionSuccessful)))
}

func (h *TicketHandler) ReplyToTicket(c *gin.Context) {
	claims := c.MustGet(AuthPayloadKey).(*utils.Claims)
	ticketID, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		h.handleError(c, app_error.NewInvalidInputError(err.Error()))
		return
	}
	var req replyTicketRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		h.handleError(c, app_error.NewInvalidInputError(err.Error()))
		return
	}
	tenantKeyVal, _ := c.Get(TenantContextKey)
	tenantKey := tenantKeyVal.(string)
	tenant, err := h.tenantService.GetTenantConfig(c.Request.Context(), tenantKey)
	if err != nil {
		h.handleError(c, err)
		return
	}

	reply, err := h.ticketService.ReplyToTicket(c.Request.Context(), tenant.ID, ticketID, req.Content, claims.UserEmail) // Assuming UserEmail is in claims
	if err != nil {
		h.handleError(c, err)
		return
	}
	c.JSON(http.StatusCreated, NewSuccessResponse(reply, string(i18n.ActionSuccessful)))
}

func (h *TicketHandler) UpdateTicketStatus(c *gin.Context) {
	ticketID, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		h.handleError(c, app_error.NewInvalidInputError(err.Error()))
		return
	}
	var req updateTicketStatusRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		h.handleError(c, app_error.NewInvalidInputError(err.Error()))
		return
	}
	tenantKeyVal, _ := c.Get(TenantContextKey)
	tenantKey := tenantKeyVal.(string)
	tenant, err := h.tenantService.GetTenantConfig(c.Request.Context(), tenantKey)
	if err != nil {
		h.handleError(c, err)
		return
	}

	ticket, err := h.ticketService.UpdateTicketStatus(c.Request.Context(), tenant.ID, ticketID, req.Status)
	if err != nil {
		h.handleError(c, err)
		return
	}
	c.JSON(http.StatusOK, NewSuccessResponse(ticket, string(i18n.ActionSuccessful)))
}

func (h *TicketHandler) handleError(c *gin.Context, err error) {
	if appErr, ok := err.(*app_error.AppError); ok {
		response := NewErrorResponse(appErr.Message, string(appErr.Code), nil)
		c.JSON(appErr.GetStatusCode(), response)
	} else {
		response := NewErrorResponse(string(i18n.InternalServerError), string(app_error.CodeInternalError), err.Error())
		c.JSON(http.StatusInternalServerError, response)
	}
}
