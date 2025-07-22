package mocks

import (
	"context"
	"iam-saas/internal/entities"
	"time"

	"gorm.io/gorm"
)

// MockUserRepository is a mock implementation of domain.UserRepository
type MockUserRepository struct {
	OnCreate                    func(ctx context.Context, tx *gorm.DB, user *entities.User) error
	OnFindByEmail               func(ctx context.Context, email string) (*entities.User, error)
	OnFindByID                  func(ctx context.Context, id int64) (*entities.User, error)
	OnListByTenant              func(ctx context.Context, tenantID int64) ([]entities.User, error)
	OnUpdate                    func(ctx context.Context, user *entities.User) error
	OnDelete                    func(ctx context.Context, userID int64) error
	OnUpdateVerificationToken   func(ctx context.Context, userID int64, token string) error
	OnFindUserByVerificationToken func(ctx context.Context, token string) (*entities.User, error)
	OnActivateUser              func(ctx context.Context, userID int64) error
	OnSetPasswordResetToken     func(ctx context.Context, userID int64, token string, expiresAt time.Time) error
	OnFindByPasswordResetToken  func(ctx context.Context, token string) (*entities.User, error)
	OnUpdatePassword            func(ctx context.Context, userID int64, newPasswordHash string) error
}

func (m *MockUserRepository) Create(ctx context.Context, tx *gorm.DB, user *entities.User) error {
	return m.OnCreate(ctx, tx, user)
}
func (m *MockUserRepository) FindByEmail(ctx context.Context, email string) (*entities.User, error) {
	return m.OnFindByEmail(ctx, email)
}
func (m *MockUserRepository) FindByID(ctx context.Context, id int64) (*entities.User, error) {
	return m.OnFindByID(ctx, id)
}
func (m *MockUserRepository) ListByTenant(ctx context.Context, tenantID int64) ([]entities.User, error) {
	return m.OnListByTenant(ctx, tenantID)
}
func (m *MockUserRepository) Update(ctx context.Context, user *entities.User) error {
	return m.OnUpdate(ctx, user)
}
func (m *MockUserRepository) Delete(ctx context.Context, userID int64) error {
	return m.OnDelete(ctx, userID)
}
func (m *MockUserRepository) UpdateVerificationToken(ctx context.Context, userID int64, token string) error {
	return m.OnUpdateVerificationToken(ctx, userID, token)
}
func (m *MockUserRepository) FindUserByVerificationToken(ctx context.Context, token string) (*entities.User, error) {
	return m.OnFindUserByVerificationToken(ctx, token)
}
func (m *MockUserRepository) ActivateUser(ctx context.Context, userID int64) error {
	return m.OnActivateUser(ctx, userID)
}
func (m *MockUserRepository) SetPasswordResetToken(ctx context.Context, userID int64, token string, expiresAt time.Time) error {
	return m.OnSetPasswordResetToken(ctx, userID, token, expiresAt)
}
func (m *MockUserRepository) FindByPasswordResetToken(ctx context.Context, token string) (*entities.User, error) {
	return m.OnFindByPasswordResetToken(ctx, token)
}
func (m *MockUserRepository) UpdatePassword(ctx context.Context, userID int64, newPasswordHash string) error {
	return m.OnUpdatePassword(ctx, userID, newPasswordHash)
}

// MockTenantRepository is a mock implementation of domain.TenantRepository
type MockTenantRepository struct {
	OnCreate        func(ctx context.Context, tx *gorm.DB, tenant *entities.Tenant) error
	OnFindByID      func(ctx context.Context, id int64) (*entities.Tenant, error)
	OnUpdateBranding func(ctx context.Context, tenant *entities.Tenant) error
}

func (m *MockTenantRepository) Create(ctx context.Context, tx *gorm.DB, tenant *entities.Tenant) error {
	return m.OnCreate(ctx, tx, tenant)
}
func (m *MockTenantRepository) FindByID(ctx context.Context, id int64) (*entities.Tenant, error) {
	return m.OnFindByID(ctx, id)
}
func (m *MockTenantRepository) UpdateBranding(ctx context.Context, tenant *entities.Tenant) error {
	return m.OnUpdateBranding(ctx, tenant)
}
