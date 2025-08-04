package v1

import (
	"iam-saas/internal/domain"
	"iam-saas/internal/handler"
	"iam-saas/internal/middleware"

	"github.com/gin-gonic/gin"
)

// RegisterTenantIAMRoutes đăng ký các routes cho HỆ THỐNG 2: Dịch vụ IAM của Tenant
// Các routes này phục vụ End-User và Client Application tại domain.xyz/[tenant_domain_path]/
func RegisterTenantIAMRoutes(
	api *gin.RouterGroup,
	userHandler *handler.UserHandler,
	tenantHandler *handler.TenantHandler,
	tokenService domain.TokenService,
	tenantService domain.TenantService,
) {
	// Middleware để extract tenant từ path
	tenantMiddleware := middleware.TenantPathMiddleware(tenantService)

	// Group cho tenant IAM routes: /api/v1/iam/:tenant_path
	tenantIAM := api.Group("/iam/:tenant_path")
	tenantIAM.Use(tenantMiddleware)

	// OAuth2/OIDC endpoints cho Client Applications
	oauth := tenantIAM.Group("/oauth")
	{
		oauth.GET("/authorize", userHandler.AuthorizeEndpoint)     // Authorization Code Flow
		oauth.POST("/token", userHandler.TokenEndpoint)           // Token exchange
		oauth.GET("/userinfo", userHandler.UserinfoEndpoint)      // User info endpoint
		oauth.GET("/.well-known/openid_configuration", userHandler.OpenIDConfiguration) // OIDC discovery
		oauth.GET("/jwks", userHandler.JWKSEndpoint)              // JSON Web Key Set
	}

	// Authentication endpoints cho End-Users
	auth := tenantIAM.Group("/auth")
	{
		auth.POST("/login", userHandler.TenantLogin)              // End-User login
		auth.POST("/signup", userHandler.TenantSignup)            // End-User signup (nếu được phép)
		auth.POST("/forgot-password", userHandler.ForgotPassword) // Password reset
		auth.POST("/reset-password", userHandler.ResetPassword)   // Password reset confirmation
		auth.POST("/verify-email", userHandler.VerifyEmailToken)  // Email verification
		auth.POST("/resend-verification", userHandler.ResendVerification) // Resend verification email
		// auth.POST("/logout", userHandler.TenantLogout)            // End-User logout - TODO: Implement
		auth.POST("/refresh", userHandler.RefreshToken)           // Token refresh
	}

	// MFA endpoints
	mfa := tenantIAM.Group("/mfa")
	{
		mfa.POST("/enable", userHandler.EnableMFA)                // Setup MFA
		mfa.POST("/verify", userHandler.VerifyMFA)                // Verify MFA token
		mfa.POST("/disable", userHandler.DisableMFA)              // Disable MFA
	}

	// SSO endpoints - Implementation pending
	// sso := tenantIAM.Group("/sso")
	// {
	// 	sso.GET("/login/:provider", userHandler.SSOLogin)         // Initiate SSO login
	// 	sso.GET("/callback/:provider", userHandler.SSOCallback)   // SSO callback
	// }
	// Note: SSO implementation requires additional service layer work

	// Public endpoints (không cần authentication)
	public := tenantIAM.Group("/public")
	{
		public.GET("/config", tenantHandler.GetTenantPublicConfig) // Tenant branding config
		public.GET("/policies", tenantHandler.GetTenantPolicies)   // Public policies (password requirements, etc.)
	}
}