import apiClient, { publicApiClient } from '../lib/apiClient';

// Định nghĩa kiểu dữ liệu cho payload đăng ký
export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  tenantKey: string;
}

// Định nghĩa kiểu dữ liệu cho payload đăng nhập
export interface LoginPayload {
  email: string;
  password: string;
  tenantKey: string;
}

// Định nghĩa kiểu dữ liệu cho response từ API
// (Dựa trên quy cách API đã định nghĩa)
export interface AuthResponse {
  data: {
    user: any;
    accessToken: string;
    refreshToken: string;
    isOnboarded: boolean;
  };
  message: string;
}

export interface ForgotPasswordPayload {
  email: string;
}

export interface ResetPasswordPayload {
  token: string;
  newPassword: string;
}

export interface AcceptInvitationPayload {
  token: string;
  password: string;
}

const register = async (payload: RegisterPayload): Promise<AuthResponse> => {
  const { tenantKey, ...body } = payload;

  const response = await publicApiClient.post<AuthResponse>(
    '/register',
    body,
    {
      headers: {
        'X-Tenant-Key': tenantKey,
      },
    }
  );
  return response.data;
};

const login = async (payload: LoginPayload): Promise<AuthResponse> => {
  const { tenantKey, ...body } = payload;

  const response = await publicApiClient.post<AuthResponse>(
    '/login',
    body,
    {
      headers: {
        'X-Tenant-Key': tenantKey,
      },
    }
  );
  return response.data;
};

const forgotPassword = async (payload: ForgotPasswordPayload): Promise<void> => {
  const response = await publicApiClient.post('/forgot-password', payload);
  return response.data;
};

const resetPassword = async (payload: ResetPasswordPayload): Promise<void> => {
  const response = await publicApiClient.post('/reset-password', payload);
  return response.data;
};

const acceptInvitation = async (payload: AcceptInvitationPayload): Promise<void> => {
  const response = await publicApiClient.post('/accept-invitation', payload);
  return response.data;
};

const verifyEmail = async (payload: { token: string }): Promise<void> => {
  const response = await publicApiClient.post('/verify-email', payload);
  return response.data;
};

export const authService = {
  register,
  login,
  forgotPassword,
  resetPassword,
  acceptInvitation,
  verifyEmail,
};
