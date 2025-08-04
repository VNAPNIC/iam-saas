package postgres

import (
	"context"
	"iam-saas/internal/domain"
	"iam-saas/internal/entities"
	"time"

	"gorm.io/gorm"
)

type sessionRepository struct {
	db *gorm.DB
}

func NewSessionRepository(db *gorm.DB) domain.SessionRepository {
	return &sessionRepository{db}
}

func (r *sessionRepository) Create(ctx context.Context, tx *gorm.DB, session *entities.Session) error {
	db := r.db
	if tx != nil {
		db = tx
	}
	return db.WithContext(ctx).Create(session).Error
}

func (r *sessionRepository) FindByID(ctx context.Context, id int64) (*entities.Session, error) {
	var session entities.Session
	err := r.db.WithContext(ctx).Preload("User").Where("id = ?", id).First(&session).Error
	if err != nil {
		return nil, err
	}
	return &session, nil
}

func (r *sessionRepository) FindByRefreshToken(ctx context.Context, refreshToken string) (*entities.Session, error) {
	var session entities.Session
	err := r.db.WithContext(ctx).Where("refresh_token = ? AND is_active = ? AND expires_at > ?", refreshToken, true, time.Now()).First(&session).Error
	if err != nil {
		return nil, err
	}
	return &session, nil
}

func (r *sessionRepository) FindByTenantID(ctx context.Context, tenantID int64, filters domain.SessionFilters) ([]entities.Session, error) {
	var sessions []entities.Session
	query := r.db.WithContext(ctx).Preload("User").Where("tenant_id = ? AND is_active = ?", tenantID, true)

	if filters.UserEmail != "" {
		query = query.Joins("JOIN users ON users.id = sessions.user_id").Where("users.email LIKE ?", "%"+filters.UserEmail+"%")
	}

	if filters.IPAddress != "" {
		query = query.Where("ip_address LIKE ?", "%"+filters.IPAddress+"%")
	}

	if filters.OS != "" {
		query = query.Where("device_info LIKE ?", "%"+filters.OS+"%")
	}

	if filters.Browser != "" {
		query = query.Where("device_info LIKE ?", "%"+filters.Browser+"%")
	}

	err := query.Order("last_activity DESC").Find(&sessions).Error
	return sessions, err
}

func (r *sessionRepository) Update(ctx context.Context, session *entities.Session) error {
	return r.db.WithContext(ctx).Save(session).Error
}

func (r *sessionRepository) Delete(ctx context.Context, id int64) error {
	return r.db.WithContext(ctx).Delete(&entities.Session{}, id).Error
}

func (r *sessionRepository) DeleteByUserID(ctx context.Context, userID int64) error {
	return r.db.WithContext(ctx).Where("user_id = ?", userID).Delete(&entities.Session{}).Error
}

func (r *sessionRepository) DeleteByTenantID(ctx context.Context, tenantID int64) error {
	return r.db.WithContext(ctx).Where("tenant_id = ?", tenantID).Delete(&entities.Session{}).Error
}

func (r *sessionRepository) DeleteExpiredSessions(ctx context.Context) error {
	return r.db.WithContext(ctx).Where("expires_at < ? OR is_active = ?", time.Now(), false).Delete(&entities.Session{}).Error
}