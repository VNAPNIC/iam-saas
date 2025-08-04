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

type ServiceRoleHandler struct {
	serviceRoleService domain.ServiceRoleService
	tenantService      domain.TenantService
}

func NewServiceRoleHandler(serviceRoleService domain.ServiceRoleService, tenantService domain.TenantService) *ServiceRoleHandler {
	return &ServiceRoleHandler{
		serviceRoleService: serviceRoleService,
		tenantService:      tenantService,
	}
}

// Request structs
type createServiceRoleRequest struct {
	Name        string   `json:"name" binding:"required"`
	Description string   `json:"description"`
	Permissions []string `json:"permissions" binding:"required"`
}

type updateServiceRoleRequest struct {
	Name        string   `json:"name"`
	Description string   `json:"description"`
	Permissions []string `json:"permissions"`
}

// CreateServiceRole creates a new service role
func (h *ServiceRoleHandler) CreateServiceRole(c *gin.Context) {
	_ = c.MustGet(AuthPayloadKey).(*utils.Claims)
	var req createServiceRoleRequest
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

	serviceRole, err := h.serviceRoleService.CreateServiceRole(
		c.Request.Context(),
		tenant.ID,
		req.Name,
		req.Description,
		req.Permissions,
	)
	if err != nil {
		h.handleError(c, err)
		return
	}

	c.JSON(http.StatusCreated, NewSuccessResponse(serviceRole, string(i18n.ActionSuccessful)))
}

// GetServiceRole retrieves a service role by ID
func (h *ServiceRoleHandler) GetServiceRole(c *gin.Context) {
	serviceRoleID, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		h.handleError(c, app_error.NewInvalidInputError("Invalid service role ID"))
		return
	}

	tenantKeyVal, _ := c.Get(TenantContextKey)
	tenantKey := tenantKeyVal.(string)
	tenant, err := h.tenantService.GetTenantConfig(c.Request.Context(), tenantKey)
	if err != nil {
		h.handleError(c, err)
		return
	}

	serviceRole, err := h.serviceRoleService.GetServiceRole(c.Request.Context(), tenant.ID, serviceRoleID)
	if err != nil {
		h.handleError(c, err)
		return
	}

	c.JSON(http.StatusOK, NewSuccessResponse(serviceRole, string(i18n.ActionSuccessful)))
}

// ListServiceRoles retrieves all service roles for a tenant
func (h *ServiceRoleHandler) ListServiceRoles(c *gin.Context) {
	tenantKeyVal, _ := c.Get(TenantContextKey)
	tenantKey := tenantKeyVal.(string)
	tenant, err := h.tenantService.GetTenantConfig(c.Request.Context(), tenantKey)
	if err != nil {
		h.handleError(c, err)
		return
	}

	serviceRoles, err := h.serviceRoleService.ListServiceRoles(c.Request.Context(), tenant.ID)
	if err != nil {
		h.handleError(c, err)
		return
	}

	c.JSON(http.StatusOK, NewSuccessResponse(serviceRoles, string(i18n.ActionSuccessful)))
}

// UpdateServiceRole updates an existing service role
func (h *ServiceRoleHandler) UpdateServiceRole(c *gin.Context) {
	serviceRoleID, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		h.handleError(c, app_error.NewInvalidInputError("Invalid service role ID"))
		return
	}

	var req updateServiceRoleRequest
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

	serviceRole, err := h.serviceRoleService.UpdateServiceRole(
		c.Request.Context(),
		tenant.ID,
		serviceRoleID,
		req.Name,
		req.Description,
		req.Permissions,
	)
	if err != nil {
		h.handleError(c, err)
		return
	}

	c.JSON(http.StatusOK, NewSuccessResponse(serviceRole, string(i18n.ActionSuccessful)))
}

// DeleteServiceRole deletes a service role
func (h *ServiceRoleHandler) DeleteServiceRole(c *gin.Context) {
	serviceRoleID, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		h.handleError(c, app_error.NewInvalidInputError("Invalid service role ID"))
		return
	}

	tenantKeyVal, _ := c.Get(TenantContextKey)
	tenantKey := tenantKeyVal.(string)
	tenant, err := h.tenantService.GetTenantConfig(c.Request.Context(), tenantKey)
	if err != nil {
		h.handleError(c, err)
		return
	}

	err = h.serviceRoleService.DeleteServiceRole(c.Request.Context(), tenant.ID, serviceRoleID)
	if err != nil {
		h.handleError(c, err)
		return
	}

	c.JSON(http.StatusOK, NewSuccessResponse(nil, string(i18n.ActionSuccessful)))
}

func (h *ServiceRoleHandler) handleError(c *gin.Context, err error) {
	if appErr, ok := err.(*app_error.AppError); ok {
		response := NewErrorResponse(appErr.Message, string(appErr.Code), nil)
		c.JSON(appErr.GetStatusCode(), response)
	} else {
		response := NewErrorResponse(string(i18n.InternalServerError), string(app_error.CodeInternalError), err.Error())
		c.JSON(http.StatusInternalServerError, response)
	}
}