import apiClient from '@/lib/apiClient';

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
  message: string;
  error: any;
}

export const authService = {
  async register({ name, email, password, tenantName }: { name: string; email: string; password: string; tenantName: string }) {
    const response = await apiClient.post('/auth/register', { name, email, password, tenantName });
    return response.data.data.user;
  },
  async login({ email, password }: { email: string; password: string }) {
    const response = await apiClient.post('/auth/login', { email, password });
    return response.data.data;
  }
};