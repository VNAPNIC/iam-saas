package utils

import (
	"golang.org/x/crypto/bcrypt"
)

// HashPassword tạo ra một chuỗi hash từ mật khẩu sử dụng bcrypt.
func HashPassword(password string) (string, error) {
	bytes, err := bcrypt.GenerateFromPassword([]byte(password), 14)
	return string(bytes), err
}

// CheckPasswordHash so sánh mật khẩu và chuỗi hash có khớp nhau không.
func CheckPasswordHash(password, hash string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(hash), []byte(password))
	return err == nil
}
