package service

import (
	"context"
	"iam-saas/internal/domain"
	"iam-saas/internal/entities"
	"iam-saas/pkg/app_error"
	"iam-saas/pkg/i18n"
	"iam-saas/pkg/utils"

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

func (s *userService) Register(ctx context.Context, name, email, password, tenantName string) (*entities.User, error) {
	existingUser, err := s.userRepo.FindByEmail(ctx, email)
	if err != nil {
		return nil, app_error.NewInternalServerError(err)
	}
	if existingUser != nil {
		return nil, app_error.NewConflictError("email", string(i18n.EmailAlreadyExists))
	}
	hashedPassword, err := utils.HashPassword(password)
	if err != nil {
		return nil, app_error.NewInternalServerError(err)
	}
	tx := s.db.Begin()
	if tx.Error != nil {
		return nil, app_error.NewInternalServerError(tx.Error)
	}
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
			panic(r)
		} else if tx.Error != nil {
			tx.Rollback()
		}
	}()
	newTenant := &entities.Tenant{Name: tenantName}
	if err := s.tenantRepo.Create(ctx, tx, newTenant); err != nil {
		return nil, app_error.NewInternalServerError(err)
	}
	newUser := &entities.User{
		TenantID:     newTenant.ID,
		Name:         name,
		Email:        email,
		PasswordHash: hashedPassword,
		Status:       "pending_verification",
	}
	if err := s.userRepo.Create(ctx, tx, newUser); err != nil {
		return nil, app_error.NewInternalServerError(err)
	}
	if err := tx.Commit().Error; err != nil {
		return nil, app_error.NewInternalServerError(err)
	}
	return newUser, nil
}

func (s *userService) InviteUser(ctx context.Context, inviterID, tenantID int64, name, email string) (*entities.User, error) {
	// 1. Kiểm tra xem email được mời đã tồn tại trong hệ thống chưa.
	// Trong một hệ thống phức tạp hơn, ta có thể cho phép một email tồn tại ở nhiều tenant,
	// nhưng hiện tại, ta giữ cho logic đơn giản: mỗi email là duy nhất.
	existingUser, err := s.userRepo.FindByEmail(ctx, email)
	if err != nil {
		return nil, app_error.NewInternalServerError(err)
	}
	if existingUser != nil {
		return nil, app_error.NewConflictError("email", string(i18n.EmailAlreadyExists))
	}

	// 2. Trong luồng mời, người dùng sẽ tự đặt mật khẩu qua link email.
	tempPassword, err := utils.GenerateRandomString(32)
	if err != nil {
		return nil, app_error.NewInternalServerError(err)
	}
	hashedPassword, err := utils.HashPassword(tempPassword)
	if err != nil {
		return nil, app_error.NewInternalServerError(err)
	}

	// 3. Tạo bản ghi người dùng mới với trạng thái đặc biệt 'pending_invitation'.
	newUser := &entities.User{
		TenantID:     tenantID, // Lấy tenant ID từ người đã mời (qua JWT)
		Name:         name,
		Email:        email,
		PasswordHash: hashedPassword,
		Status:       "pending_invitation",
	}

	// 4. Lưu người dùng mới vào CSDL.
	if err := s.userRepo.Create(ctx, nil, newUser); err != nil {
		return nil, app_error.NewInternalServerError(err)
	}

	// 5. TODO: Gửi email chứa link mời đến cho người dùng mới.
	// Ví dụ: go s.notificationService.SendInvitationEmail(newUser)

	return newUser, nil
}
