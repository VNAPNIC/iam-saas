package handler

import (
	"iam-saas/internal/domain"
	"iam-saas/pkg/app_error"
	"iam-saas/pkg/i18n"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

type PlanHandler struct {
	planService domain.PlanService
}

func NewPlanHandler(planService domain.PlanService) *PlanHandler {
	return &PlanHandler{planService: planService}
}

// --- Request Structs ---
type createPlanRequest struct {
	Name      string  `json:"name" binding:"required"`
	Price     float64 `json:"price" binding:"required,min=0"`
	UserLimit int     `json:"userLimit" binding:"required,min=0"`
	ApiLimit  int     `json:"apiLimit" binding:"required,min=0"`
	Status    string  `json:"status" binding:"required"`
}

type updatePlanRequest struct {
	Name      string  `json:"name" binding:"required"`
	Price     float64 `json:"price" binding:"required,min=0"`
	UserLimit int     `json:"userLimit" binding:"required,min=0"`
	ApiLimit  int     `json:"apiLimit" binding:"required,min=0"`
	Status    string  `json:"status" binding:"required"`
}

// --- Handlers ---

func (h *PlanHandler) CreatePlan(c *gin.Context) {
	var req createPlanRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		h.handleError(c, app_error.NewInvalidInputError(err.Error()))
		return
	}

	plan, err := h.planService.CreatePlan(c.Request.Context(), req.Name, req.Price, req.UserLimit, req.ApiLimit, req.Status)
	if err != nil {
		h.handleError(c, err)
		return
	}

	c.JSON(http.StatusCreated, NewSuccessResponse(plan, string(i18n.ActionSuccessful)))
}

func (h *PlanHandler) GetPlan(c *gin.Context) {
	planID, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		h.handleError(c, app_error.NewInvalidInputError(err.Error()))
		return
	}
	plan, err := h.planService.GetPlan(c.Request.Context(), planID)
	if err != nil {
		h.handleError(c, err)
		return
	}
	c.JSON(http.StatusOK, NewSuccessResponse(plan, string(i18n.ActionSuccessful)))
}

func (h *PlanHandler) ListPlans(c *gin.Context) {
	plans, err := h.planService.ListPlans(c.Request.Context())
	if err != nil {
		h.handleError(c, err)
		return
	}
	c.JSON(http.StatusOK, NewSuccessResponse(plans, string(i18n.ActionSuccessful)))
}

func (h *PlanHandler) UpdatePlan(c *gin.Context) {
	planID, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		h.handleError(c, app_error.NewInvalidInputError(err.Error()))
		return
	}
	var req updatePlanRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		h.handleError(c, app_error.NewInvalidInputError(err.Error()))
		return
	}

	plan, err := h.planService.UpdatePlan(c.Request.Context(), planID, req.Name, req.Price, req.UserLimit, req.ApiLimit, req.Status)
	if err != nil {
		h.handleError(c, err)
		return
	}

	c.JSON(http.StatusOK, NewSuccessResponse(plan, string(i18n.ActionSuccessful)))
}

func (h *PlanHandler) DeletePlan(c *gin.Context) {
	planID, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		h.handleError(c, app_error.NewInvalidInputError(err.Error()))
		return
	}
	if err := h.planService.DeletePlan(c.Request.Context(), planID); err != nil {
		h.handleError(c, err)
		return
	}
	c.JSON(http.StatusOK, NewSuccessResponse(nil, string(i18n.ActionSuccessful)))
}

func (h *PlanHandler) handleError(c *gin.Context, err error) {
	if appErr, ok := err.(*app_error.AppError); ok {
		response := NewErrorResponse(appErr.Message, string(appErr.Code), nil)
		c.JSON(appErr.GetStatusCode(), response)
	} else {
		response := NewErrorResponse(string(i18n.InternalServerError), string(app_error.CodeInternalError), err.Error())
		c.JSON(http.StatusInternalServerError, response)
	}
}
