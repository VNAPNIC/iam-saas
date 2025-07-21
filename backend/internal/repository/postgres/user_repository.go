package postgres

import (
	"context"
	"iam-saas/internal/domain"
	"iam-saas/internal/entities"

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
		SELECT id, tenant_id, name, email, password_hash, status, created_at, updated_at
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
		SELECT id, tenant_id, name, email, password_hash, status, created_at, updated_at
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

func (r *userRepository) UpdateVerificationToken(userID uint, token string) error {
	sql := "UPDATE users SET verification_token = ? WHERE id = ?"
	return r.db.Exec(sql, token, userID).Error
}

func (r *userRepository) FindUserByVerificationToken(token string) (*entities.User, error) {
	var user entities.User
	sql := "SELECT id, full_name, email, phone_number, created_at, updated_at, status FROM users WHERE verification_token = ? LIMIT 1"
	err := r.db.Raw(sql, token).Scan(&user).Error
	return &user, err
}

func (r *userRepository) ActivateUser(userID uint) error {
	sql := "UPDATE users SET status = 'active', verification_token = NULL WHERE id = ?"
	return r.db.Exec(sql, userID).Error
}
