package postgres

import (
	"context"
	"iam-saas/internal/domain"
	"iam-saas/internal/entities"
	"time"

	"gorm.io/gorm"
)

type userRepository struct {
	db *gorm.DB
}

func NewuserRepository(db *gorm.DB) domain.UserRepository {
	return &userRepository{db}
}

func (r *userRepository) Create(ctx context.Context, tx *gorm.DB, user *entities.User) error {
	db := r.db
	if tx != nil {
		db = tx
	}

	query := `
		INSERT INTO "users" (tenant_id, name, email, password_hash, status, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
		RETURNING id, created_at, updated_at;
	`
	row := db.WithContext(ctx).Raw(query, user.TenantID, user.Name, user.Email, user.PasswordHash, user.Status).Row()
	return row.Scan(&user.ID, &user.CreatedAt, &user.UpdatedAt)
}

func (r *userRepository) FindByEmail(ctx context.Context, email string) (*entities.User, error) {
	var user entities.User
	query := `
		SELECT id, tenant_id, name, email, password_hash, status, avatar_url, phone_number, verification_token, email_verified_at, phone_verified_at, last_login_at, created_at, updated_at
		FROM "users"
		WHERE email = $1;
	`
	result := r.db.WithContext(ctx).Raw(query, email).First(&user)
	if result.Error != nil {
		if result.Error == gorm.ErrRecordNotFound {
			return nil, nil
		}
		return nil, result.Error
	}
	return &user, nil
}

func (r *userRepository) FindByID(ctx context.Context, id int64) (*entities.User, error) {
	var user entities.User
	query := `
		SELECT id, tenant_id, name, email, password_hash, status, avatar_url, phone_number, verification_token, email_verified_at, phone_verified_at, last_login_at, created_at, updated_at
		FROM "users"
		WHERE id = $1;
	`
	result := r.db.WithContext(ctx).Raw(query, id).First(&user)
	if result.Error != nil {
		if result.Error == gorm.ErrRecordNotFound {
			return nil, nil
		}
		return nil, result.Error
	}
	return &user, nil
}

func (r *userRepository) UpdateVerificationToken(ctx context.Context, userID int64, token string) error {
	sql := "UPDATE users SET verification_token = ? WHERE id = ?"
	return r.db.WithContext(ctx).Exec(sql, token, userID).Error
}

func (r *userRepository) FindUserByVerificationToken(ctx context.Context, token string) (*entities.User, error) {
	var user entities.User
	sql := "SELECT id, name, email, phone_number, created_at, updated_at, status FROM users WHERE verification_token = ? LIMIT 1"
	err := r.db.WithContext(ctx).Raw(sql, token).Scan(&user).Error
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, nil
		}
		return nil, err
	}
	return &user, nil
}

func (r *userRepository) ActivateUser(ctx context.Context, userID int64) error {
	sql := "UPDATE users SET status = 'active', verification_token = NULL, email_verified_at = NOW() WHERE id = ?"
	return r.db.WithContext(ctx).Exec(sql, userID).Error
}

func (r *userRepository) SetPasswordResetToken(ctx context.Context, userID int64, token string, expiresAt time.Time) error {
	sql := "UPDATE users SET password_reset_token = ?, password_reset_token_expires_at = ? WHERE id = ?"
	return r.db.WithContext(ctx).Exec(sql, token, expiresAt, userID).Error
}

func (r *userRepository) FindByPasswordResetToken(ctx context.Context, token string) (*entities.User, error) {
	var user entities.User
	query := `
		SELECT id, tenant_id, name, email, password_hash, status, avatar_url, phone_number, verification_token, email_verified_at, phone_verified_at, last_login_at, created_at, updated_at, password_reset_token, password_reset_token_expires_at
		FROM "users"
		WHERE password_reset_token = ?;
	`
	result := r.db.WithContext(ctx).Raw(query, token).First(&user)
	if result.Error != nil {
		if result.Error == gorm.ErrRecordNotFound {
			return nil, nil
		}
		return nil, result.Error
	}
	return &user, nil
}

func (r *userRepository) UpdatePassword(ctx context.Context, userID int64, newPasswordHash string) error {
	sql := "UPDATE users SET password_hash = ?, password_reset_token = NULL, password_reset_token_expires_at = NULL, updated_at = NOW() WHERE id = ?"
	return r.db.WithContext(ctx).Exec(sql, newPasswordHash, userID).Error
}

func (r *userRepository) ListByTenant(ctx context.Context, tenantID int64) ([]entities.User, error) {
	var users []entities.User
	query := `
		SELECT id, tenant_id, name, email, status, avatar_url, phone_number, created_at, updated_at
		FROM "users"
		WHERE tenant_id = ?
		ORDER BY created_at DESC;
	`
	result := r.db.WithContext(ctx).Raw(query, tenantID).Scan(&users)
	if result.Error != nil {
		return nil, result.Error
	}
	return users, nil
}

func (r *userRepository) Update(ctx context.Context, user *entities.User) error {
	query := `UPDATE "users" SET name = ?, updated_at = NOW() WHERE id = ? AND tenant_id = ?`
	return r.db.WithContext(ctx).Exec(query, user.Name, user.ID, user.TenantID).Error
}

func (r *userRepository) Delete(ctx context.Context, userID int64, tenantID int64) error {
	query := `DELETE FROM "users" WHERE id = ? AND tenant_id = ?`
	return r.db.WithContext(ctx).Exec(query, userID, tenantID).Error
}

func (r *userRepository) AcceptInvitation(ctx context.Context, token, passwordHash string) error {
	query := `UPDATE "users" SET password_hash = ?, status = 'active', invitation_token = NULL, updated_at = NOW() WHERE invitation_token = ?`
	return r.db.WithContext(ctx).Exec(query, passwordHash, token).Error
}
