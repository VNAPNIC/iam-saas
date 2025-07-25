package handler

import (
	"iam-saas/internal/domain"
	"iam-saas/internal/entities"
	"iam-saas/pkg/app_error"
	"iam-saas/pkg/i18n"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

type RoleHandler struct {
	roleService   domain.RoleService
	tenantService domain.TenantService
}

func NewRoleHandler(roleService domain.RoleService, tenantService domain.TenantService) *RoleHandler {
	return &RoleHandler{roleService: roleService, tenantService: tenantService}
}

// --- Request Structs ---
type createRoleRequest struct {
	Name          string  `json:"name" binding:"required"`
	Description   string  `json:"description"`
	PermissionIDs []int64 `json:"permissionIds"`
}

type updateRoleRequest struct {
	Name          string  `json:"name" binding:"required"`
	Description   string  `json:"description"`
	PermissionIDs []int64 `json:"permissionIds"`
}

// --- Handlers ---

func (h *RoleHandler) CreateRole(c *gin.Context) {
	var req createRoleRequest
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

	role := &entities.Role{
		TenantID:    &tenant.ID,
		Name:        req.Name,
		Description: req.Description,
	}

	if err := h.roleService.CreateRole(c.Request.Context(), role, req.PermissionIDs); err != nil {
		h.handleError(c, err)
		return
	}

	c.JSON(http.StatusCreated, NewSuccessResponse(role, string(i18n.ActionSuccessful)))
}

func (h *RoleHandler) GetRole(c *gin.Context) {
	roleID, _ := strconv.ParseInt(c.Param("id"), 10, 64)
	role, err := h.roleService.GetRole(c.Request.Context(), roleID)
	if err != nil {
		h.handleError(c, err)
		return
	}
	c.JSON(http.StatusOK, NewSuccessResponse(role, string(i18n.ActionSuccessful)))
}

func (h *RoleHandler) ListRoles(c *gin.Context) {
	tenantKeyVal, _ := c.Get(TenantContextKey)
	tenantKey := tenantKeyVal.(string)
	tenant, err := h.tenantService.GetTenantConfig(c.Request.Context(), tenantKey)
	if err != nil {
		h.handleError(c, err)
		return
	}
	roles, err := h.roleService.ListRoles(c.Request.Context(), tenant.ID)
	if err != nil {
		h.handleError(c, err)
		return
	}
	c.JSON(http.StatusOK, NewSuccessResponse(roles, string(i18n.ActionSuccessful)))
}

func (h *RoleHandler) UpdateRole(c *gin.Context) {
	roleID, _ := strconv.ParseInt(c.Param("id"), 10, 64)
	var req updateRoleRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		h.handleError(c, app_error.NewInvalidInputError(err.Error()))
		return
	}

	role := &entities.Role{
		ID:          roleID,
		Name:        req.Name,
		Description: req.Description,
	}

	if err := h.roleService.UpdateRole(c.Request.Context(), role, req.PermissionIDs); err != nil {
		h.handleError(c, err)
		return
	}

	c.JSON(http.StatusOK, NewSuccessResponse(role, string(i18n.ActionSuccessful)))
}

func (h *RoleHandler) DeleteRole(c *gin.Context) {
	roleID, _ := strconv.ParseInt(c.Param("id"), 10, 64)
	if err := h.roleService.DeleteRole(c.Request.Context(), roleID); err != nil {
		h.handleError(c, err)
		return
	}
	c.JSON(http.StatusOK, NewSuccessResponse(nil, string(i18n.ActionSuccessful)))
}

func (h *RoleHandler) ListPermissions(c *gin.Context) {
	permissions, err := h.roleService.ListPermissions(c.Request.Context())
	if err != nil {
		h.handleError(c, err)
		return
	}
	c.JSON(http.StatusOK, NewSuccessResponse(permissions, string(i18n.ActionSuccessful)))
}

func (h *RoleHandler) handleError(c *gin.Context, err error) {
	if appErr, ok := err.(*app_error.AppError); ok {
		response := NewErrorResponse(appErr.Message, string(appErr.Code), nil)
		c.JSON(appErr.GetStatusCode(), response)
	} else {
		response := NewErrorResponse(string(i18n.InternalServerError), string(app_error.CodeInternalError), err.Error())
		c.JSON(http.StatusInternalServerError, response)
	}
}
