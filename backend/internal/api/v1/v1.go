package v1

import (
	"iam-saas/internal/domain"
	"iam-saas/internal/handler"

	"github.com/gin-gonic/gin"
)

func RegisterRoutes(
	api *gin.RouterGroup,
	userHandler *handler.UserHandler,
	roleHandler *handler.RoleHandler,
	tenantHandler *handler.TenantHandler,
	planHandler *handler.PlanHandler,
	requestHandler *handler.RequestHandler,
	policyHandler *handler.PolicyHandler,
	ssoHandler *handler.SsoHandler,
	accessKeyHandler *handler.AccessKeyHandler,
	webhookHandler *handler.WebhookHandler,
	ticketHandler *handler.TicketHandler,
	auditLogHandler *handler.AuditLogHandler,
	subscriptionHandler *handler.SubscriptionHandler,
	alertHandler *handler.AlertHandler,
	integrationHandler *handler.IntegrationHandler,
	serviceRoleHandler *handler.ServiceRoleHandler,
	sessionHandler *handler.SessionHandler,
	tokenService domain.TokenService,
	tenantService domain.TenantService,
	roleService domain.RoleService,
) {
	v1 := api.Group("/v1")

	// HỆ THỐNG 1: Nền tảng SaaS Lõi
	// Routes cho Tenant Admin và Super Admin
	RegisterPublicRoutes(v1, userHandler, tenantHandler)
	RegisterProtectedRoutes(v1, userHandler, roleHandler, tenantHandler, planHandler, requestHandler, policyHandler, ssoHandler, accessKeyHandler, webhookHandler, ticketHandler, auditLogHandler, subscriptionHandler, alertHandler, integrationHandler, serviceRoleHandler, sessionHandler, tokenService, tenantService, roleService)
	RegisterSuperAdminRoutes(v1, tenantHandler, planHandler, tokenService, roleService)

	// HỆ THỐNG 2: Dịch vụ IAM của Tenant
	// Routes cho End-User và Client Application
	RegisterTenantIAMRoutes(v1, userHandler, tenantHandler, tokenService, tenantService)
}
