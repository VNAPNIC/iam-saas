package mocks

import (
	"context"
	"fmt"
	"iam-saas/internal/entities"
	"sync"
	"time"

	"gorm.io/gorm"
)

// MockUserRepository is a mock implementation of domain.UserRepository
type MockUserRepository struct {
	mu      sync.RWMutex
	Users   map[int64]*entities.User
	Tokens  map[string]int64 // Maps various tokens to user IDs
	Counter int64

	OnCreate                    func(ctx context.Context, tx *gorm.DB, user *entities.User) error
	OnFindByEmail               func(ctx context.Context, email string) (*entities.User, error)
	OnFindByID                  func(ctx context.Context, id int64) (*entities.User, error)
	OnListByTenant              func(ctx context.Context, tenantID int64) ([]entities.User, error)
	OnUpdate                    func(ctx context.Context, user *entities.User) error
	OnDelete                    func(ctx context.Context, userID int64, tenantID int64) error
	OnUpdateVerificationToken   func(ctx context.Context, userID int64, token string) error
	OnFindUserByVerificationToken func(ctx context.Context, token string) (*entities.User, error)
	OnActivateUser              func(ctx context.Context, userID int64) error
	OnSetPasswordResetToken     func(ctx context.Context, userID int64, token string, expiresAt time.Time) error
	OnFindByPasswordResetToken  func(ctx context.Context, token string) (*entities.User, error)
	OnUpdatePassword            func(ctx context.Context, userID int64, newPasswordHash string) error
	OnAcceptInvitation          func(ctx context.Context, token, passwordHash string) error
}

func (m *MockUserRepository) Create(ctx context.Context, tx *gorm.DB, user *entities.User) error {
	if m.OnCreate != nil {
		return m.OnCreate(ctx, tx, user)
	}
	m.mu.Lock()
	defer m.mu.Unlock()
	m.Counter++
	user.ID = m.Counter
	m.Users[user.ID] = user
	return nil
}

func (m *MockUserRepository) FindByEmail(ctx context.Context, email string) (*entities.User, error) {
	if m.OnFindByEmail != nil {
		return m.OnFindByEmail(ctx, email)
	}
	m.mu.RLock()
	defer m.mu.RUnlock()
	for _, user := range m.Users {
		if user.Email == email {
			return user, nil
		}
	}
	return nil, nil
}

func (m *MockUserRepository) FindByID(ctx context.Context, id int64) (*entities.User, error) {
	if m.OnFindByID != nil {
		return m.OnFindByID(ctx, id)
	}
	m.mu.RLock()
	defer m.mu.RUnlock()
	user, ok := m.Users[id]
	if !ok {
		return nil, nil // Or return an error if that's the expected behavior for not found
	}
	return user, nil
}

func (m *MockUserRepository) ListByTenant(ctx context.Context, tenantID int64) ([]entities.User, error) {
	if m.OnListByTenant != nil {
		return m.OnListByTenant(ctx, tenantID)
	}
	m.mu.RLock()
	defer m.mu.RUnlock()
	var result []entities.User
	for _, user := range m.Users {
		if user.TenantID == tenantID {
			result = append(result, *user)
		}
	}
	return result, nil
}

func (m *MockUserRepository) Update(ctx context.Context, user *entities.User) error {
	if m.OnUpdate != nil {
		return m.OnUpdate(ctx, user)
	}
	m.mu.Lock()
	defer m.mu.Unlock()
	m.Users[user.ID] = user
	return nil
}

func (m *MockUserRepository) Delete(ctx context.Context, userID int64, tenantID int64) error {
	if m.OnDelete != nil {
		return m.OnDelete(ctx, userID, tenantID)
	}
	m.mu.Lock()
	defer m.mu.Unlock()
	delete(m.Users, userID)
	return nil
}

func (m *MockUserRepository) AcceptInvitation(ctx context.Context, token, passwordHash string) error {
	if m.OnAcceptInvitation != nil {
		return m.OnAcceptInvitation(ctx, token, passwordHash)
	}
	m.mu.Lock()
	defer m.mu.Unlock()
	for _, user := range m.Users {
		if user.InvitationToken != nil && *user.InvitationToken == token {
			user.PasswordHash = passwordHash
			user.Status = "active"
			user.InvitationToken = nil
			return nil
		}
	}
	return fmt.Errorf("invitation token not found or invalid")
}

func (m *MockUserRepository) SetPasswordResetToken(ctx context.Context, userID int64, token string, expiresAt time.Time) error {
	if m.OnSetPasswordResetToken != nil {
		return m.OnSetPasswordResetToken(ctx, userID, token, expiresAt)
	}
	m.mu.Lock()
	defer m.mu.Unlock()
	user, ok := m.Users[userID]
	if ok {
		user.PasswordResetToken = &token
		user.PasswordResetTokenExpiresAt = &expiresAt
		m.Tokens[token] = userID
	}
	return nil
}

func (m *MockUserRepository) FindByPasswordResetToken(ctx context.Context, token string) (*entities.User, error) {
	if m.OnFindByPasswordResetToken != nil {
		return m.OnFindByPasswordResetToken(ctx, token)
	}
	m.mu.RLock()
	defer m.mu.RUnlock()
	userID, ok := m.Tokens[token]
	if !ok {
		return nil, nil
	}
	user, ok := m.Users[userID]
	if !ok {
		return nil, nil
	}
	if user.PasswordResetToken == nil || *user.PasswordResetToken != token {
		return nil, nil
	}
	return user, nil
}

func (m *MockUserRepository) UpdatePassword(ctx context.Context, userID int64, newPasswordHash string) error {
	if m.OnUpdatePassword != nil {
		return m.OnUpdatePassword(ctx, userID, newPasswordHash)
	}
	m.mu.Lock()
	defer m.mu.Unlock()
	user, ok := m.Users[userID]
	if ok {
		user.PasswordHash = newPasswordHash
		user.PasswordResetToken = nil
		user.PasswordResetTokenExpiresAt = nil
	}
	return nil
}

func (m *MockUserRepository) FindUserByVerificationToken(ctx context.Context, token string) (*entities.User, error) {
	if m.OnFindUserByVerificationToken != nil {
		return m.OnFindUserByVerificationToken(ctx, token)
	}
	m.mu.RLock()
	defer m.mu.RUnlock()
	userID, ok := m.Tokens[token]
	if !ok {
		return nil, nil
	}
	return m.Users[userID], nil
}

func (m *MockUserRepository) ActivateUser(ctx context.Context, userID int64) error {
	if m.OnActivateUser != nil {
		return m.OnActivateUser(ctx, userID)
	}
	m.mu.Lock()
	defer m.mu.Unlock()
	user, ok := m.Users[userID]
	if ok {
		user.Status = "active"
		user.VerificationToken = nil
	}
	return nil
}

func (m *MockUserRepository) UpdateVerificationToken(ctx context.Context, userID int64, token string) error {
    if m.OnUpdateVerificationToken != nil {
        return m.OnUpdateVerificationToken(ctx, userID, token)
    }
    m.mu.Lock()
    defer m.mu.Unlock()
    user, ok := m.Users[userID]
    if ok {
        user.VerificationToken = &token
        m.Tokens[token] = userID
    }
    return nil
}

// MockTenantRepository is a mock implementation of domain.TenantRepository
type MockTenantRepository struct {
	mu      sync.RWMutex
	Tenants map[int64]*entities.Tenant
	Counter int64

	OnCreate        func(ctx context.Context, tx *gorm.DB, tenant *entities.Tenant) error
	OnFindByID      func(ctx context.Context, id int64) (*entities.Tenant, error)
	OnUpdateBranding func(ctx context.Context, tenant *entities.Tenant) error
}

func (m *MockTenantRepository) Create(ctx context.Context, tx *gorm.DB, tenant *entities.Tenant) error {
	if m.OnCreate != nil {
		return m.OnCreate(ctx, tx, tenant)
	}
	m.mu.Lock()
	defer m.mu.Unlock()
	m.Counter++
	tenant.ID = m.Counter
	m.Tenants[tenant.ID] = tenant
	return nil
}

func (m *MockTenantRepository) FindByID(ctx context.Context, id int64) (*entities.Tenant, error) {
	if m.OnFindByID != nil {
		return m.OnFindByID(ctx, id)
	}
	m.mu.RLock()
	defer m.mu.RUnlock()
	tenant, ok := m.Tenants[id]
	if !ok {
		return nil, fmt.Errorf("tenant with id %d not found", id)
	}
	return tenant, nil
}

func (m *MockTenantRepository) UpdateBranding(ctx context.Context, tenant *entities.Tenant) error {
	if m.OnUpdateBranding != nil {
		return m.OnUpdateBranding(ctx, tenant)
	}
	m.mu.Lock()
	defer m.mu.Unlock()
	m.Tenants[tenant.ID] = tenant
	return nil
}
