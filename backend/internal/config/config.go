package config

import (
	"fmt"

	"github.com/spf13/viper"
)

type Config struct {
	Server   ServerConfig
	Database DatabaseConfig
	JWT      JWTConfig
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
	SecretKey          string `mapstructure:"secret_key"`
	AccessTokenExpiry  int    `mapstructure:"access_token_expiry"`
	RefreshTokenExpiry int    `mapstructure:"refresh_token_expiry"`
}

func LoadConfig() (*Config, error) {
	viper.SetConfigName("config")
	viper.SetConfigType("yml")
	viper.AddConfigPath("./backend")
	viper.AddConfigPath(".")
	viper.AutomaticEnv()

	// Bind environment variables
	// Viper will give precedence to environment variables over config file values
	if err := viper.BindEnv("database.password", "DATABASE_PASSWORD"); err != nil {
		return nil, fmt.Errorf("failed to bind env var database.password: %w", err)
	}
	if err := viper.BindEnv("jwt.secret_key", "JWT_SECRET_KEY"); err != nil {
		return nil, fmt.Errorf("failed to bind env var jwt.secret_key: %w", err)
	}

	if err := viper.ReadInConfig(); err != nil {
		// If the config file is not found, it's okay if all required values are set by env vars
		if _, ok := err.(viper.ConfigFileNotFoundError); !ok {
			return nil, err
		}
	}

	var cfg Config
	if err := viper.Unmarshal(&cfg); err != nil {
		return nil, fmt.Errorf("unable to decode into struct, %v", err)
	}

	// Validate essential config
	if cfg.JWT.SecretKey == "" {
		return nil, fmt.Errorf("JWT_SECRET_KEY is not set")
	}

	return &cfg, nil
}
