package i18n

// Key định nghĩa kiểu dữ liệu cho các i18n key để tăng tính an toàn (type safety).
type Key string

// Danh sách các key được sử dụng trong toàn bộ ứng dụng.
// Backend chỉ trả về các key này, frontend sẽ chịu trách nhiệm dịch chúng.
const (
	// Success messages
	LoginSuccessful    Key = "login_successful"
	RegisterSuccessful Key = "register_successful"
	ActionSuccessful   Key = "action_successful"

	// Error messages
	LoginFailed                 Key = "login_failed"
	InvalidInput                Key = "invalid_input"
	InternalServerError         Key = "internal_server_error"
	Unauthorized                Key = "unauthorized"
	CodeForbidden               Key = "code_forbidden"
	NotFound                    Key = "not_found"
	EmailAlreadyExists          Key = "email_already_exists"
	TenantNameIsRequired        Key = "tenant_name_is_required"
	UserQuotaExceeded           Key = "user_quota_exceeded"
	TenantNotFound              Key = "tenant_not_found"
	TenantKeyAlreadyExists      Key = "tenant_key_already_exists"
	TenantIsSuspended           Key = "tenant_is_suspended"
	TenantPendingVerification   Key = "tenant_pending_verification"
	UserNotFound                Key = "user_not_found"
	EmailVerificationSuccessful Key = "email_verification_successful"
	EmailVerificationFailed     Key = "email_verification_failed"
	MFARequired                 Key = "mfa_required"
	InvalidMFAOTP               Key = "invalid_mfa_otp"
)
