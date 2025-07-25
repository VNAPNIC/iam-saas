package domain

import (
	"context"
)

type NotificationService interface {
	SendEmail(ctx context.Context, recipient, subject, body string) error
}
