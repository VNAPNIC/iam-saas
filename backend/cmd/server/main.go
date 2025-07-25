package main

import (
	"fmt"
	"iam-saas/internal/api"
	"iam-saas/internal/config"
	"iam-saas/internal/repository/postgres"
	"iam-saas/internal/service"
	"iam-saas/pkg/utils"
	"log"

	"github.com/gin-gonic/gin"
	"github.com/golang-migrate/migrate/v4"
	_ "github.com/golang-migrate/migrate/v4/database/postgres"
	_ "github.com/golang-migrate/migrate/v4/source/file"
	"gorm.io/gorm"
)

func main() {
	// Load Configuration
	cfg, err := config.LoadConfig()
	if err != nil {
		log.Fatalf("could not load config: %v", err)
	}
	log.Println("Configuration loaded successfully.")

	// Configure JWT
	utils.ConfigureJWT(cfg.JWT.SecretKey, cfg.JWT.AccessTokenExpiry, cfg.JWT.RefreshTokenExpiry)
	log.Println("JWT configured successfully.")

	// Run Database Migrations
	if err := runMigrations(cfg); err != nil {
		log.Fatalf("could not run database migrations: %v", err)
	}
	log.Println("Database migrations completed successfully.")

	// Initialize Database Connection
	db, err := postgres.NewDB(&cfg.Database)
	if err != nil {
		log.Fatalf("could not connect to database: %v", err)
	}
	log.Println("Database connection successful.")

	// Build Dependencies
	router := buildDependencies(db, cfg)
	log.Println("Dependencies built and API router initialized.")

	// Start Server
	serverAddr := fmt.Sprintf(":%s", cfg.Server.Port)
	log.Printf("Starting server on http://localhost%s", serverAddr)
	if err := router.Run(serverAddr); err != nil {
		log.Fatalf("could not start server: %v", err)
	}
}

func buildDependencies(db *gorm.DB, cfg *config.Config) *gin.Engine {

	// Initialize Repositories
	userRepo := postgres.NewuserRepository(db)
	tenantRepo := postgres.NewtenantRepository(db)
	roleRepo := postgres.NewRoleRepository(db)
	planRepo := postgres.NewPlanRepository(db)
	requestRepo := postgres.NewRequestRepository(db)
	policyRepo := postgres.NewPolicyRepository(db)
	ssoRepo := postgres.NewSsoRepository(db)
	accessKeyRepo := postgres.NewAccessKeyRepository(db)
	webhookRepo := postgres.NewWebhookRepository(db)
	ticketRepo := postgres.NewTicketRepository(db)
	auditLogRepo := postgres.NewAuditLogRepository(db)
	subscriptionRepo := postgres.NewSubscriptionRepository(db)
	alertRepo := postgres.NewAlertRepository(db)
	tokenRepo := postgres.NewTokenRepository(db)

	// Initialize Services
	tokenService := service.NewTokenService(tokenRepo, userRepo)
	userService := service.NewUserService(db, userRepo, tenantRepo, tokenService)
	roleService := service.NewRoleService(db, roleRepo)
	tenantService := service.NewTenantService(db, tenantRepo)
	planService := service.NewPlanService(db, planRepo)
	requestService := service.NewRequestService(db, requestRepo, tenantRepo, userRepo)
	policyService := service.NewPolicyService(db, policyRepo)
	ssoService := service.NewSsoService(db, ssoRepo)
	accessKeyService := service.NewAccessKeyService(db, accessKeyRepo)
	webhookService := service.NewWebhookService(db, webhookRepo)
	ticketService := service.NewTicketService(db, ticketRepo)
	auditLogService := service.NewAuditLogService(db, auditLogRepo)
	notificationService := service.NewNotificationService()
	subscriptionService := service.NewSubscriptionService(db, subscriptionRepo)
	alertService := service.NewAlertService(db, alertRepo)

	// Initialize API
	return api.NewApi(
		tokenService,
		userService,
		roleService,
		tenantService,
		planService,
		requestService,
		policyService,
		ssoService,
		accessKeyService,
		webhookService,
		ticketService,
		auditLogService,
		notificationService,
		subscriptionService,
		alertService,
	)
}

func runMigrations(cfg *config.Config) error {
	migrationURL := "file://migrations"
	dbURL := fmt.Sprintf("postgres://%s:%s@%s:%s/%s?sslmode=disable",
		cfg.Database.User,
		cfg.Database.Password,
		cfg.Database.Host,
		cfg.Database.Port,
		cfg.Database.DBName,
	)

	m, err := migrate.New(migrationURL, dbURL)
	if err != nil {
		return fmt.Errorf("could not create migrate instance: %w", err)
	}

	if err := m.Up(); err != nil && err != migrate.ErrNoChange {
		return fmt.Errorf("could not apply migrations: %w", err)
	}

	return nil
}
