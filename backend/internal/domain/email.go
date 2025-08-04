package domain

// EmailService defines the contract for sending emails
type EmailService interface {
	SendVerificationEmail(email, token string) error
	SendPasswordResetEmail(email, token string) error
	SendInvitationEmail(email, token, inviterName, tenantName string) error
}