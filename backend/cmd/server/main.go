package main

import (
	"context"
	"fmt"
	"iam-saas/internal/api"
	"iam-saas/internal/config"
	"iam-saas/internal/domain"
	"iam-saas/internal/events"
	"iam-saas/internal/repository/postgres"
	"iam-saas/internal/service"
	"iam-saas/pkg/utils"
	"log"
	"os"
	"os/signal"
	"syscall"
	"time"

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
		log.Fatalf("Could not load config: %v", err)
	}
	log.Println("Configuration loaded successfully.")

	// Configure JWT
	utils.ConfigureJWT(cfg.JWT.SecretKey, cfg.JWT.AccessTokenExpiry, cfg.JWT.RefreshTokenExpiry)
	log.Println("JWT configured successfully.")

	// Run Database Migrations
	if err := runMigrations(cfg); err != nil {
		log.Fatalf("Could not run database migrations: %v", err)
	}
	log.Println("Database migrations completed successfully.")

	// Initialize Database Connection
	db, err := postgres.NewDB(&cfg.Database)
	if err != nil {
		log.Fatalf("Could not connect to database: %v", err)
	}
	log.Println("Database connection successful.")

	// Build Dependencies
	router := buildDependencies(db, cfg)
	log.Println("Dependencies built and API router initialized.")

	// Start Server
	serverAddr := fmt.Sprintf(":%s", cfg.Server.Port)
	log.Printf("Starting server on http://localhost%s", serverAddr)

	// Start server in a goroutine
	go func() {
		if err := router.Run(serverAddr); err != nil {
			log.Fatalf("Could not start server: %v", err)
		}
	}()

	// Wait for interrupt signal to gracefully shutdown the server
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit
	log.Println("Shutting down server...")

	// Gracefully shutdown the server with a timeout of 5 seconds
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	// In a real implementation you would close the server here
	// For now we'll just log that shutdown is complete
	<-ctx.Done()
	log.Println("Server exited")
}

func buildDependencies(db *gorm.DB, cfg *config.Config) *gin.Engine {
	// Initialize Repositories
	userRepo := postgres.NewuserRepository(db)
	tenantRepo := postgres.NewTenantRepository(db)
	roleRepo := postgres.NewRoleRepository(db)
	planRepo := postgres.NewPlanRepository(db)
	requestRepo := postgres.NewRequestRepository(db) // Uncomment this variable
	policyRepo := postgres.NewPolicyRepository(db)   // Uncomment this variable
	ssoRepo := postgres.NewSsoRepository(db)
	accessKeyRepo := postgres.NewAccessKeyRepository(db)
	webhookRepo := postgres.NewWebhookRepository(db)
	ticketRepo := postgres.NewTicketRepository(db)
	auditLogRepo := postgres.NewAuditLogRepository(db)
	alertRepo := postgres.NewAlertRepository(db)
	tokenRepo := postgres.NewTokenRepository(db)
	subscriptionRepo := postgres.NewSubscriptionRepository(db)

	// Initialize Email Service based on configuration
	var emailService domain.EmailService
	switch cfg.Email.Provider {
	case "ses":
		sesEmailService, err := utils.NewSESEmailService(
			cfg.Email.SESSender,
			cfg.Email.SESRegion,
			cfg.Email.SESEndpoint,
			cfg.Email.Disabled,
		)
		if err != nil {
			log.Fatalf("Failed to initialize SES email service: %v", err)
		}
		emailService = sesEmailService
	default:
		// Default to console email service for development
		emailService = &utils.EmailService{}
	}

	// Initialize Event Bus
	eventBus := events.NewEventBus() // Create event bus

	// Initialize Services
	tokenService := service.NewTokenService(tokenRepo, userRepo)
	userService := service.NewUserService(db, userRepo, tenantRepo, tokenService, &service.EmailServiceFactory{})
	roleService := service.NewRoleService(db, roleRepo)
	tenantService := service.NewTenantService(db, tenantRepo, eventBus)
	planService := service.NewPlanService(db, planRepo)
	requestService := service.NewRequestService(db, requestRepo, tenantRepo, userRepo)
	policyService := service.NewPolicyService(db, policyRepo)
	ssoService := service.NewSsoService(db, ssoRepo, eventBus)
	accessKeyService := service.NewAccessKeyService(db, accessKeyRepo)
	webhookService := service.NewWebhookService(db, webhookRepo, eventBus)
	ticketService := service.NewTicketService(db, ticketRepo)
	auditLogService := service.NewAuditLogService(db, auditLogRepo)
	alertService := service.NewAlertService(db, alertRepo)
	eventLogger := service.NewEventLogger(auditLogService, alertService)
	notificationService := service.NewNotificationService()
	subscriptionService := service.NewSubscriptionService(db, subscriptionRepo)

	// Initialize API
	r := api.NewApi(
		db,
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
		eventLogger,
		emailService,
		notificationService,
		subscriptionService,
		alertService,
	)

	return r
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
