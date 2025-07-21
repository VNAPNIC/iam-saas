// File: backend/internal/domain/user.go

package domain

import (
	"context"
	"iam-saas/internal/entities"

	"gorm.io/gorm"
)

// UserRepository định nghĩa hợp đồng cho tầng repository của User.
type UserRepository interface {
	Create(ctx context.Context, tx *gorm.DB, user *entities.User) error
	FindByEmail(ctx context.Context, email string) (*entities.User, error)
	FindByID(ctx context.Context, id int64) (*entities.User, error)
	UpdateVerificationToken(userID uint, token string) error
	FindUserByVerificationToken(token string) (*entities.User, error)
	ActivateUser(userID uint) error
}

// UserService định nghĩa hợp đồng cho tầng service của User.
type UserService interface {
	Login(ctx context.Context, email, password string) (*entities.User, string, error)
	Register(ctx context.Context, name, email, password, tenantName string) (*entities.User, error)
	InviteUser(ctx context.Context, inviterID, tenantID int64, name, email string) (*entities.User, error)
}
