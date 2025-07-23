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

type PolicyHandler struct {
	policyService domain.PolicyService
}

func NewPolicyHandler(policyService domain.PolicyService) *PolicyHandler {
	return &PolicyHandler{policyService: policyService}
}

// --- Request Structs ---
type createPolicyRequest struct {
	Name      string `json:"name" binding:"required"`
	Target    string `json:"target" binding:"required"`
	Condition string `json:"condition" binding:"required"`
	Status    string `json:"status" binding:"required"`
}

type updatePolicyRequest struct {
	Name      string `json:"name" binding:"required"`
	Target    string `json:"target" binding:"required"`
	Condition string `json:"condition" binding:"required"`
	Status    string `json:"status" binding:"required"`
}

type simulatePolicyRequest struct {
	UserEmail   string `json:"userEmail" binding:"required,email"`
	ActionKey   string `json:"actionKey" binding:"required"`
	ContextIP   string `json:"contextIp"`
	ContextTime string `json:"contextTime"`
}

// --- Handlers ---

func (h *PolicyHandler) CreatePolicy(c *gin.Context) {
	claims := c.MustGet(AuthPayloadKey).(*utils.Claims)
	var req createPolicyRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		h.handleError(c, app_error.NewInvalidInputError(err.Error()))
		return
	}

	policy, err := h.policyService.CreatePolicy(c.Request.Context(), claims.TenantID, req.Name, req.Target, req.Condition, req.Status)
	if err != nil {
		h.handleError(c, err)
		return
	}

	c.JSON(http.StatusCreated, NewSuccessResponse(policy, string(i18n.ActionSuccessful)))
}

func (h *PolicyHandler) GetPolicy(c *gin.Context) {
	policyID, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		h.handleError(c, app_error.NewInvalidInputError(err.Error()))
		return
	}
	policy, err := h.policyService.GetPolicy(c.Request.Context(), policyID)
	if err != nil {
		h.handleError(c, err)
		return
	}
	c.JSON(http.StatusOK, NewSuccessResponse(policy, string(i18n.ActionSuccessful)))
}

func (h *PolicyHandler) ListPolicies(c *gin.Context) {
	claims := c.MustGet(AuthPayloadKey).(*utils.Claims)
	policies, err := h.policyService.ListPolicies(c.Request.Context(), claims.TenantID)
	if err != nil {
		h.handleError(c, err)
		return
	}
	c.JSON(http.StatusOK, NewSuccessResponse(policies, string(i18n.ActionSuccessful)))
}

func (h *PolicyHandler) UpdatePolicy(c *gin.Context) {
	policyID, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		h.handleError(c, app_error.NewInvalidInputError(err.Error()))
		return
	}
	var req updatePolicyRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		h.handleError(c, app_error.NewInvalidInputError(err.Error()))
		return
	}

	policy, err := h.policyService.UpdatePolicy(c.Request.Context(), policyID, req.Name, req.Target, req.Condition, req.Status)
	if err != nil {
		h.handleError(c, err)
		return
	}

	c.JSON(http.StatusOK, NewSuccessResponse(policy, string(i18n.ActionSuccessful)))
}

func (h *PolicyHandler) DeletePolicy(c *gin.Context) {
	policyID, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		h.handleError(c, app_error.NewInvalidInputError(err.Error()))
		return
	}
	if err := h.policyService.DeletePolicy(c.Request.Context(), policyID); err != nil {
		h.handleError(c, err)
		return
	}
	c.JSON(http.StatusOK, NewSuccessResponse(nil, string(i18n.ActionSuccessful)))
}

func (h *PolicyHandler) SimulatePolicy(c *gin.Context) {
	claims := c.MustGet(AuthPayloadKey).(*utils.Claims)
	var req simulatePolicyRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		h.handleError(c, app_error.NewInvalidInputError(err.Error()))
		return
	}

	decision, reason, err := h.policyService.SimulatePolicy(c.Request.Context(), claims.TenantID, req.UserEmail, req.ActionKey, req.ContextIP, req.ContextTime)
	if err != nil {
		h.handleError(c, err)
		return
	}

	c.JSON(http.StatusOK, NewSuccessResponse(gin.H{"decision": decision, "reason": reason}, string(i18n.ActionSuccessful)))
}

func (h *PolicyHandler) handleError(c *gin.Context, err error) {
	if appErr, ok := err.(*app_error.AppError); ok {
		response := NewErrorResponse(appErr.Message, string(appErr.Code), nil)
		c.JSON(appErr.GetStatusCode(), response)
	} else {
		response := NewErrorResponse(string(i18n.InternalServerError), string(app_error.CodeInternalError), err.Error())
		c.JSON(http.StatusInternalServerError, response)
	}
}
