package handler

// ApiResponse defines the standard JSON structure for all API responses.
// This is part of the handler package as it's a presentation layer concern.
type ApiResponse struct {
	Data    interface{} `json:"data,omitempty"`
	Message string      `json:"message"` // This should be an i18n key
	Error   *ApiError   `json:"error,omitempty"`
}

// ApiError defines the structure for the error object in the JSON response.
type ApiError struct {
	Code    string      `json:"code"` // e.g., "INVALID_INPUT", "UNAUTHORIZED"
	Details interface{} `json:"details,omitempty"`
}

// NewSuccessResponse is a helper function to create a standard success response.
func NewSuccessResponse(data interface{}, messageKey string) *ApiResponse {
	return &ApiResponse{
		Data:    data,
		Message: messageKey,
		Error:   nil,
	}
}

// NewErrorResponse is a helper function to create a standard error response.
func NewErrorResponse(messageKey string, errorCode string, details interface{}) *ApiResponse {
	return &ApiResponse{
		Data:    nil,
		Message: messageKey,
		Error: &ApiError{
			Code:    errorCode,
			Details: details,
		},
	}
}
