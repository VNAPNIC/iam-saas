package postgres

import (
	"context"
	"fmt"
	"iam-saas/internal/domain"
	"iam-saas/internal/entities"
	"strings"
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
	rows, err := r.db.WithContext(ctx).Raw(query, email).Rows()
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	if rows.Next() {
		err := rows.Scan(&user.ID, &user.TenantID, &user.Name, &user.Email, &user.PasswordHash, &user.Status, &user.AvatarURL, &user.PhoneNumber, &user.VerificationToken, &user.EmailVerifiedAt, &user.PhoneVerifiedAt, &user.LastLoginAt, &user.CreatedAt, &user.UpdatedAt)
		if err != nil {
			return nil, err
		}
		return &user, nil
	}

	return nil, nil // Record not found
}

func (r *userRepository) FindByID(ctx context.Context, id int64) (*entities.User, error) {
	var user entities.User
	query := `
		SELECT id, tenant_id, name, email, password_hash, status, avatar_url, phone_number, verification_token, email_verified_at, phone_verified_at, last_login_at, created_at, updated_at
		FROM "users"
		WHERE id = $1;
	`
	rows, err := r.db.WithContext(ctx).Raw(query, id).Rows()
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	if rows.Next() {
		err := rows.Scan(&user.ID, &user.TenantID, &user.Name, &user.Email, &user.PasswordHash, &user.Status, &user.AvatarURL, &user.PhoneNumber, &user.VerificationToken, &user.EmailVerifiedAt, &user.PhoneVerifiedAt, &user.LastLoginAt, &user.CreatedAt, &user.UpdatedAt)
		if err != nil {
			return nil, err
		}
		return &user, nil
	}

	return nil, nil // Record not found
}

func (r *userRepository) UpdateVerificationToken(ctx context.Context, userID int64, token string) error {
	sql := "UPDATE users SET verification_token = ? WHERE id = ?"
	return r.db.WithContext(ctx).Exec(sql, token, userID).Error
}

func (r *userRepository) FindUserByVerificationToken(ctx context.Context, token string) (*entities.User, error) {
	var user entities.User
	sql := "SELECT id, name, email, phone_number, created_at, updated_at, status FROM users WHERE verification_token = $1 LIMIT 1"
	rows, err := r.db.WithContext(ctx).Raw(sql, token).Rows()
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	if rows.Next() {
		err := rows.Scan(&user.ID, &user.Name, &user.Email, &user.PhoneNumber, &user.CreatedAt, &user.UpdatedAt, &user.Status)
		if err != nil {
			return nil, err
		}
		return &user, nil
	}

	return nil, nil // Record not found
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
		WHERE password_reset_token = $1;
	`
	rows, err := r.db.WithContext(ctx).Raw(query, token).Rows()
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	if rows.Next() {
		err := rows.Scan(&user.ID, &user.TenantID, &user.Name, &user.Email, &user.PasswordHash, &user.Status, &user.AvatarURL, &user.PhoneNumber, &user.VerificationToken, &user.EmailVerifiedAt, &user.PhoneVerifiedAt, &user.LastLoginAt, &user.CreatedAt, &user.UpdatedAt, &user.PasswordResetToken, &user.PasswordResetTokenExpiresAt)
		if err != nil {
			return nil, err
		}
		return &user, nil
	}

	return nil, nil // Record not found
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
		WHERE tenant_id = $1
		ORDER BY created_at DESC;
	`
	rows, err := r.db.WithContext(ctx).Raw(query, tenantID).Rows()
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	for rows.Next() {
		var user entities.User
		err := rows.Scan(&user.ID, &user.TenantID, &user.Name, &user.Email, &user.Status, &user.AvatarURL, &user.PhoneNumber, &user.CreatedAt, &user.UpdatedAt)
		if err != nil {
			return nil, err
		}
		users = append(users, user)
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

func (r *userRepository) GetUserRoleIDs(ctx context.Context, userID int64) ([]int64, error) {
	var roleIDs []int64
	query := `
		SELECT role_id
		FROM user_roles
		WHERE user_id = $1;
	`
	rows, err := r.db.WithContext(ctx).Raw(query, userID).Rows()
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	for rows.Next() {
		var roleID int64
		if err := rows.Scan(&roleID); err != nil {
			return nil, err
		}
		roleIDs = append(roleIDs, roleID)
	}

	return roleIDs, nil
}

func (r *userRepository) UpdateMFASecret(ctx context.Context, userID int64, secret string) error {
	query := `UPDATE "users" SET mfa_secret = ?, updated_at = NOW() WHERE id = ?`
	return r.db.WithContext(ctx).Exec(query, secret, userID).Error
}

func (r *userRepository) AssignRolesToUser(ctx context.Context, tx *gorm.DB, userID int64, roleIDs []int64) error {
	db := r.db
	if tx != nil {
		db = tx
	}

	// Delete existing roles for the user
	deleteQuery := `DELETE FROM user_roles WHERE user_id = ?`
	if err := db.WithContext(ctx).Exec(deleteQuery, userID).Error; err != nil {
		return err
	}

	// Insert new roles
	if len(roleIDs) > 0 {
		valueStrings := []string{}
		valueArgs := []interface{}{}
		for _, roleID := range roleIDs {
			valueStrings = append(valueStrings, "(?, ?)")
			valueArgs = append(valueArgs, userID, roleID)
		}
		insertQuery := fmt.Sprintf("INSERT INTO user_roles (user_id, role_id) VALUES %s", strings.Join(valueStrings, ","))
		return db.WithContext(ctx).Exec(insertQuery, valueArgs...).Error
	}
	return nil
}
