import apiClient from '../lib/apiClient';

// Định nghĩa kiểu dữ liệu cho payload đăng ký
export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  tenantName: string;
}

// Định nghĩa kiểu dữ liệu cho payload đăng nhập
export interface LoginPayload {
  email: string;
  password: string;
}

// Định nghĩa kiểu dữ liệu cho response từ API
// (Dựa trên quy cách API đã định nghĩa)
export interface AuthResponse {
  data: {
    user: any; // Nên định nghĩa một User interface chi tiết hơn
    token: string;
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
  const response = await apiClient.post<AuthResponse>('/public/register', payload);
  return response.data;
};

const login = async (payload: LoginPayload): Promise<AuthResponse> => {
  const response = await apiClient.post<AuthResponse>('/public/login', payload);
  return response.data;
};

const forgotPassword = async (payload: ForgotPasswordPayload): Promise<void> => {
  await apiClient.post('/public/forgot-password', payload);
};

const resetPassword = async (payload: ResetPasswordPayload): Promise<void> => {
  await apiClient.post('/public/reset-password', payload);
};

const acceptInvitation = async (payload: AcceptInvitationPayload): Promise<void> => {
  await apiClient.post('/public/accept-invitation', payload);
};

export const authService = {
  register,
  login,
  forgotPassword,
  resetPassword,
  acceptInvitation,
};
