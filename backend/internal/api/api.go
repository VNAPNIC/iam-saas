package api

import (
	v1 "iam-saas/internal/api/v1"
	"iam-saas/internal/domain"
	"iam-saas/internal/handler"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

// NewApi nhận các service đã được khởi tạo
func NewApi(
	tokenService domain.TokenService,
	userService domain.UserService,
	roleService domain.RoleService,
	tenantService domain.TenantService,
	planService domain.PlanService,
	requestService domain.RequestService,
	policyService domain.PolicyService,
	ssoService domain.SsoService,
	accessKeyService domain.AccessKeyService,
	webhookService domain.WebhookService,
	ticketService domain.TicketService,
	auditLogService domain.AuditLogService,
	notificationService domain.NotificationService,
	subscriptionService domain.SubscriptionService,
	alertService domain.AlertService,
) *gin.Engine {
	r := gin.Default()

	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:3000"},
		AllowMethods:     []string{"GET", "POST", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization", "X-Tenant-Key"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))

	// Khởi tạo Handlers
	userHandler := handler.NewUserHandler(userService, tenantService)
	roleHandler := handler.NewRoleHandler(roleService, tenantService)
	tenantHandler := handler.NewTenantHandler(tenantService)
	planHandler := handler.NewPlanHandler(planService)
	requestHandler := handler.NewRequestHandler(requestService, tenantService)
	policyHandler := handler.NewPolicyHandler(policyService)
	ssoHandler := handler.NewSsoHandler(ssoService, tenantService)
	accessKeyHandler := handler.NewAccessKeyHandler(accessKeyService)
	webhookHandler := handler.NewWebhookHandler(webhookService, tenantService)
	ticketHandler := handler.NewTicketHandler(ticketService, tenantService)
	auditLogHandler := handler.NewAuditLogHandler(auditLogService)
	subscriptionHandler := handler.NewSubscriptionHandler(subscriptionService, tenantService)
	alertHandler := handler.NewAlertHandler(alertService)

	api := r.Group("/api")

	v1.RegisterRoutes(api,
		userHandler,
		roleHandler,
		tenantHandler,
		planHandler,
		requestHandler,
		policyHandler,
		ssoHandler,
		accessKeyHandler,
		webhookHandler,
		ticketHandler,
		auditLogHandler,
		subscriptionHandler,
		alertHandler,
		tokenService,
		tenantService,
		roleService,
	)

	return r
}
