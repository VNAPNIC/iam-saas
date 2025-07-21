package main

import (
	"fmt"
	"iam-saas/internal/api"
	"iam-saas/internal/config"
	"iam-saas/internal/repository/postgres"
	"iam-saas/internal/service"
	"log"
)

func main() {
	// Load Configuration
	cfg, err := config.LoadConfig()
	if err != nil {
		log.Fatalf("❌ could not load config: %v", err)
	}
	log.Println("✅ Configuration loaded successfully.")

	// Initialize Database Connection
	db, err := postgres.NewDB(&cfg.Database)
	if err != nil {
		log.Fatalf("❌ could not connect to database: %v", err)
	}
	log.Println("✅ Database connection successful.")

	// Initialize Repositories (Tầng dữ liệu)
	userRepo := postgres.NewPostgresUserRepository(db)
	tenantRepo := postgres.NewPostgresTenantRepository(db)

	// Initialize Services (Tầng nghiệp vụ)
	userService := service.NewUserService(db, userRepo, tenantRepo)

	// Initialize API (Tầng giao tiếp)
	router := api.NewApi(userService)
	log.Println("✅ API router initialized.")

	// Start Server
	serverAddr := fmt.Sprintf(":%s", cfg.Server.Port)
	log.Printf("🚀 Starting server on http://localhost%s", serverAddr)
	if err := router.Run(serverAddr); err != nil {
		log.Fatalf("❌ could not start server: %v", err)
	}
}
