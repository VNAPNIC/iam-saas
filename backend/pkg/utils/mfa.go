package utils

import (
	"fmt"

	"github.com/pquerna/otp/totp"
)

// GenerateMFASecret tạo một secret mới và trả về QR code URL
func GenerateMFASecret(accountName string) (string, string, error) {
	key, err := totp.Generate(totp.GenerateOpts{
		Issuer:      "IAM SaaS",
		AccountName: accountName,
	})
	if err != nil {
		return "", "", fmt.Errorf("failed to generate TOTP key: %w", err)
	}

	// Convert the TOTP key to a QR code image
	qrCodeURL := key.URL()

	return key.Secret(), qrCodeURL, nil
}

// ValidateMFA xác thực OTP được cung cấp với secret đã lưu
func ValidateMFA(otp, secret string) bool {
	return totp.Validate(otp, secret)
}
