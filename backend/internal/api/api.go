package api

import (
	v1 "iam-saas/internal/api/v1"
	"iam-saas/internal/domain"
	"iam-saas/internal/handler"
	"iam-saas/internal/repository/postgres"
	"iam-saas/internal/service"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// NewApi nhận các service đã được khởi tạo
func NewApi(
	db *gorm.DB,
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
	eventLogger *service.EventLogger,
	emailService domain.EmailService,
	notificationService domain.NotificationService,
	subscriptionService domain.SubscriptionService,
	alertService domain.AlertService,
) *gin.Engine {
	r := gin.Default()

	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:3000", "http://127.0.0.1:3000"},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization", "X-Tenant-Key", "X-Tenant-Domain", "Accept", "User-Agent", "Referer", "sec-ch-ua", "sec-ch-ua-mobile", "sec-ch-ua-platform"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))

	// Khởi tạo Handlers
	userHandler := handler.NewUserHandler(userService, tenantService, eventLogger, emailService)
	roleHandler := handler.NewRoleHandler(roleService, tenantService)
	tenantHandler := handler.NewTenantHandler(tenantService)
	planHandler := handler.NewPlanHandler(planService)
	requestHandler := handler.NewRequestHandler(requestService, tenantService)
	policyHandler := handler.NewPolicyHandler(policyService)
	ssoHandler := handler.NewSsoHandler(ssoService, tenantService)
	accessKeyHandler := handler.NewAccessKeyHandler(accessKeyService)
	webhookHandler := handler.NewWebhookHandler(webhookService, tenantService)
	ticketHandler := handler.NewTicketHandler(ticketService)
	auditLogHandler := handler.NewAuditLogHandler(auditLogService)
	subscriptionHandler := handler.NewSubscriptionHandler(subscriptionService, tenantService)
	alertHandler := handler.NewAlertHandler(alertService)

	api := r.Group("/api")

	// Create integration handler
	integrationRepo := postgres.NewIntegrationRepository(db)
	siemForwarder := service.NewSIEMForwarder()
	integrationService := service.NewIntegrationService(db, integrationRepo, siemForwarder)
	integrationHandler := handler.NewIntegrationHandler(integrationService)

	// Create service role and session handlers
	serviceRoleRepo := postgres.NewServiceRoleRepository(db)
	serviceRoleService := service.NewServiceRoleService(db, serviceRoleRepo)
	serviceRoleHandler := handler.NewServiceRoleHandler(serviceRoleService, tenantService)

	sessionRepo := postgres.NewSessionRepository(db)
	// Create userRepo for session service
	userRepo := postgres.NewuserRepository(db)
	sessionService := service.NewSessionService(db, sessionRepo, userRepo)
	sessionHandler := handler.NewSessionHandler(sessionService, tenantService)

	v1.RegisterRoutes(api, userHandler, roleHandler, tenantHandler, planHandler, requestHandler, policyHandler, ssoHandler, accessKeyHandler, webhookHandler, ticketHandler, auditLogHandler, subscriptionHandler, alertHandler, integrationHandler, serviceRoleHandler, sessionHandler, tokenService, tenantService, roleService)

	return r
}
