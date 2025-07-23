package v1

import (
	"iam-saas/internal/handler"

	"github.com/gin-gonic/gin"
)

// RegisterSuperAdminRoutes đăng ký các API chỉ dành cho Super Admin.
func RegisterSuperAdminRoutes(rg *gin.RouterGroup, tenantHandler *handler.TenantHandler, planHandler *handler.PlanHandler, requestHandler *handler.RequestHandler, ticketHandler *handler.TicketHandler) {
	rg.GET("/tenants", tenantHandler.ListTenants)
	rg.GET("/tenants/:tenantId", tenantHandler.GetTenantDetails)
	rg.PUT("/tenants/:tenantId/suspend", tenantHandler.SuspendTenant)
	rg.DELETE("/tenants/:tenantId", tenantHandler.DeleteTenant)

	rg.POST("/plans", planHandler.CreatePlan)
	rg.GET("/plans", planHandler.ListPlans)
	rg.GET("/plans/:id", planHandler.GetPlan)
	rg.PUT("/plans/:id", planHandler.UpdatePlan)
	rg.DELETE("/plans/:id", planHandler.DeletePlan)

	rg.GET("/requests/tenant", requestHandler.ListTenantRequests)
	rg.GET("/requests/quota", requestHandler.ListQuotaRequests)
	rg.POST("/requests/:id/approve", requestHandler.ApproveRequest)
	rg.POST("/requests/:id/deny", requestHandler.DenyRequest)

	rg.GET("/tickets", ticketHandler.ListTickets)
	rg.GET("/tickets/:id", ticketHandler.GetTicket)
	rg.PUT("/tickets/:id/status", ticketHandler.UpdateTicketStatus)
	rg.POST("/tickets/:id/reply", ticketHandler.ReplyToTicket)
}
