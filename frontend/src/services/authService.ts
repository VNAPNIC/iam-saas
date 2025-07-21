import apiClient from '@/lib/apiClient';
import { i18nKeys } from '@/lib/i18n';

// Định nghĩa kiểu dữ liệu cho request và response
interface RegisterRequest {
  tenant_name: string;
  email: string;
  password?: string;
  full_name?: string;
}

interface LoginRequest {
  email: string;
  password?: string;
}

interface AuthResponse {
  data: {
    token: string;
    user: {
      id: string;
      email: string;
      full_name: string;
      tenant_id: string;
    };
  };
  message: keyof typeof i18nKeys;
}

export const authService = {
  register: async (data: RegisterRequest) => {
    const response = await apiClient.post<AuthResponse>('/auth/register', data);
    return response.data;
  },

  login: async (data: LoginRequest) => {
    const response = await apiClient.post<AuthResponse>('/auth/login', data);
    return response.data;
  },
};