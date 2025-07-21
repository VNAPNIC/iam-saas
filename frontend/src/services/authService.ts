import apiClient from '@/lib/apiClient';
import { i18nKeys } from '@/lib/i18n';

interface RegisterRequest {
  tenantName: string;
  email: string;
  password?: string;
  name?: string;
}

interface LoginRequest {
  email: string;
  password?: string;
}

export interface AuthData {
  accessToken: string;
  user: {
    id: string;
    email: string;
    name: string;
    tenantId: string;
  };
}

interface ApiResponse {
  data: AuthData;
  message: keyof typeof i18nKeys;
  error: any;
}

export const authService = {
  register: async (data: RegisterRequest): Promise<AuthData> => {
    const response = await apiClient.post<ApiResponse>('/auth/register', data);
    return response.data.data;
  },

  login: async (data: LoginRequest): Promise<AuthData> => {
    const response = await apiClient.post<ApiResponse>('/auth/login', data);
    return response.data.data;
  },
};