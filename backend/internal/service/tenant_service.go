package service

import (
	"context"
	"fmt"
	"iam-saas/internal/domain"
	"iam-saas/internal/entities"
	"iam-saas/internal/events"
	"iam-saas/pkg/app_error"
	"iam-saas/pkg/i18n"
	"strings"

	"gorm.io/gorm"
)

type tenantService struct {
	db         *gorm.DB
	tenantRepo domain.TenantRepository
	eventBus   *events.EventBus
}

func NewTenantService(db *gorm.DB, tenantRepo domain.TenantRepository, eventBus *events.EventBus) domain.TenantService {
	return &tenantService{db, tenantRepo, eventBus}
}

func (s *tenantService) CreateTenant(ctx context.Context, name, domain string) (*entities.Tenant, error) {
	// Check if a tenant with the given domain already exists
	existingTenant, err := s.tenantRepo.FindByDomain(ctx, domain)
	if err != nil {
		return nil, app_error.NewInternalServerError(err)
	}
	if existingTenant != nil {
		return nil, app_error.NewConflictError("domain", string(i18n.TenantDomainAlreadyExists))
	}

	newTenant := &entities.Tenant{
		Name:   name,
		Domain: domain,
		Status: "active", // New tenants are active by default
	}

	if err := s.tenantRepo.Create(ctx, nil, newTenant); err != nil {
		return nil, app_error.NewInternalServerError(err)
	}

	return newTenant, nil
}

func (s *tenantService) GetTenantConfig(ctx context.Context, keyOrDomain string) (*entities.Tenant, error) {
	// First try to find by key (for tenant path routing)
	tenant, err := s.tenantRepo.FindByKey(ctx, keyOrDomain)
	if err != nil {
		return nil, app_error.NewInternalServerError(err)
	}
	if tenant != nil {
		return tenant, nil
	}
	
	// If not found by key, try by domain (for backward compatibility)
	tenant, err = s.tenantRepo.FindByDomain(ctx, keyOrDomain)
	if err != nil {
		return nil, app_error.NewInternalServerError(err)
	}
	if tenant == nil {
		return nil, app_error.NewNotFoundError(string(i18n.TenantNotFound))
	}
	return tenant, nil
}

func (s *tenantService) UpdateTenantBranding(ctx context.Context, tenantID int64, logoURL, primaryColor *string, allowPublicSignup bool) (*entities.Tenant, error) {
	tenant, err := s.tenantRepo.FindByID(ctx, tenantID)
	if err != nil {
		return nil, app_error.NewInternalServerError(err)
	}
	if tenant == nil {
		return nil, app_error.NewNotFoundError(string(i18n.TenantNotFound))
	}

	tenant.LogoURL = logoURL
	tenant.PrimaryColor = primaryColor
	tenant.AllowPublicSignup = allowPublicSignup
	tenant.IsOnboarded = true // Mark as onboarded after branding update

	if err := s.tenantRepo.UpdateBranding(ctx, tenant); err != nil {
		return nil, app_error.NewInternalServerError(err)
	}

	// Publish real-time event for branding update
	if s.eventBus != nil {
		eventData := map[string]interface{}{
			"tenant_id":            tenant.ID,
			"logo_url":            tenant.LogoURL,
			"primary_color":       tenant.PrimaryColor,
			"allow_public_signup": tenant.AllowPublicSignup,
			"is_onboarded":        tenant.IsOnboarded,
		}
		_ = s.eventBus.Publish(events.Event{
			Type:     events.EventTenantBrandingUpdated,
			TenantID: fmt.Sprintf("%d", tenant.ID),
			Data:     eventData,
		})
	}

	return tenant, nil
}

func (s *tenantService) UpdateTenantName(ctx context.Context, tenantID int64, name string) (*entities.Tenant, error) {
	tenant, err := s.tenantRepo.FindByID(ctx, tenantID)
	if err != nil {
		return nil, app_error.NewInternalServerError(err)
	}
	if tenant == nil {
		return nil, app_error.NewNotFoundError(string(i18n.TenantNotFound))
	}

	updatedTenant, err := s.tenantRepo.UpdateTenantName(ctx, tenantID, name)
	if err != nil {
		return nil, app_error.NewInternalServerError(err)
	}

	return updatedTenant, nil
}

func (s *tenantService) ListTenants(ctx context.Context) ([]entities.Tenant, error) {
	// In a real application, you might filter tenants by some criteria or only allow super admin to list all.
	return s.tenantRepo.ListTenants(ctx)
}

// UpdateEmailSettings updates the email settings for a tenant
func (s *tenantService) UpdateEmailSettings(ctx context.Context, tenantID int64, provider string, config map[string]interface{}) (*entities.Tenant, error) {
	// Validate provider
	validProviders := map[string]bool{
		"ses":     true,
		"smtp":    true,
		"console": true,
	}
	
	if !validProviders[provider] {
		return nil, app_error.NewInvalidInputError(fmt.Sprintf("Invalid email provider: %s", provider))
	}
	
	// Validate configuration based on provider
	if err := s.validateEmailConfig(provider, config); err != nil {
		return nil, app_error.NewInvalidInputError(err.Error())
	}
	
	// Get the tenant
	tenant, err := s.tenantRepo.FindByID(ctx, tenantID)
	if err != nil {
		return nil, app_error.NewInternalServerError(err)
	}
	if tenant == nil {
		return nil, app_error.NewNotFoundError("tenant not found")
	}
	
	// Update email settings
	tenant.EmailProvider = provider
	tenant.EmailConfig = config
	
	if err := s.tenantRepo.UpdateEmailSettings(ctx, tenant); err != nil {
		return nil, app_error.NewInternalServerError(err)
	}
	
	// Publish real-time event for email settings update
	if s.eventBus != nil {
		eventData := map[string]interface{}{
			"tenant_id":      tenant.ID,
			"email_provider": tenant.EmailProvider,
			"email_config":   tenant.EmailConfig,
		}
		_ = s.eventBus.Publish(events.Event{
			Type:     events.EventTenantEmailSettingsUpdated,
			TenantID: fmt.Sprintf("%d", tenant.ID),
			Data:     eventData,
		})
	}
	
	return tenant, nil
}

// validateEmailConfig validates the email configuration based on the provider
func (s *tenantService) validateEmailConfig(provider string, config map[string]interface{}) error {
	switch provider {
	case "ses":
		// Validate required fields for SES
		if _, ok := config["region"]; !ok {
			return fmt.Errorf("region is required for SES provider")
		}
		if _, ok := config["accessKeyId"]; !ok {
			return fmt.Errorf("accessKeyId is required for SES provider")
		}
		if _, ok := config["secretAccessKey"]; !ok {
			return fmt.Errorf("secretAccessKey is required for SES provider")
		}
		if _, ok := config["senderEmail"]; !ok {
			return fmt.Errorf("senderEmail is required for SES provider")
		}
	case "smtp":
		// Validate required fields for SMTP
		if _, ok := config["host"]; !ok {
			return fmt.Errorf("host is required for SMTP provider")
		}
		if _, ok := config["port"]; !ok {
			return fmt.Errorf("port is required for SMTP provider")
		}
		if _, ok := config["username"]; !ok {
			return fmt.Errorf("username is required for SMTP provider")
		}
		if _, ok := config["password"]; !ok {
			return fmt.Errorf("password is required for SMTP provider")
		}
		if _, ok := config["senderEmail"]; !ok {
			return fmt.Errorf("senderEmail is required for SMTP provider")
		}
	case "console":
		// No validation needed for console provider
	}
	
	return nil
}

func (s *tenantService) GetTenantDetails(ctx context.Context, tenantID int64) (*entities.Tenant, error) {
	tenant, err := s.tenantRepo.FindByID(ctx, tenantID)
	if err != nil {
		return nil, app_error.NewInternalServerError(err)
	}
	if tenant == nil {
		return nil, app_error.NewNotFoundError("tenant not found")
	}
	return tenant, nil
}

func (s *tenantService) GetTenantByDomain(ctx context.Context, domain string) (*entities.Tenant, error) {
	tenant, err := s.tenantRepo.FindByDomain(ctx, domain)
	if err != nil {
		return nil, app_error.NewInternalServerError(err)
	}
	if tenant == nil {
		return nil, app_error.NewNotFoundError("tenant not found")
	}
	return tenant, nil
}

func (s *tenantService) SuspendTenant(ctx context.Context, tenantID int64) error {
	return s.tenantRepo.SuspendTenant(ctx, tenantID)
}

func (s *tenantService) DeleteTenant(ctx context.Context, tenantID int64) error {
	tenant, err := s.tenantRepo.FindByID(ctx, tenantID)
	if err != nil {
		return app_error.NewInternalServerError(err)
	}
	if tenant == nil {
		return app_error.NewNotFoundError("tenant not found")
	}
	
	return s.tenantRepo.Delete(ctx, tenantID)
}

// UpdateDomain updates the domain for a tenant
func (s *tenantService) UpdateDomain(ctx context.Context, tenantID int64, domain string) (*entities.Tenant, error) {
	// Validate domain format
	if domain == "" {
		return nil, app_error.NewInvalidInputError("Domain is required")
	}
	
	// Basic domain format validation (this is a simplified version)
	if !isValidDomain(domain) {
		return nil, app_error.NewInvalidInputError("Invalid domain format")
	}
	
	// Check if domain is already used by another tenant
	existingTenant, err := s.tenantRepo.FindByDomain(ctx, domain)
	if err != nil {
		return nil, app_error.NewInternalServerError(err)
	}
	if existingTenant != nil && existingTenant.ID != tenantID {
		return nil, app_error.NewConflictError("domain", "Domain is already in use by another tenant")
	}
	
	// Get the tenant
	tenant, err := s.tenantRepo.FindByID(ctx, tenantID)
	if err != nil {
		return nil, app_error.NewInternalServerError(err)
	}
	if tenant == nil {
		return nil, app_error.NewNotFoundError("tenant not found")
	}
	
	// Update domain (set as not verified yet)
	tenant.Domain = domain
	tenant.DomainVerified = false
	
	if err := s.tenantRepo.UpdateDomain(ctx, tenant); err != nil {
		return nil, app_error.NewInternalServerError(err)
	}
	
	// Publish real-time event for domain update
	if s.eventBus != nil {
		eventData := map[string]interface{}{
			"tenant_id":       tenant.ID,
			"domain":          tenant.Domain,
			"domain_verified": tenant.DomainVerified,
		}
		_ = s.eventBus.Publish(events.Event{
			Type:     events.EventTenantDomainUpdated,
			TenantID: fmt.Sprintf("%d", tenant.ID),
			Data:     eventData,
		})
	}
	
	return tenant, nil
}

// VerifyDomain verifies the domain ownership using either DNS or file verification
func (s *tenantService) VerifyDomain(ctx context.Context, tenantID int64, verificationMethod string) (*entities.Tenant, error) {
	// Get the tenant
	tenant, err := s.tenantRepo.FindByID(ctx, tenantID)
	if err != nil {
		return nil, app_error.NewInternalServerError(err)
	}
	if tenant == nil {
		return nil, app_error.NewNotFoundError("tenant not found")
	}
	
	if tenant.Domain == "" {
		return nil, app_error.NewInvalidInputError("Tenant does not have a domain configured")
	}
	
	// Perform verification based on method
	switch verificationMethod {
	case "dns":
		// In a real implementation, you would check for a specific DNS record
		// For now, we'll just simulate a successful verification
		// In practice, you might check for a TXT record with a specific value
		// Example: _iam-verification.{domain} TXT "verify-{tenant-id}"
		// For this example, we'll assume verification is successful
		if err := s.tenantRepo.VerifyDomain(ctx, tenantID); err != nil {
			return nil, app_error.NewInternalServerError(err)
		}
		tenant.DomainVerified = true
	case "file":
		// In a real implementation, you would check for a specific file at a specific location
		// For now, we'll just simulate a successful verification
		// Example: http://{domain}/iam-verify.txt containing "verify-{tenant-id}"
		// For this example, we'll assume verification is successful
		if err := s.tenantRepo.VerifyDomain(ctx, tenantID); err != nil {
			return nil, app_error.NewInternalServerError(err)
		}
		tenant.DomainVerified = true
	default:
		return nil, app_error.NewInvalidInputError("Invalid verification method. Supported methods: dns, file")
	}
	
	return tenant, nil
}

// isValidDomain performs basic domain format validation
func isValidDomain(domain string) bool {
	// This is a very basic validation, a real implementation would be more comprehensive
	// Check if domain contains at least one dot and doesn't start or end with a dot or hyphen
	if len(domain) < 3 || len(domain) > 253 {
		return false
	}
	
	// Check for valid characters and format
	// This is a simplified check, a full implementation would be more complex
	parts := strings.Split(domain, ".")
	if len(parts) < 2 {
		return false
	}
	
	for _, part := range parts {
		if len(part) == 0 || len(part) > 63 {
			return false
		}
		if part[0] == '-' || part[len(part)-1] == '-' {
			return false
		}
		for _, char := range part {
			if !((char >= 'a' && char <= 'z') || (char >= 'A' && char <= 'Z') || (char >= '0' && char <= '9') || char == '-') {
				return false
			}
		}
	}
	
	return true
}

// UpdatePasswordPolicy updates the password policy for a tenant
func (s *tenantService) UpdatePasswordPolicy(ctx context.Context, tenantID int64, policy map[string]interface{}) (*entities.Tenant, error) {
	// Get the tenant
	tenant, err := s.tenantRepo.FindByID(ctx, tenantID)
	if err != nil {
		return nil, app_error.NewInternalServerError(err)
	}
	if tenant == nil {
		return nil, app_error.NewNotFoundError("tenant not found")
	}
	
	// Validate policy
	if err := s.validatePasswordPolicy(policy); err != nil {
		return nil, app_error.NewInvalidInputError(err.Error())
	}
	
	// Update password policy
	tenant.PasswordPolicy = policy
	
	if err := s.tenantRepo.UpdatePasswordPolicy(ctx, tenant); err != nil {
		return nil, app_error.NewInternalServerError(err)
	}
	
	// Publish real-time event for password policy update
	if s.eventBus != nil {
		eventData := map[string]interface{}{
			"tenant_id":       tenant.ID,
			"password_policy": tenant.PasswordPolicy,
		}
		_ = s.eventBus.Publish(events.Event{
			Type:     events.EventTenantPasswordPolicyUpdated,
			TenantID: fmt.Sprintf("%d", tenant.ID),
			Data:     eventData,
		})
	}
	
	return tenant, nil
}

// validatePasswordPolicy validates the password policy configuration
func (s *tenantService) validatePasswordPolicy(policy map[string]interface{}) error {
	// Validate minLength
	if minLength, ok := policy["minLength"]; ok {
		if minLengthVal, ok := minLength.(float64); ok {
			if minLengthVal < 1 || minLengthVal > 128 {
				return fmt.Errorf("minLength must be between 1 and 128")
			}
		} else {
			return fmt.Errorf("minLength must be a number")
		}
	}
	
	// Validate maxLength
	if maxLength, ok := policy["maxLength"]; ok {
		if maxLengthVal, ok := maxLength.(float64); ok {
			if maxLengthVal < 1 || maxLengthVal > 128 {
				return fmt.Errorf("maxLength must be between 1 and 128")
			}
		} else {
			return fmt.Errorf("maxLength must be a number")
		}
	}
	
	// Validate minLength <= maxLength
	if minLength, ok1 := policy["minLength"]; ok1 {
		if maxLength, ok2 := policy["maxLength"]; ok2 {
			if minLengthVal, ok1 := minLength.(float64); ok1 {
				if maxLengthVal, ok2 := maxLength.(float64); ok2 {
					if minLengthVal > maxLengthVal {
						return fmt.Errorf("minLength cannot be greater than maxLength")
					}
				}
			}
		}
	}
	
	// Validate boolean fields
	boolFields := []string{"requireUppercase", "requireLowercase", "requireNumbers", "requireSpecialChars"}
	for _, field := range boolFields {
		if val, ok := policy[field]; ok {
			if _, ok := val.(bool); !ok {
				return fmt.Errorf("%s must be a boolean", field)
			}
		}
	}
	
	// Validate specialChars
	if specialChars, ok := policy["specialChars"]; ok {
		if _, ok := specialChars.(string); !ok {
			return fmt.Errorf("specialChars must be a string")
		}
	}
	
	return nil
}

func (s *tenantService) UpdateTenant(ctx context.Context, tenantID int64, name *string, logoURL, primaryColor *string, allowPublicSignup *bool) (*entities.Tenant, error) {
	tenant, err := s.tenantRepo.FindByID(ctx, tenantID)
	if err != nil {
		return nil, app_error.NewInternalServerError(err)
	}
	if tenant == nil {
		return nil, app_error.NewNotFoundError("tenant not found")
	}

	if name != nil {
		tenant.Name = *name
	}
	if logoURL != nil {
		tenant.LogoURL = logoURL
	}
	if primaryColor != nil {
		tenant.PrimaryColor = primaryColor
	}
	if allowPublicSignup != nil {
		tenant.AllowPublicSignup = *allowPublicSignup
	}

	if err := s.tenantRepo.Update(ctx, tenant); err != nil {
		return nil, app_error.NewInternalServerError(err)
	}

	return tenant, nil
}

// CompleteOnboarding marks tenant onboarding as completed
func (s *tenantService) CompleteOnboarding(ctx context.Context, tenantID int64) error {
	// TODO: Implement onboarding completion logic
	// This would typically update an isOnboarded field in the tenant entity
	return nil
}
