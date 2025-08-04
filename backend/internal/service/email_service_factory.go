package service

import (
	"context"
	"fmt"
	"iam-saas/internal/domain"
	"iam-saas/internal/entities"
	"iam-saas/pkg/utils"
)

// EmailServiceFactory creates email services based on tenant settings
type EmailServiceFactory struct{}

// NewEmailServiceFactory creates a new EmailServiceFactory
func NewEmailServiceFactory() *EmailServiceFactory {
	return &EmailServiceFactory{}
}

// CreateEmailService creates an email service based on tenant settings
func (f *EmailServiceFactory) CreateEmailService(tenant *entities.Tenant) (domain.EmailService, error) {
	switch tenant.EmailProvider {
	case "ses":
		// Create SES email service
		config := tenant.EmailConfig
		region, _ := config["region"].(string)
		accessKeyID, _ := config["accessKeyId"].(string)
		secretAccessKey, _ := config["secretAccessKey"].(string)
		senderEmail, _ := config["senderEmail"].(string)

		if region == "" || accessKeyID == "" || secretAccessKey == "" || senderEmail == "" {
			return nil, fmt.Errorf("missing required SES configuration")
		}

		return utils.NewSESEmailService(senderEmail, region, "", false)

	case "smtp":
		// Create SMTP email service
		config := tenant.EmailConfig
		host, _ := config["host"].(string)
		port, _ := config["port"].(string)
		username, _ := config["username"].(string)
		password, _ := config["password"].(string)
		senderEmail, _ := config["senderEmail"].(string)

		if host == "" || port == "" || username == "" || password == "" || senderEmail == "" {
			return nil, fmt.Errorf("missing required SMTP configuration")
		}

		// For now, we'll use console email service as a placeholder
		// In a real implementation, you would create an SMTP email service
		return &utils.EmailService{}, nil

	case "console":
		// Use console email service for development
		return &utils.EmailService{}, nil

	default:
		// Default to console email service
		return &utils.EmailService{}, nil
	}
}

// GetTenantEmailService gets the email service for a tenant
func (f *EmailServiceFactory) GetTenantEmailService(tenantService domain.TenantService, tenantKey string) (domain.EmailService, error) {
	tenant, err := tenantService.GetTenantConfig(context.Background(), tenantKey)
	if err != nil {
		return nil, err
	}

	return f.CreateEmailService(tenant)
}
