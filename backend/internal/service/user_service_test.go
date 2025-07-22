package service_test

import (
	"context"
	"iam-saas/internal/domain"
	"iam-saas/internal/entities"
	"iam-saas/internal/mocks"
	"iam-saas/internal/service"
	"iam-saas/pkg/utils"
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
	"gorm.io/gorm"
)

// Helper function to setup a test with mock repositories
func setupUserServiceTest() (domain.UserService, *mocks.MockUserRepository, *mocks.MockTenantRepository) {
	userRepo := &mocks.MockUserRepository{}
	tenantRepo := &mocks.MockTenantRepository{}
	userService := service.NewUserService(nil, userRepo, tenantRepo)
	return userService, userRepo, tenantRepo
}

func TestUserService_Login(t *testing.T) {
	ctx := context.Background()
	hashedPassword, _ := utils.HashPassword("password123")

	t.Run("Success", func(t *testing.T) {
		userService, userRepo, tenantRepo := setupUserServiceTest()

		expectedUser := &entities.User{
			ID:           1,
			TenantID:     1,
			Email:        "test@example.com",
			PasswordHash: hashedPassword,
			Status:       "active",
		}

		expectedTenant := &entities.Tenant{
			ID:     1,
			Status: "active",
		}

		userRepo.OnFindByEmail = func(ctx context.Context, email string) (*entities.User, error) {
			assert.Equal(t, "test@example.com", email)
			return expectedUser, nil
		}

		tenantRepo.OnFindByID = func(ctx context.Context, id int64) (*entities.Tenant, error) {
			assert.Equal(t, int64(1), id)
			return expectedTenant, nil
		}

		user, token, err := userService.Login(ctx, "test@example.com", "password123")

		assert.NoError(t, err)
		assert.NotNil(t, user)
		assert.NotEmpty(t, token)
		assert.Equal(t, expectedUser.ID, user.ID)
	})

	// ... other login tests
}

func TestUserService_Register(t *testing.T) {
	ctx := context.Background()

	t.Run("Success", func(t *testing.T) {
		userService, userRepo, tenantRepo := setupUserServiceTest()

		userRepo.OnFindByEmail = func(ctx context.Context, email string) (*entities.User, error) {
			return nil, nil
		}

		tenantRepo.OnCreate = func(ctx context.Context, tx *gorm.DB, tenant *entities.Tenant) error {
			tenant.ID = 1
			return nil
		}

		userRepo.OnCreate = func(ctx context.Context, tx *gorm.DB, user *entities.User) error {
			user.ID = 1
			return nil
		}

		user, token, err := userService.Register(ctx, "Test User", "new@example.com", "password123", "Test Tenant")

		assert.NoError(t, err)
		assert.NotNil(t, user)
		assert.NotEmpty(t, token)
	})

	// ... other register tests
}

func TestUserService_ForgotPassword(t *testing.T) {
	ctx := context.Background()

	t.Run("Success - User exists", func(t *testing.T) {
		userService, userRepo, _ := setupUserServiceTest()

		userRepo.OnFindByEmail = func(ctx context.Context, email string) (*entities.User, error) {
			return &entities.User{ID: 1, Email: email}, nil
		}

		var capturedToken string
		var capturedUserID int64
		userRepo.OnSetPasswordResetToken = func(ctx context.Context, userID int64, token string, expiresAt time.Time) error {
			capturedUserID = userID
			capturedToken = token
			return nil
		}

		err := userService.ForgotPassword(ctx, "exists@example.com")

		assert.NoError(t, err)
		assert.Equal(t, int64(1), capturedUserID)
		assert.NotEmpty(t, capturedToken)
	})

	// ... other forgot password tests
}

func TestUserService_ResetPassword(t *testing.T) {
	ctx := context.Background()

	t.Run("Success", func(t *testing.T) {
		userService, userRepo, _ := setupUserServiceTest()

		userRepo.OnFindByPasswordResetToken = func(ctx context.Context, token string) (*entities.User, error) {
			expires := time.Now().Add(time.Hour)
			return &entities.User{ID: 1, PasswordResetTokenExpiresAt: &expires}, nil
		}

		var capturedUserID int64
		userRepo.OnUpdatePassword = func(ctx context.Context, userID int64, newPasswordHash string) error {
			capturedUserID = userID
			return nil
		}

		err := userService.ResetPassword(ctx, "valid_token", "newpassword123")

		assert.NoError(t, err)
		assert.Equal(t, int64(1), capturedUserID)
	})

	// ... other reset password tests
}
