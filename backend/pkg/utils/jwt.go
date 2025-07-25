package utils

import (
	"crypto/rand"
	"encoding/base64"
	"fmt"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

var (
	jwtSecret          []byte
	accessTokenExpiry  time.Duration
	refreshTokenExpiry time.Duration
)

func ConfigureJWT(secret string, accessExpiryMinutes, refreshExpiryMinutes int) {
	jwtSecret = []byte(secret)
	accessTokenExpiry = time.Duration(accessExpiryMinutes) * time.Minute
	refreshTokenExpiry = time.Duration(refreshExpiryMinutes) * time.Minute
}

type Claims struct {
	UserID    int64   `json:"user_id"`
	TenantID  int64   `json:"tenant_id"`
	TenantKey string  `json:"tenant_key"`
	UserEmail string  `json:"user_email"`
	RoleIDs   []int64 `json:"role_ids"`
	TokenType string  `json:"token_type"`
	jwt.RegisteredClaims
}

// GenerateToken tạo một token JWT mới cho người dùng với thời gian hết hạn tùy chỉnh.
func GenerateToken(userID, tenantID int64, tenantKey, userEmail string, roleIDs []int64, expiration time.Duration) (string, error) {
	expirationTime := time.Now().Add(expiration)

	claims := &Claims{
		UserID:    userID,
		TenantID:  tenantID,
		TenantKey: tenantKey,
		UserEmail: userEmail,
		RoleIDs:   roleIDs,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(expirationTime),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			Subject:   fmt.Sprintf("%d", userID), // Use Sprintf for subject
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	tokenString, err := token.SignedString(jwtSecret)

	return tokenString, err
}

// GenerateAccessToken tạo một access token với thời gian hết hạn ngắn (15 phút).
func GenerateAccessToken(userID, tenantID int64, tenantKey, userEmail string, roleIDs []int64) (string, error) {
	return GenerateToken(userID, tenantID, tenantKey, userEmail, roleIDs, accessTokenExpiry)
}

// GenerateRefreshToken tạo một refresh token với thời gian hết hạn dài hơn (7 ngày).
func GenerateRefreshToken(userID, tenantID int64, tenantKey, userEmail string, roleIDs []int64) (string, error) {
	return GenerateToken(userID, tenantID, tenantKey, userEmail, roleIDs, refreshTokenExpiry)
}

// ParseToken xác thực một chuỗi token và trả về các claims nếu hợp lệ.
func ParseToken(tokenString string) (*Claims, error) {
	claims := &Claims{}

	token, err := jwt.ParseWithClaims(tokenString, claims, func(token *jwt.Token) (interface{}, error) {
		// Đảm bảo thuật toán ký là HS256 như lúc tạo token
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
		}
		return jwtSecret, nil
	})

	if err != nil {
		return nil, err
	}

	if !token.Valid {
		return nil, fmt.Errorf("invalid token")
	}

	return claims, nil
}

func GenerateRandomString(n int) (string, error) {
	b := make([]byte, n)
	_, err := rand.Read(b)
	if err != nil {
		return "", err
	}
	return base64.URLEncoding.EncodeToString(b), nil
}

func GetAccessTokenExpiry() time.Duration {
	return accessTokenExpiry
}

func GetRefreshTokenExpiry() time.Duration {
	return refreshTokenExpiry
}
