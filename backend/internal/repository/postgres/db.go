package postgres

import (
	"fmt"
	"iam-saas/internal/config"
	"log"

	// Import domain models here
	// "iam-saas/internal/domain"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

func NewDB(cfg *config.DatabaseConfig) (*gorm.DB, error) {
	dsn := fmt.Sprintf("host=%s user=%s password=%s dbname=%s port=%s sslmode=%s",
		cfg.Host, cfg.User, cfg.Password, cfg.DBName, cfg.Port, cfg.SSLMode)

	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{
		Logger: logger.Default.LogMode(logger.Info),
	})

	if err != nil {
		return nil, fmt.Errorf("failed to connect to database: %w", err)
	}

	// GORM's AutoMigrate is useful for initial setup and development.
	// In production, it's better to use a dedicated migration tool.
	log.Println("Running GORM AutoMigration...")
	err = db.AutoMigrate(
	// Add domain models here for auto-migration, e.g.,
	// &domain.User{},
	// &domain.Tenant{},
	// &domain.Plan{},
	// &domain.Role{},
	// &domain.Permission{},
	)
	if err != nil {
		return nil, fmt.Errorf("gorm automigration failed: %w", err)
	}
	log.Println("✅ GORM AutoMigration completed.")

	return db, nil
}
