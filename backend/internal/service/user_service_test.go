package service_test

import (
	"context"
	"errors"
	"iam-saas/internal/domain"
	"iam-saas/internal/entities"
	"iam-saas/internal/mocks"
	"iam-saas/internal/service"
	"iam-saas/pkg/app_error"
	"iam-saas/pkg/i18n"
	"iam-saas/pkg/utils"
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
	"gorm.io/gorm"
)

// Helper function to setup a test with mock repositories
func setupUserServiceTest() (domain.UserService, *mocks.MockUserRepository, *mocks.MockTenantRepository) {
	userRepo := &mocks.MockUserRepository{
		Users:   make(map[int64]*entities.User),
		Tokens:  make(map[string]int64),
		Counter: 0,
	}
	tenantRepo := &mocks.MockTenantRepository{
		Tenants: make(map[int64]*entities.Tenant),
		Counter: 0,
	}
	userService := service.NewUserService(nil, userRepo, tenantRepo)
	return userService, userRepo, tenantRepo
}

func TestUserService_Login(t *testing.T) {
	ctx := context.Background()
	hashedPassword, _ := utils.HashPassword("password123")

	t.Run("Success", func(t *testing.T) {
		userService, userRepo, tenantRepo := setupUserServiceTest()
		user, token, err := userService.Login(ctx, "test@example.com", "password123")
		assert.NoError(t, err)
		assert.NotNil(t, user)
		assert.NotEmpty(t, token)
		assert.Equal(t, int64(1), user.ID)
	})

	t.Run("Failed - User not found", func(t *testing.T) {
		userService, userRepo, tenantRepo := setupUserServiceTest()
		_, _, err := userService.Login(ctx, "notfound@example.com", "password123")
		assert.Error(t, err)
		appErr, ok := err.(*app_error.AppError)
		assert.True(t, ok)
		assert.Equal(t, app_error.CodeUnauthorized, appErr.Code)
		assert.Equal(t, string(i18n.LoginFailed), appErr.Message)
	})

	t.Run("Failed - Incorrect password", func(t *testing.T) {
		userService, userRepo, tenantRepo := setupUserServiceTest()
		_, _, err := userService.Login(ctx, "test@example.com", "wrongpassword")
		assert.Error(t, err)
		appErr, ok := err.(*app_error.AppError)
		assert.True(t, ok)
		assert.Equal(t, app_error.CodeUnauthorized, appErr.Code)
	})

	t.Run("Failed - User inactive", func(t *testing.T) {
		userService, userRepo, tenantRepo := setupUserServiceTest()
		_, _, err := userService.Login(ctx, "inactive@example.com", "password123")
		assert.Error(t, err)
		appErr, ok := err.(*app_error.AppError)
		assert.True(t, ok)
		assert.Equal(t, app_error.CodeUnauthorized, appErr.Code)
		assert.Equal(t, string(i18n.Unauthorized), appErr.Message)
	})

	t.Run("Failed - Tenant inactive", func(t *testing.T) {
		userService, userRepo, tenantRepo := setupUserServiceTest()
		_, _, err := userService.Login(ctx, "user_in_inactive_tenant@example.com", "password123")
		assert.Error(t, err)
		appErr, ok := err.(*app_error.AppError)
		assert.True(t, ok)
		assert.Equal(t, app_error.CodeUnauthorized, appErr.Code)
		assert.Equal(t, string(i18n.Unauthorized), appErr.Message)
	})

	t.Run("Failed - FindByEmail returns error", func(t *testing.T) {
		userService, userRepo, tenantRepo := setupUserServiceTest()
		userRepo.OnFindByEmail = func(ctx context.Context, email string) (*entities.User, error) {
			return nil, errors.New("db error")
		}
		_, _, err := userService.Login(ctx, "any@email.com", "anypassword")
		assert.Error(t, err)
		appErr, ok := err.(*app_error.AppError)
		assert.True(t, ok)
		assert.Equal(t, app_error.CodeInternalError, appErr.Code)
	})
}

func TestUserService_Register(t *testing.T) {
	ctx := context.Background()

	t.Run("Success", func(t *testing.T) {
		userService, _, _ := setupUserServiceTest()
		user, token, err := userService.Register(ctx, "New User", "new@example.com", "password123", "New Tenant")

		assert.NoError(t, err)
		assert.NotNil(t, user)
		assert.NotEmpty(t, token)
		assert.Equal(t, "New User", user.Name)
		assert.Equal(t, "new@example.com", user.Email)
	})

	t.Run("Failed - Email already exists", func(t *testing.T) {
		userService, userRepo, _ := setupUserServiceTest()
		userRepo.Users[1] = &entities.User{ID: 1, Email: "existing@example.com"}

		_, _, err := userService.Register(ctx, "Test", "existing@example.com", "password", "Tenant")
		assert.Error(t, err)
		appErr, ok := err.(*app_error.AppError)
		assert.True(t, ok)
		assert.Equal(t, app_error.CodeConflict, appErr.Code)
		assert.Equal(t, string(i18n.EmailAlreadyExists), appErr.Message)
	})

	t.Run("Failed - Tenant creation fails", func(t *testing.T) {
		userService, _, tenantRepo := setupUserServiceTest()
		tenantRepo.OnCreate = func(ctx context.Context, tx *gorm.DB, tenant *entities.Tenant) error {
			return errors.New("db error on tenant creation")
		}

		_, _, err := userService.Register(ctx, "Test", "fail@example.com", "password", "Failing Tenant")
		assert.Error(t, err)
		appErr, ok := err.(*app_error.AppError)
		assert.True(t, ok)
		assert.Equal(t, app_error.CodeInternalError, appErr.Code)
	})

	t.Run("Failed - User creation fails", func(t *testing.T) {
		userService, userRepo, _ := setupUserServiceTest()
		userRepo.OnCreate = func(ctx context.Context, tx *gorm.DB, user *entities.User) error {
			return errors.New("db error on user creation")
		}

		_, _, err := userService.Register(ctx, "Test", "fail_user@example.com", "password", "Working Tenant")
		assert.Error(t, err)
		appErr, ok := err.(*app_error.AppError)
		assert.True(t, ok)
		assert.Equal(t, app_error.CodeInternalError, appErr.Code)
	})
}

func TestUserService_InviteUser(t *testing.T) {
	ctx := context.Background()

	t.Run("Success", func(t *testing.T) {
		userService, userRepo, tenantRepo := setupUserServiceTest()

		tenantRepo.OnFindByID = func(ctx context.Context, id int64) (*entities.Tenant, error) {
			return &entities.Tenant{ID: id, Name: "Test Tenant", Status: "active", UserQuota: 10}, nil
		}
		userRepo.OnListByTenant = func(ctx context.Context, tenantID int64) ([]entities.User, error) {
			return []entities.User{}, nil // No existing users
		}
		userRepo.OnCreate = func(ctx context.Context, tx *gorm.DB, user *entities.User) error {
			user.ID = 1
			return nil
		}

		user, err := userService.InviteUser(ctx, 1, 1, "Invited User", "invited@example.com")
		assert.NoError(t, err)
		assert.NotNil(t, user)
		assert.Equal(t, "Invited User", user.Name)
		assert.Equal(t, "pending_invitation", user.Status)
		assert.NotNil(t, user.InvitationToken)
	})

	t.Run("Failed - User quota exceeded", func(t *testing.T) {
		userService, userRepo, tenantRepo := setupUserServiceTest()

		tenantRepo.OnFindByID = func(ctx context.Context, id int64) (*entities.Tenant, error) {
			return &entities.Tenant{ID: id, Name: "Test Tenant", Status: "active", UserQuota: 1}, nil
		}
		userRepo.OnListByTenant = func(ctx context.Context, tenantID int64) ([]entities.User, error) {
			return []entities.User{{ID: 1}}, nil // One existing user
		}

		_, err := userService.InviteUser(ctx, 1, 1, "Invited User", "invited@example.com")
		assert.Error(t, err)
		appErr, ok := err.(*app_error.AppError)
		assert.True(t, ok)
		assert.Equal(t, app_error.CodeConflict, appErr.Code)
		assert.Equal(t, string(i18n.UserQuotaExceeded), appErr.Message)
	})

	t.Run("Failed - Email already exists", func(t *testing.T) {
		userService, userRepo, tenantRepo := setupUserServiceTest()

		tenantRepo.OnFindByID = func(ctx context.Context, id int64) (*entities.Tenant, error) {
			return &entities.Tenant{ID: id, Name: "Test Tenant", Status: "active", UserQuota: 10}, nil
		}
		userRepo.OnListByTenant = func(ctx context.Context, tenantID int64) ([]entities.User, error) {
			return []entities.User{}, nil
		}
		userRepo.OnFindByEmail = func(ctx context.Context, email string) (*entities.User, error) {
			return &entities.User{ID: 1, Email: email}, nil
		}

		_, err := userService.InviteUser(ctx, 1, 1, "Another User", "existing@example.com")
		assert.Error(t, err)
		appErr, ok := err.(*app_error.AppError)
		assert.True(t, ok)
		assert.Equal(t, app_error.CodeConflict, appErr.Code)
		assert.Equal(t, string(i18n.EmailAlreadyExists), appErr.Message)
	})

	t.Run("Failed - Tenant not found", func(t *testing.T) {
		userService, userRepo, tenantRepo := setupUserServiceTest()

		tenantRepo.OnFindByID = func(ctx context.Context, id int64) (*entities.Tenant, error) {
			return nil, nil
		}

		_, err := userService.InviteUser(ctx, 1, 99, "Invited User", "invited@example.com")
		assert.Error(t, err)
		appErr, ok := err.(*app_error.AppError)
		assert.True(t, ok)
		assert.Equal(t, app_error.CodeNotFound, appErr.Code)
	})
}

func TestUserService_GetMe(t *testing.T) {
	ctx := context.Background()
	userService, userRepo, _ := setupUserServiceTest()
	userRepo.Users[1] = &entities.User{ID: 1, Name: "Test User"}

	t.Run("Success", func(t *testing.T) {
		user, err := userService.GetMe(ctx, 1)
		assert.NoError(t, err)
		assert.NotNil(t, user)
		assert.Equal(t, "Test User", user.Name)
	})

	t.Run("Failed - User not found", func(t *testing.T) {
		_, err := userService.GetMe(ctx, 99)
		assert.Error(t, err)
		appErr, ok := err.(*app_error.AppError)
		assert.True(t, ok)
		assert.Equal(t, app_error.CodeNotFound, appErr.Code)
	})
}

func TestUserService_ForgotPassword(t *testing.T) {
	ctx := context.Background()
	userService, userRepo, _ := setupUserServiceTest()
	userRepo.Users[1] = &entities.User{ID: 1, Email: "exists@example.com"}

	t.Run("Success - User exists", func(t *testing.T) {
		err := userService.ForgotPassword(ctx, "exists@example.com")
		assert.NoError(t, err)
		// Check if token was set in mock repo
		user := userRepo.Users[1]
		assert.NotNil(t, user.PasswordResetToken)
		assert.NotNil(t, user.PasswordResetTokenExpiresAt)
	})

	t.Run("Success - User does not exist", func(t *testing.T) {
		// Should not return an error to prevent email enumeration
		err := userService.ForgotPassword(ctx, "notexists@example.com")
		assert.NoError(t, err)
	})
}

func TestUserService_ResetPassword(t *testing.T) {
	ctx := context.Background()
	userService, userRepo, _ := setupUserServiceTest()
	validToken := "valid_token"
	expiredToken := "expired_token"
	expiresValid := time.Now().Add(time.Hour)
	expiresPast := time.Now().Add(-time.Hour)

	userRepo.Users[1] = &entities.User{ID: 1, PasswordResetToken: &validToken, PasswordResetTokenExpiresAt: &expiresValid}
	userRepo.Users[2] = &entities.User{ID: 2, PasswordResetToken: &expiredToken, PasswordResetTokenExpiresAt: &expiresPast}
	userRepo.Tokens[validToken] = 1
	userRepo.Tokens[expiredToken] = 2

	t.Run("Success", func(t *testing.T) {
		err := userService.ResetPassword(ctx, validToken, "newpassword123")
		assert.NoError(t, err)
		// Verify password hash is updated (mock would need to show this)
		assert.True(t, utils.CheckPasswordHash("newpassword123", userRepo.Users[1].PasswordHash))
	})

	t.Run("Failed - Invalid token", func(t *testing.T) {
		err := userService.ResetPassword(ctx, "invalid_token", "newpassword123")
		assert.Error(t, err)
		appErr, ok := err.(*app_error.AppError)
		assert.True(t, ok)
		assert.Equal(t, app_error.CodeUnauthorized, appErr.Code)
	})

	t.Run("Failed - Expired token", func(t *testing.T) {
		err := userService.ResetPassword(ctx, expiredToken, "newpassword123")
		assert.Error(t, err)
		appErr, ok := err.(*app_error.AppError)
		assert.True(t, ok)
		assert.Equal(t, app_error.CodeUnauthorized, appErr.Code)
	})
}

func TestUserService_ListUsers(t *testing.T) {
	ctx := context.Background()
	userService, userRepo, _ := setupUserServiceTest()
	userRepo.Users[1] = &entities.User{ID: 1, TenantID: 1, Name: "User A"}
	userRepo.Users[2] = &entities.User{ID: 2, TenantID: 1, Name: "User B"}
	userRepo.Users[3] = &entities.User{ID: 3, TenantID: 2, Name: "User C"}

	t.Run("Success", func(t *testing.T) {
		users, err := userService.ListUsers(ctx, 1)
		assert.NoError(t, err)
		assert.Len(t, users, 2)
	})
}

func TestUserService_UpdateUser(t *testing.T) {
	ctx := context.Background()
	userService, userRepo, _ := setupUserServiceTest()
	userRepo.Users[1] = &entities.User{ID: 1, Name: "Old Name", TenantID: 1}

	t.Run("Success", func(t *testing.T) {
		user, err := userService.UpdateUser(ctx, 1, "New Name", 1)
		assert.NoError(t, err)
		assert.NotNil(t, user)
		assert.Equal(t, "New Name", user.Name)
	})

	t.Run("Failed - User not found", func(t *testing.T) {
		_, err := userService.UpdateUser(ctx, 99, "New Name", 1)
		assert.Error(t, err)
		appErr, ok := err.(*app_error.AppError)
		assert.True(t, ok)
		assert.Equal(t, app_error.CodeNotFound, appErr.Code)
	})

	t.Run("Failed - Unauthorized (not admin)", func(t *testing.T) {
		userRepo.OnFindByID = func(ctx context.Context, id int64) (*entities.User, error) {
			return &entities.User{ID: 1, Email: "notadmin@example.com", TenantID: 1}, nil
		}
		_, err := userService.UpdateUser(ctx, 1, "New Name", 1)
		assert.Error(t, err)
		appErr, ok := err.(*app_error.AppError)
		assert.True(t, ok)
		assert.Equal(t, app_error.CodeUnauthorized, appErr.Code)
	})
}

func TestUserService_DeleteUser(t *testing.T) {
	ctx := context.Background()
	userService, userRepo, _ := setupUserServiceTest()
	userRepo.Users[1] = &entities.User{ID: 1, TenantID: 1}

	t.Run("Success", func(t *testing.T) {
		err := userService.DeleteUser(ctx, 1, 1)
		assert.NoError(t, err)
		_, exists := userRepo.Users[1]
		assert.False(t, exists)
	})

	t.Run("Failed - Unauthorized (not admin)", func(t *testing.T) {
		userRepo.OnFindByID = func(ctx context.Context, id int64) (*entities.User, error) {
			return &entities.User{ID: 1, Email: "notadmin@example.com", TenantID: 1}, nil
		}
		err := userService.DeleteUser(ctx, 1, 1)
		assert.Error(t, err)
		appErr, ok := err.(*app_error.AppError)
		assert.True(t, ok)
		assert.Equal(t, app_error.CodeUnauthorized, appErr.Code)
	})
}

func TestUserService_VerifyEmail(t *testing.T) {
	ctx := context.Background()
	userService, userRepo, _ := setupUserServiceTest()
	validToken := "verify_token"
	userRepo.Users[1] = &entities.User{ID: 1, Status: "pending_verification", VerificationToken: &validToken}
	userRepo.Tokens[validToken] = 1

	t.Run("Success", func(t *testing.T) {
		err := userService.VerifyEmail(ctx, validToken)
		assert.NoError(t, err)
		assert.Equal(t, "active", userRepo.Users[1].Status)
	})

	t.Run("Failed - Invalid token", func(t *testing.T) {
		err := userService.VerifyEmail(ctx, "invalid_token")
		assert.Error(t, err)
		appErr, ok := err.(*app_error.AppError)
		assert.True(t, ok)
		assert.Equal(t, app_error.CodeUnauthorized, appErr.Code)
	})
}

func TestUserService_AcceptInvitation(t *testing.T) {
	ctx := context.Background()

	t.Run("Success", func(t *testing.T) {
		userService, userRepo, _ := setupUserServiceTest()
		invitationToken := "test_invitation_token"
		userRepo.Users[1] = &entities.User{ID: 1, Email: "invited@example.com", Status: "pending_invitation", InvitationToken: &invitationToken}

		err := userService.AcceptInvitation(ctx, invitationToken, "newsecurepassword")
		assert.NoError(t, err)
		assert.Equal(t, "active", userRepo.Users[1].Status)
		assert.True(t, utils.CheckPasswordHash("newsecurepassword", userRepo.Users[1].PasswordHash))
		assert.Nil(t, userRepo.Users[1].InvitationToken)
	})

	t.Run("Failed - Invalid token", func(t *testing.T) {
		userService, userRepo, _ := setupUserServiceTest()
		// No user with this token
		err := userService.AcceptInvitation(ctx, "invalid_token", "newsecurepassword")
		assert.Error(t, err)
		// Depending on implementation, this might return a specific error or just no-op
	})
}