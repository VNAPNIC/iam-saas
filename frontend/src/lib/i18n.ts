export const i18nKeys = {
  // Success messages
  login_successful: 'Login Successful',
  register_successful: 'Account created successfully. Please check your email for verification.',
  action_successful: 'Action completed successfully',

  // Error messages
  login_failed: 'Login failed. Please check your email and password.',
  invalid_input: 'Invalid input provided. Please check the fields.',
  internal_server_error: 'An unexpected error occurred on our end. Please try again later.',
  unauthorized: 'You are not authorized to perform this action.',
  email_already_exists: 'This email address is already in use.',
  tenant_name_is_required: 'Company name is required.',
  
  // Frontend-specific messages
  register_failed: 'Registration failed. Please try again.',

} as const; // 'as const' để biến các key thành readonly và type-safe