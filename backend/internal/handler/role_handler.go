package handler

import (
	"iam-saas/internal/domain"
	"iam-saas/internal/entities"
	"iam-saas/pkg/app_error"
	"iam-saas/pkg/i18n"
	"iam-saas/pkg/utils"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

type RoleHandler struct {
	roleService domain.RoleService
}

func NewRoleHandler(roleService domain.RoleService) *RoleHandler {
	return &RoleHandler{roleService}
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
	claims := c.MustGet(AuthPayloadKey).(*utils.Claims)
	var req createRoleRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		h.handleError(c, app_error.NewInvalidInputError(err.Error()))
		return
	}

	role := &entities.Role{
		TenantID:    &claims.TenantID,
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
	claims := c.MustGet(AuthPayloadKey).(*utils.Claims)
	roles, err := h.roleService.ListRoles(c.Request.Context(), claims.TenantID)
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