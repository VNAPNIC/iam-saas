package handler

import (
	"iam-saas/internal/domain"
	"iam-saas/pkg/app_error"
	"iam-saas/pkg/i18n"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

type SessionHandler struct {
	sessionService domain.SessionService
	tenantService  domain.TenantService
}

func NewSessionHandler(sessionService domain.SessionService, tenantService domain.TenantService) *SessionHandler {
	return &SessionHandler{
		sessionService: sessionService,
		tenantService:  tenantService,
	}
}

// ListSessions retrieves all active sessions for a tenant
func (h *SessionHandler) ListSessions(c *gin.Context) {
	tenantKeyVal, _ := c.Get(TenantContextKey)
	tenantKey := tenantKeyVal.(string)
	tenant, err := h.tenantService.GetTenantConfig(c.Request.Context(), tenantKey)
	if err != nil {
		h.handleError(c, err)
		return
	}

	// Parse filters from query parameters
	filters := domain.SessionFilters{
		UserEmail: c.Query("userEmail"),
		IPAddress: c.Query("ipAddress"),
		OS:        c.Query("os"),
		Browser:   c.Query("browser"),
	}

	sessions, err := h.sessionService.ListSessions(c.Request.Context(), tenant.ID, filters)
	if err != nil {
		h.handleError(c, err)
		return
	}

	c.JSON(http.StatusOK, NewSuccessResponse(sessions, string(i18n.ActionSuccessful)))
}

// GetSession retrieves a specific session
func (h *SessionHandler) GetSession(c *gin.Context) {
	sessionID, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		h.handleError(c, app_error.NewInvalidInputError("Invalid session ID"))
		return
	}

	tenantKeyVal, _ := c.Get(TenantContextKey)
	tenantKey := tenantKeyVal.(string)
	tenant, err := h.tenantService.GetTenantConfig(c.Request.Context(), tenantKey)
	if err != nil {
		h.handleError(c, err)
		return
	}

	session, err := h.sessionService.GetSession(c.Request.Context(), tenant.ID, sessionID)
	if err != nil {
		h.handleError(c, err)
		return
	}

	c.JSON(http.StatusOK, NewSuccessResponse(session, string(i18n.ActionSuccessful)))
}

// RevokeSession revokes a specific session
func (h *SessionHandler) RevokeSession(c *gin.Context) {
	sessionID, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		h.handleError(c, app_error.NewInvalidInputError("Invalid session ID"))
		return
	}

	tenantKeyVal, _ := c.Get(TenantContextKey)
	tenantKey := tenantKeyVal.(string)
	tenant, err := h.tenantService.GetTenantConfig(c.Request.Context(), tenantKey)
	if err != nil {
		h.handleError(c, err)
		return
	}

	err = h.sessionService.RevokeSession(c.Request.Context(), tenant.ID, sessionID)
	if err != nil {
		h.handleError(c, err)
		return
	}

	c.JSON(http.StatusOK, NewSuccessResponse(nil, string(i18n.ActionSuccessful)))
}

// RevokeAllSessions revokes all sessions for the tenant
func (h *SessionHandler) RevokeAllSessions(c *gin.Context) {
	tenantKeyVal, _ := c.Get(TenantContextKey)
	tenantKey := tenantKeyVal.(string)
	tenant, err := h.tenantService.GetTenantConfig(c.Request.Context(), tenantKey)
	if err != nil {
		h.handleError(c, err)
		return
	}

	err = h.sessionService.RevokeAllSessions(c.Request.Context(), tenant.ID)
	if err != nil {
		h.handleError(c, err)
		return
	}

	c.JSON(http.StatusOK, NewSuccessResponse(nil, string(i18n.ActionSuccessful)))
}

// RevokeUserSessions revokes all sessions for a specific user
func (h *SessionHandler) RevokeUserSessions(c *gin.Context) {
	userEmail := c.Param("userEmail")
	if userEmail == "" {
		h.handleError(c, app_error.NewInvalidInputError("User email is required"))
		return
	}

	tenantKeyVal, _ := c.Get(TenantContextKey)
	tenantKey := tenantKeyVal.(string)
	tenant, err := h.tenantService.GetTenantConfig(c.Request.Context(), tenantKey)
	if err != nil {
		h.handleError(c, err)
		return
	}

	err = h.sessionService.RevokeUserSessions(c.Request.Context(), tenant.ID, userEmail)
	if err != nil {
		h.handleError(c, err)
		return
	}

	c.JSON(http.StatusOK, NewSuccessResponse(nil, string(i18n.ActionSuccessful)))
}

func (h *SessionHandler) handleError(c *gin.Context, err error) {
	if appErr, ok := err.(*app_error.AppError); ok {
		response := NewErrorResponse(appErr.Message, string(appErr.Code), nil)
		c.JSON(appErr.GetStatusCode(), response)
	} else {
		response := NewErrorResponse(string(i18n.InternalServerError), string(app_error.CodeInternalError), err.Error())
		c.JSON(http.StatusInternalServerError, response)
	}
}