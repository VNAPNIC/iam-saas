package config

import (
	"fmt"

	"github.com/spf13/viper"
)

type Config struct {
	Server   ServerConfig
	Database DatabaseConfig
	JWT      JWTConfig
	Email    EmailConfig
}

type ServerConfig struct {
	Port string
	Mode string
}

type DatabaseConfig struct {
	Host     string
	Port     string
	User     string
	Password string
	DBName   string
	SSLMode  string
}

type JWTConfig struct {
	SecretKey            string
	AccessTokenExpiry   int
	RefreshTokenExpiry  int
}

type EmailConfig struct {
	Provider   string // "ses" or "console"
	SESSender  string
	SESRegion  string
	SESEndpoint string
	Disabled   bool
}

// LoadConfig loads configuration from environment variables and config files
func LoadConfig() (*Config, error) {
	viper.SetConfigName("config")
	viper.SetConfigType("yaml")
	viper.AddConfigPath(".")
	viper.AddConfigPath("./config")
	viper.AddConfigPath("../config")
	viper.AddConfigPath("../../config")
	viper.AutomaticEnv()

	// Server configuration
	viper.SetDefault("SERVER_PORT", "8080")
	viper.SetDefault("SERVER_MODE", "development")

	// Database configuration
	viper.SetDefault("DB_HOST", "localhost")
	viper.SetDefault("DB_PORT", "5432")
	viper.SetDefault("DB_USER", "postgres")
	viper.SetDefault("DB_PASSWORD", "postgres")
	viper.SetDefault("DB_NAME", "iam_saas")
	viper.SetDefault("DB_SSLMODE", "disable")

	// JWT configuration
	viper.SetDefault("JWT_SECRET_KEY", "your-super-secret-jwt-key-change-in-production")
	viper.SetDefault("JWT_ACCESS_TOKEN_EXPIRY", 15)    // 15 minutes
	viper.SetDefault("JWT_REFRESH_TOKEN_EXPIRY", 1440) // 24 hours

	// Email configuration
	viper.SetDefault("EMAIL_PROVIDER", "console") // Default to console for local development
	viper.SetDefault("EMAIL_SES_SENDER", "noreply@example.com")
	viper.SetDefault("EMAIL_SES_REGION", "us-east-1")
	viper.SetDefault("EMAIL_SES_ENDPOINT", "")
	viper.SetDefault("EMAIL_DISABLED", false)

	if err := viper.ReadInConfig(); err != nil {
		if _, ok := err.(viper.ConfigFileNotFoundError); !ok {
			return nil, fmt.Errorf("error reading config file: %w", err)
		}
	}

	var cfg Config
	if err := viper.Unmarshal(&cfg); err != nil {
		return nil, fmt.Errorf("unable to decode into struct: %w", err)
	}

	return &cfg, nil
}
