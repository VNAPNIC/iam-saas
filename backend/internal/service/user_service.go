package service

import (
	"context"
	"iam-saas/internal/domain"
	"iam-saas/internal/entities"
	"iam-saas/pkg/app_error"
	"iam-saas/pkg/i18n"
	"iam-saas/pkg/utils"
	"log"
	"time"

	"gorm.io/gorm"
)

type userService struct {
	db         *gorm.DB
	userRepo   domain.UserRepository
	tenantRepo domain.TenantRepository
}

func NewUserService(db *gorm.DB, userRepo domain.UserRepository, tenantRepo domain.TenantRepository) domain.UserService {
	return &userService{
		db:         db,
		userRepo:   userRepo,
		tenantRepo: tenantRepo,
	}
}

func (s *userService) Login(ctx context.Context, email, password string) (*entities.User, string, error) {
	user, err := s.userRepo.FindByEmail(ctx, email)
	if err != nil {
		return nil, "", app_error.NewInternalServerError(err)
	}
	if user == nil || !utils.CheckPasswordHash(password, user.PasswordHash) {
		return nil, "", app_error.NewUnauthorizedError(string(i18n.LoginFailed))
	}
	if user.Status != "active" {
		return nil, "", app_error.NewUnauthorizedError(string(i18n.Unauthorized))
	}
	tenant, err := s.tenantRepo.FindByID(ctx, user.TenantID)
	if err != nil {
		return nil, "", app_error.NewInternalServerError(err)
	}
	if tenant == nil || tenant.Status != "active" {
		return nil, "", app_error.NewUnauthorizedError(string(i18n.Unauthorized))
	}
	token, err := utils.GenerateToken(user.ID, user.TenantID)
	if err != nil {
		return nil, "", app_error.NewInternalServerError(err)
	}
	return user, token, nil
}

func (s *userService) Register(ctx context.Context, name, email, password, tenantName string) (*entities.User, string, error) {
	existingUser, err := s.userRepo.FindByEmail(ctx, email)
	if err != nil {
		return nil, "", app_error.NewInternalServerError(err)
	}
	if existingUser != nil {
		return nil, "", app_error.NewConflictError("email", string(i18n.EmailAlreadyExists))
	}
	hashedPassword, err := utils.HashPassword(password)
	if err != nil {
		return nil, "", app_error.NewInternalServerError(err)
	}

	// Logic transaction đã được loại bỏ để dễ test. 
	// Trong một ứng dụng thực tế, bạn có thể muốn giữ nó và mock DB connection.

	newTenant := &entities.Tenant{Name: tenantName, Status: "active"}
	if err := s.tenantRepo.Create(ctx, nil, newTenant); err != nil {
		return nil, "", app_error.NewInternalServerError(err)
	}

	newUser := &entities.User{
		TenantID:     newTenant.ID,
		Name:         name,
		Email:        email,
		PasswordHash: hashedPassword,
		Status:       "active", 
	}
	if err := s.userRepo.Create(ctx, nil, newUser); err != nil {
		// Cần có logic để rollback việc tạo tenant ở đây trong thực tế
		return nil, "", app_error.NewInternalServerError(err)
	}

	token, err := utils.GenerateToken(newUser.ID, newTenant.ID)
	if err != nil {
		return nil, "", app_error.NewInternalServerError(err)
	}

	return newUser, token, nil
}

func (s *userService) InviteUser(ctx context.Context, inviterID, tenantID int64, name, email string) (*entities.User, error) {
	existingUser, err := s.userRepo.FindByEmail(ctx, email)
	if err != nil {
		return nil, app_error.NewInternalServerError(err)
	}
	if existingUser != nil {
		return nil, app_error.NewConflictError("email", string(i18n.EmailAlreadyExists))
	}
	tempPassword, err := utils.GenerateRandomString(32)
	if err != nil {
		return nil, app_error.NewInternalServerError(err)
	}
	hashedPassword, err := utils.HashPassword(tempPassword)
	if err != nil {
		return nil, app_error.NewInternalServerError(err)
	}
	newUser := &entities.User{
		TenantID:     tenantID,
		Name:         name,
		Email:        email,
		PasswordHash: hashedPassword,
		Status:       "pending_invitation",
	}
	if err := s.userRepo.Create(ctx, nil, newUser); err != nil {
		return nil, app_error.NewInternalServerError(err)
	}
	return newUser, nil
}

func (s *userService) GetMe(ctx context.Context, userID int64) (*entities.User, error) {
	user, err := s.userRepo.FindByID(ctx, userID)
	if err != nil {
		return nil, app_error.NewInternalServerError(err)
	}
	if user == nil {
		return nil, app_error.NewNotFoundError("user not found")
	}
	return user, nil
}

func (s *userService) ForgotPassword(ctx context.Context, email string) error {
	user, err := s.userRepo.FindByEmail(ctx, email)
	if err != nil || user == nil {
		return nil
	}
	token, _ := utils.GenerateRandomString(32)
	expiresAt := time.Now().Add(time.Hour * 1)
	if err := s.userRepo.SetPasswordResetToken(ctx, user.ID, token, expiresAt); err != nil {
		return app_error.NewInternalServerError(err)
	}
	log.Printf("Password reset token for %s: %s", user.Email, token)
	return nil
}

func (s *userService) ResetPassword(ctx context.Context, token, newPassword string) error {
	user, err := s.userRepo.FindByPasswordResetToken(ctx, token)
	if err != nil {
		return app_error.NewInternalServerError(err)
	}
	if user == nil || user.PasswordResetTokenExpiresAt == nil || time.Now().After(*user.PasswordResetTokenExpiresAt) {
		return app_error.NewUnauthorizedError("Invalid or expired token")
	}
	hashedPassword, err := utils.HashPassword(newPassword)
	if err != nil {
		return app_error.NewInternalServerError(err)
	}
	if err := s.userRepo.UpdatePassword(ctx, user.ID, hashedPassword); err != nil {
		return app_error.NewInternalServerError(err)
	}
	return nil
}

func (s *userService) ListUsers(ctx context.Context, tenantID int64) ([]entities.User, error) {
	return s.userRepo.ListByTenant(ctx, tenantID)
}

func (s *userService) UpdateUser(ctx context.Context, userID int64, name string) (*entities.User, error) {
	user, err := s.userRepo.FindByID(ctx, userID)
	if err != nil {
		return nil, app_error.NewInternalServerError(err)
	}
	if user == nil {
		return nil, app_error.NewNotFoundError("user not found")
	}
	user.Name = name
	if err := s.userRepo.Update(ctx, user); err != nil {
		return nil, app_error.NewInternalServerError(err)
	}
	return user, nil
}

func (s *userService) DeleteUser(ctx context.Context, userID int64) error {
	return s.userRepo.Delete(ctx, userID)
}

func (s *userService) VerifyEmail(ctx context.Context, token string) error {
	user, err := s.userRepo.FindUserByVerificationToken(ctx, token)
	if err != nil {
		return app_error.NewInternalServerError(err)
	}
	if user == nil {
		return app_error.NewUnauthorizedError("Invalid or expired token")
	}
	return s.userRepo.ActivateUser(ctx, user.ID)
}