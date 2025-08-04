package handler

import (
	"fmt"
	"iam-saas/internal/domain"
	"iam-saas/internal/entities"
	"iam-saas/pkg/app_error"
	"iam-saas/pkg/i18n"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

type TenantHandler struct {
	tenantService domain.TenantService
}

func NewTenantHandler(tenantService domain.TenantService) *TenantHandler {
	return &TenantHandler{tenantService: tenantService}
}

// UpdatePasswordPolicyRequest represents the request payload for updating password policy
type UpdatePasswordPolicyRequest struct {
	Policy map[string]interface{} `json:"policy" binding:"required"`
}

// UpdateEmailSettingsRequest represents the request payload for updating email settings
type UpdateEmailSettingsRequest struct {
	Provider string                 `json:"provider" binding:"required"`
	Config   map[string]interface{} `json:"config" binding:"required"`
}

// UpdateDomainRequest represents the request payload for updating tenant domain
type UpdateDomainRequest struct {
	Domain string `json:"domain" binding:"required"`
}

// VerifyDomainRequest represents the request payload for verifying tenant domain
type VerifyDomainRequest struct {
	Method string `json:"method" binding:"required"` // "dns" or "file"
}

type createTenantRequest struct {
	Name   string `json:"name" binding:"required"`
	Domain string `json:"domain" binding:"required"`
}

func (h *TenantHandler) CreateTenant(c *gin.Context) {
	var req createTenantRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		h.handleError(c, app_error.NewInvalidInputError(err.Error()))
		return
	}
	tenant, err := h.tenantService.CreateTenant(c.Request.Context(), req.Name, req.Domain)
	if err != nil {
		h.handleError(c, err)
		return
	}
	c.JSON(http.StatusCreated, NewSuccessResponse(tenant, string(i18n.ActionSuccessful)))
}

func (h *TenantHandler) ListTenants(c *gin.Context) {
	tenantKeyVal, _ := c.Get(TenantContextKey)
	tenantKey := tenantKeyVal.(string)
	_, err := h.tenantService.GetTenantConfig(c.Request.Context(), tenantKey)
	if err != nil {
		h.handleError(c, err)
		return
	}
	tenants, err := h.tenantService.ListTenants(c.Request.Context())
	if err != nil {
		h.handleError(c, err)
		return
	}
	c.JSON(http.StatusOK, NewSuccessResponse(tenants, string(i18n.ActionSuccessful)))
}

func (h *TenantHandler) GetCurrentTenant(c *gin.Context) {
	tenantKeyVal, _ := c.Get(TenantContextKey)
	tenantKey := tenantKeyVal.(string)
	tenant, err := h.tenantService.GetTenantConfig(c.Request.Context(), tenantKey)
	if err != nil {
		h.handleError(c, err)
		return
	}
	c.JSON(http.StatusOK, NewSuccessResponse(tenant, string(i18n.ActionSuccessful)))
}

func (h *TenantHandler) UpdateCurrentTenant(c *gin.Context) {
	var req updateTenantRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		h.handleError(c, app_error.NewInvalidInputError(err.Error()))
		return
	}
	tenantKeyVal, _ := c.Get(TenantContextKey)
	tenantKey := tenantKeyVal.(string)
	tenant, err := h.tenantService.GetTenantConfig(c.Request.Context(), tenantKey)
	if err != nil {
		h.handleError(c, err)
		return
	}

	// Update tenant name if provided
	if req.Name != nil {
		tenant, err = h.tenantService.UpdateTenantName(c.Request.Context(), tenant.ID, *req.Name)
		if err != nil {
			h.handleError(c, err)
			return
		}
	}

	// Update other branding settings
	tenant, err = h.tenantService.UpdateTenantBranding(c.Request.Context(), tenant.ID, req.LogoURL, req.PrimaryColor, req.AllowPublicSignup)
	if err != nil {
		h.handleError(c, err)
		return
	}
	c.JSON(http.StatusOK, NewSuccessResponse(tenant, string(i18n.ActionSuccessful)))
}

func (h *TenantHandler) GetTenantDetails(c *gin.Context) {
	// Check if it's a by-domain request (public API)
	domain := c.Query("domain")
	if domain != "" {
		// Public API: get tenant by domain
		tenant, err := h.tenantService.GetTenantConfig(c.Request.Context(), domain)
		if err != nil {
			h.handleError(c, err)
			return
		}
		c.JSON(http.StatusOK, NewSuccessResponse(tenant, string(i18n.ActionSuccessful)))
		return
	}

	// Admin API: get tenant by ID
	tenantID, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		h.handleError(c, app_error.NewInvalidInputError(err.Error()))
		return
	}
	tenant, err := h.tenantService.GetTenantDetails(c.Request.Context(), tenantID)
	if err != nil {
		h.handleError(c, err)
		return
	}
	c.JSON(http.StatusOK, NewSuccessResponse(tenant, string(i18n.ActionSuccessful)))
}

func (h *TenantHandler) SuspendTenant(c *gin.Context) {
	tenantID, err := strconv.ParseInt(c.Param("tenantId"), 10, 64)
	if err != nil {
		h.handleError(c, app_error.NewInvalidInputError(err.Error()))
		return
	}
	if err := h.tenantService.SuspendTenant(c.Request.Context(), tenantID); err != nil {
		h.handleError(c, err)
		return
	}
	c.JSON(http.StatusOK, NewSuccessResponse(nil, string(i18n.ActionSuccessful)))
}

func (h *TenantHandler) DeleteTenant(c *gin.Context) {
	tenantID, err := strconv.ParseInt(c.Param("tenantId"), 10, 64)
	if err != nil {
		h.handleError(c, app_error.NewInvalidInputError(err.Error()))
		return
	}
	tenantKeyVal, _ := c.Get(TenantContextKey)
	tenantKey := tenantKeyVal.(string)
	tenant, err := h.tenantService.GetTenantConfig(c.Request.Context(), tenantKey)
	if err != nil {
		h.handleError(c, err)
		return
	}
	if tenant.ID != tenantID {
		h.handleError(c, app_error.NewUnauthorizedError(string(i18n.Unauthorized)))
		return
	}
	if err := h.tenantService.DeleteTenant(c.Request.Context(), tenantID); err != nil {
		h.handleError(c, err)
		return
	}
	c.JSON(http.StatusOK, NewSuccessResponse(nil, string(i18n.ActionSuccessful)))
}

// UpdateEmailSettings updates the email settings for a tenant
func (h *TenantHandler) UpdateEmailSettings(c *gin.Context) {
	// Parse tenant ID from URL parameter
	tenantID, err := strconv.ParseInt(c.Param("tenantId"), 10, 64)
	if err != nil {
		h.handleError(c, app_error.NewInvalidInputError(err.Error()))
		return
	}

	// Parse request body
	var req UpdateEmailSettingsRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		h.handleError(c, app_error.NewInvalidInputError(err.Error()))
		return
	}

	// Verify that the authenticated user belongs to this tenant
	claims, err := GetAuthPayload(c)
	if err != nil {
		h.handleError(c, app_error.NewUnauthorizedError("Authentication required"))
		return
	}

	if claims.TenantID != tenantID {
		h.handleError(c, app_error.NewForbiddenError("Access denied"))
		return
	}

	// Update email settings
	tenant, err := h.tenantService.UpdateEmailSettings(c.Request.Context(), tenantID, req.Provider, req.Config)
	if err != nil {
		h.handleError(c, err)
		return
	}

	c.JSON(http.StatusOK, NewSuccessResponse(tenant, string(i18n.ActionSuccessful)))
}

// UpdatePasswordPolicy updates the password policy for a tenant
func (h *TenantHandler) UpdatePasswordPolicy(c *gin.Context) {
	// Parse tenant ID from URL parameter
	tenantID, err := strconv.ParseInt(c.Param("tenantId"), 10, 64)
	if err != nil {
		h.handleError(c, app_error.NewInvalidInputError(err.Error()))
		return
	}

	// Parse request body
	var req UpdatePasswordPolicyRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		h.handleError(c, app_error.NewInvalidInputError(err.Error()))
		return
	}

	// Verify that the authenticated user belongs to this tenant
	claims, err := GetAuthPayload(c)
	if err != nil {
		h.handleError(c, app_error.NewUnauthorizedError("Authentication required"))
		return
	}

	if claims.TenantID != tenantID {
		h.handleError(c, app_error.NewForbiddenError("Access denied"))
		return
	}

	// Update password policy
	tenant, err := h.tenantService.UpdatePasswordPolicy(c.Request.Context(), tenantID, req.Policy)
	if err != nil {
		h.handleError(c, err)
		return
	}

	c.JSON(http.StatusOK, NewSuccessResponse(tenant, string(i18n.ActionSuccessful)))
}

// UpdateDomain updates the domain for a tenant
func (h *TenantHandler) UpdateDomain(c *gin.Context) {
	// Parse tenant ID from URL parameter
	tenantID, err := strconv.ParseInt(c.Param("tenantId"), 10, 64)
	if err != nil {
		h.handleError(c, app_error.NewInvalidInputError(err.Error()))
		return
	}

	// Parse request body
	var req UpdateDomainRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		h.handleError(c, app_error.NewInvalidInputError(err.Error()))
		return
	}

	// Verify that the authenticated user belongs to this tenant
	claims, err := GetAuthPayload(c)
	if err != nil {
		h.handleError(c, app_error.NewUnauthorizedError("Authentication required"))
		return
	}

	if claims.TenantID != tenantID {
		h.handleError(c, app_error.NewForbiddenError("Access denied"))
		return
	}

	// Update domain
	tenant, err := h.tenantService.UpdateDomain(c.Request.Context(), tenantID, req.Domain)
	if err != nil {
		h.handleError(c, err)
		return
	}

	c.JSON(http.StatusOK, NewSuccessResponse(tenant, string(i18n.ActionSuccessful)))
}

// VerifyDomain verifies the domain ownership for a tenant
func (h *TenantHandler) VerifyDomain(c *gin.Context) {
	// Parse tenant ID from URL parameter
	tenantID, err := strconv.ParseInt(c.Param("tenantId"), 10, 64)
	if err != nil {
		h.handleError(c, app_error.NewInvalidInputError(err.Error()))
		return
	}

	// Parse request body
	var req VerifyDomainRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		h.handleError(c, app_error.NewInvalidInputError(err.Error()))
		return
	}

	// Verify that the authenticated user belongs to this tenant
	claims, err := GetAuthPayload(c)
	if err != nil {
		h.handleError(c, app_error.NewUnauthorizedError("Authentication required"))
		return
	}

	if claims.TenantID != tenantID {
		h.handleError(c, app_error.NewForbiddenError("Access denied"))
		return
	}

	// Verify domain
	tenant, err := h.tenantService.VerifyDomain(c.Request.Context(), tenantID, req.Method)
	if err != nil {
		h.handleError(c, err)
		return
	}

	c.JSON(http.StatusOK, NewSuccessResponse(tenant, string(i18n.ActionSuccessful)))
}

func (h *TenantHandler) UpdateTenant(c *gin.Context) {
	tenantID, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		h.handleError(c, app_error.NewInvalidInputError(err.Error()))
		return
	}
	var req updateTenantRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		h.handleError(c, app_error.NewInvalidInputError(err.Error()))
		return
	}

	tenant, err := h.tenantService.UpdateTenant(c.Request.Context(), tenantID, req.Name, req.LogoURL, req.PrimaryColor, &req.AllowPublicSignup)
	if err != nil {
		h.handleError(c, err)
		return
	}
	c.JSON(http.StatusOK, NewSuccessResponse(tenant, string(i18n.ActionSuccessful)))
}

func (h *TenantHandler) handleError(c *gin.Context, err error) {
	if appErr, ok := err.(*app_error.AppError); ok {
		response := NewErrorResponse(appErr.Message, string(appErr.Code), nil)
		c.JSON(appErr.GetStatusCode(), response)
	} else {
		response := NewErrorResponse(string(i18n.InternalServerError), string(app_error.CodeInternalError), err.Error())
		c.JSON(http.StatusInternalServerError, response)
	}
}

// HỆ THỐNG 2: Public endpoints cho Tenant IAM

// GetTenantPublicConfig returns public configuration for tenant branding
func (h *TenantHandler) GetTenantPublicConfig(c *gin.Context) {
	// Get tenant from context (set by TenantPathMiddleware)
	tenantInterface, exists := c.Get("tenant")
	if !exists {
		c.JSON(http.StatusBadRequest, gin.H{"error": "tenant not found"})
		return
	}

	// Type assertion to get tenant entity
	tenant := tenantInterface.(*entities.Tenant)

	config := gin.H{
		"key":               tenant.Key,
		"name":              tenant.Name,
		"logoURL":           tenant.LogoURL,
		"primaryColor":      tenant.PrimaryColor,
		"allowPublicSignup": tenant.AllowPublicSignup,
		"ssoEnabled":        false, // Will be implemented later
	}

	c.JSON(http.StatusOK, NewSuccessResponse(config, string(i18n.ActionSuccessful)))
}

// GetTenantPolicies returns public policies for tenant
func (h *TenantHandler) GetTenantPolicies(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{
		"allowPublicSignup": true,
		"mfaRequired":       false,
		"passwordPolicy": gin.H{
			"minLength":          8,
			"requireUppercase":   true,
			"requireLowercase":   true,
			"requireNumbers":     true,
			"requireSpecialChars": false,
		},
	})
}

// HỆ THỐNG 1: Tenant Admin onboarding endpoints

// GetOnboardingStatus checks if tenant admin has completed onboarding
func (h *TenantHandler) GetOnboardingStatus(c *gin.Context) {
	// Get tenant from auth middleware
	tenantID, exists := c.Get("tenant_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "tenant not found"})
		return
	}

	// Get tenant to check onboarding status
	tenant, err := h.tenantService.GetTenantConfig(c.Request.Context(), fmt.Sprintf("%d", tenantID))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to get tenant"})
		return
	}

	// For now, assume onboarding is not completed (will be implemented in service layer)
	c.JSON(http.StatusOK, gin.H{
		"completed": false, // tenant.IsOnboarded when implemented
		"tenant_id": tenant.ID,
	})
}

// UpdateTenantBrandingOnboarding updates tenant branding during onboarding
func (h *TenantHandler) UpdateTenantBrandingOnboarding(c *gin.Context) {
	tenantID, exists := c.Get("tenant_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "tenant not found"})
		return
	}

	// Parse multipart form
	err := c.Request.ParseMultipartForm(10 << 20) // 10 MB max
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "failed to parse form"})
		return
	}

	primaryColor := c.PostForm("primaryColor")

	var logoURL *string
	
	// Handle logo upload if present
	file, header, err := c.Request.FormFile("logo")
	if err == nil {
		defer file.Close()
		
		// Upload to storage service (placeholder implementation)
		// In production, this would upload to S3/CloudStorage
		logoURLValue := "/uploads/logos/" + header.Filename
		logoURL = &logoURLValue
		
		// TODO: Implement actual file upload to S3/storage service
		// Example: logoURLValue, err := h.storageService.UploadFile(file, "logos/")
		// if err != nil {
		//     c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to upload logo"})
		//     return
		// }
	}

	// Update tenant branding
	_, err = h.tenantService.UpdateTenantBranding(c.Request.Context(), 
		tenantID.(int64), logoURL, &primaryColor, false)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to update branding"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "branding updated successfully"})
}

// UpdateTenantSettings updates tenant settings during onboarding
func (h *TenantHandler) UpdateTenantSettings(c *gin.Context) {
	tenantID, exists := c.Get("tenant_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "tenant not found"})
		return
	}

	var req struct {
		AllowPublicSignup bool   `json:"allowPublicSignup"`
		MfaRequired       bool   `json:"mfaRequired"`
		DefaultLanguage   string `json:"defaultLanguage"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Update tenant settings
	_, err := h.tenantService.UpdateTenantBranding(c.Request.Context(),
		tenantID.(int64), nil, nil, req.AllowPublicSignup)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to update settings"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "settings updated successfully"})
}

// CompleteOnboarding marks tenant onboarding as completed
func (h *TenantHandler) CompleteOnboarding(c *gin.Context) {
	// Get tenant ID from context
	tenantID, exists := c.Get("tenant_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "tenant not found"})
		return
	}

	// Mark onboarding as completed
	err := h.tenantService.CompleteOnboarding(c.Request.Context(), tenantID.(int64))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to complete onboarding"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "onboarding completed successfully"})
}
