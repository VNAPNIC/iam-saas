package utils

import (
	"fmt"
	"log"
)

// EmailService implements the email.Service interface for local development
type EmailService struct{}

// SendVerificationEmail sends a verification email (logs to console in development)
func (e *EmailService) SendVerificationEmail(emailAddr, token string) error {
	verificationLink := fmt.Sprintf("http://localhost:3000/verify-email?token=%s", token)
	log.Printf("[EMAIL] Verification email would be sent to %s with link: %s", emailAddr, verificationLink)
	return nil
}

// SendPasswordResetEmail sends a password reset email (logs to console in development)
func (e *EmailService) SendPasswordResetEmail(emailAddr, token string) error {
	resetLink := fmt.Sprintf("http://localhost:3000/reset-password?token=%s", token)
	log.Printf("[EMAIL] Password reset email would be sent to %s with link: %s", emailAddr, resetLink)
	return nil
}

// SendInvitationEmail sends an invitation email (logs to console in development)
func (e *EmailService) SendInvitationEmail(emailAddr, token, inviterName, tenantName string) error {
	invitationLink := fmt.Sprintf("http://localhost:3000/accept-invitation?token=%s", token)
	log.Printf("[EMAIL] Invitation email would be sent to %s from %s for tenant %s with link: %s", emailAddr, inviterName, tenantName, invitationLink)
	return nil
}
