package main

import (
	"fmt"
	"iam-saas/internal/api"
	"iam-saas/internal/config"
	"iam-saas/internal/repository/postgres"
	"iam-saas/internal/service"
	"log"

	"github.com/golang-migrate/migrate/v4"
	_ "github.com/golang-migrate/migrate/v4/database/postgres"
	_ "github.com/golang-migrate/migrate/v4/source/file"
)

func main() {
	// Load Configuration
	cfg, err := config.LoadConfig()
	if err != nil {
		log.Fatalf("❌ could not load config: %v", err)
	}
	log.Println("✅ Configuration loaded successfully.")

	// Run Database Migrations
	if err := runMigrations(cfg); err != nil {
		log.Fatalf("❌ could not run database migrations: %v", err)
	}
	log.Println("✅ Database migrations completed successfully.")

	// Initialize Database Connection
	db, err := postgres.NewDB(&cfg.Database)
	if err != nil {
		log.Fatalf("❌ could not connect to database: %v", err)
	}
	log.Println("✅ Database connection successful.")

	// Initialize Repositories (Tầng dữ liệu)
	userRepo := postgres.NewuserRepository(db)
	tenantRepo := postgres.NewtenantRepository(db)
	roleRepo := postgres.NewRoleRepository(db)
	permissionRepo := postgres.NewPermissionRepository(db)

	// Initialize Services (Tầng nghiệp vụ)
	userService := service.NewUserService(db, userRepo, tenantRepo)
	roleService := service.NewRoleService(db, roleRepo, permissionRepo)

	// Initialize API (Tầng giao tiếp)
	router := api.NewApi(userService, roleService)
	log.Println("✅ API router initialized.")

	// Start Server
	serverAddr := fmt.Sprintf(":%s", cfg.Server.Port)
	log.Printf("🚀 Starting server on http://localhost%s", serverAddr)
	if err := router.Run(serverAddr); err != nil {
		log.Fatalf("❌ could not start server: %v", err)
	}
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