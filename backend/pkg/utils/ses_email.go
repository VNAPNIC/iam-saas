package utils

import (
	"context"
	"fmt"
	"log"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/service/sesv2"
	"github.com/aws/aws-sdk-go-v2/service/sesv2/types"
)

// SESEmailService implements the email.Service interface using AWS SES
type SESEmailService struct {
	client   *sesv2.Client
	sender   string
	region   string
	endpoint string
	disabled bool
}

// NewSESEmailService creates a new SES email service
func NewSESEmailService(sender, region, endpoint string, disabled bool) (*SESEmailService, error) {
	if disabled {
		log.Println("AWS SES email service is disabled. Emails will be logged to console.")
		return &SESEmailService{disabled: true}, nil
	}

	// Load AWS configuration
	cfg, err := config.LoadDefaultConfig(context.Background(), config.WithRegion(region))
	if err != nil {
		return nil, fmt.Errorf("unable to load AWS SDK config: %w", err)
	}

	// Create SES client
	var client *sesv2.Client
	if endpoint != "" {
		//nolint:staticcheck // Using deprecated AWS API for compatibility
		client = sesv2.New(sesv2.Options{
			Region: region,
			EndpointResolver: sesv2.EndpointResolverFunc(func(region string, options sesv2.EndpointResolverOptions) (aws.Endpoint, error) {
				//nolint:staticcheck // Using deprecated AWS API for compatibility
				return aws.Endpoint{URL: endpoint}, nil
			}),
		})
	} else {
		client = sesv2.NewFromConfig(cfg)
	}

	return &SESEmailService{
		client:   client,
		sender:   sender,
		region:   region,
		endpoint: endpoint,
	}, nil
}

// SendVerificationEmail sends a verification email using AWS SES
func (s *SESEmailService) SendVerificationEmail(email, token string) error {
	if s.disabled {
		log.Printf("[EMAIL] Verification email would be sent to %s with token: %s", email, token)
		return nil
	}

	verificationLink := fmt.Sprintf("http://localhost:3000/verify-email?token=%s", token)
	subject := "Verify Your Email Address"
	htmlBody := fmt.Sprintf(`
		<html>
			<body>
				<h2>Email Verification</h2>
				<p>Please click the link below to verify your email address:</p>
				<a href="%s">Verify Email</a>
				<p>If you didn't request this, please ignore this email.</p>
			</body>
		</html>
	`, verificationLink)

	input := &sesv2.SendEmailInput{
		FromEmailAddress: aws.String(s.sender),
		Destination: &types.Destination{
			ToAddresses: []string{email},
		},
		Content: &types.EmailContent{
			Simple: &types.Message{
				Subject: &types.Content{
					Data: aws.String(subject),
				},
				Body: &types.Body{
					Html: &types.Content{
						Data: aws.String(htmlBody),
					},
				},
			},
		},
	}

	_, err := s.client.SendEmail(context.Background(), input)
	if err != nil {
		return fmt.Errorf("failed to send verification email: %w", err)
	}

	log.Printf("Verification email sent to %s", email)
	return nil
}

// SendPasswordResetEmail sends a password reset email using AWS SES
func (s *SESEmailService) SendPasswordResetEmail(email, token string) error {
	if s.disabled {
		log.Printf("[EMAIL] Password reset email would be sent to %s with token: %s", email, token)
		return nil
	}

	resetLink := fmt.Sprintf("http://localhost:3000/reset-password?token=%s", token)
	subject := "Password Reset Request"
	htmlBody := fmt.Sprintf(`
		<html>
			<body>
				<h2>Password Reset</h2>
				<p>You requested a password reset. Click the link below to reset your password:</p>
				<a href="%s">Reset Password</a>
				<p>This link will expire in 1 hour.</p>
				<p>If you didn't request this, please ignore this email.</p>
			</body>
		</html>
	`, resetLink)

	input := &sesv2.SendEmailInput{
		FromEmailAddress: aws.String(s.sender),
		Destination: &types.Destination{
			ToAddresses: []string{email},
		},
		Content: &types.EmailContent{
			Simple: &types.Message{
				Subject: &types.Content{
					Data: aws.String(subject),
				},
				Body: &types.Body{
					Html: &types.Content{
						Data: aws.String(htmlBody),
					},
				},
			},
		},
	}

	_, err := s.client.SendEmail(context.Background(), input)
	if err != nil {
		return fmt.Errorf("failed to send password reset email: %w", err)
	}

	log.Printf("Password reset email sent to %s", email)
	return nil
}

// SendInvitationEmail sends an invitation email using AWS SES
func (s *SESEmailService) SendInvitationEmail(email, token, inviterName, tenantName string) error {
	if s.disabled {
		log.Printf("[EMAIL] Invitation email would be sent to %s from %s for tenant %s with token: %s", email, inviterName, tenantName, token)
		return nil
	}

	invitationLink := fmt.Sprintf("http://localhost:3000/accept-invitation?token=%s", token)
	subject := fmt.Sprintf("You've been invited to join %s", tenantName)
	htmlBody := fmt.Sprintf(`
		<html>
			<body>
				<h2>Invitation to Join %s</h2>
				<p>%s has invited you to join their organization on our platform.</p>
				<p>Click the link below to accept the invitation:</p>
				<a href="%s">Accept Invitation</a>
				<p>If you didn't expect this invitation, please ignore this email.</p>
			</body>
		</html>
	`, tenantName, inviterName, invitationLink)

	input := &sesv2.SendEmailInput{
		FromEmailAddress: aws.String(s.sender),
		Destination: &types.Destination{
			ToAddresses: []string{email},
		},
		Content: &types.EmailContent{
			Simple: &types.Message{
				Subject: &types.Content{
					Data: aws.String(subject),
				},
				Body: &types.Body{
					Html: &types.Content{
						Data: aws.String(htmlBody),
					},
				},
			},
		},
	}

	_, err := s.client.SendEmail(context.Background(), input)
	if err != nil {
		return fmt.Errorf("failed to send invitation email: %w", err)
	}

	log.Printf("Invitation email sent to %s", email)
	return nil
}
