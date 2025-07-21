package app_error

import (
	"fmt"
	"net/http"
)

type ErrorCode string

// Business logic error codes
const (
	CodeInvalidInput  ErrorCode = "INVALID_INPUT"
	CodeUnauthorized  ErrorCode = "UNAUTHORIZED"
	CodeInternalError ErrorCode = "INTERNAL_SERVER_ERROR"
	CodeNotFound      ErrorCode = "NOT_FOUND"
	CodeConflict      ErrorCode = "CONFLICT"
)

// AppError is the custom error structure used within the application.
type AppError struct {
	StatusCode int
	Code       ErrorCode
	Message    string // This should be an i18n key
	Err        error
}

func (e *AppError) Error() string {
	return fmt.Sprintf("code: %s, message: %s, error: %v", e.Code, e.Message, e.Err)
}

// GetStatusCode returns the HTTP status code for the error.
func (e *AppError) GetStatusCode() int {
	if e.StatusCode == 0 {
		return http.StatusInternalServerError
	}
	return e.StatusCode
}

func NewUnauthorizedError(message string) *AppError {
	return &AppError{StatusCode: http.StatusUnauthorized, Code: CodeUnauthorized, Message: message}
}

func NewInternalServerError(err error) *AppError {
	return &AppError{StatusCode: http.StatusInternalServerError, Code: CodeInternalError, Message: "internal_server_error", Err: err}
}

func NewConflictError(field string, message string) *AppError {
	return &AppError{StatusCode: http.StatusConflict, Code: CodeConflict, Message: message}
}

// NewInvalidInputError creates an error for validation failures.
func NewInvalidInputError(field string, message string) *AppError {
	return &AppError{StatusCode: http.StatusBadRequest, Code: CodeInvalidInput, Message: message}
}
