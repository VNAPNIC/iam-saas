import axios from 'axios';
import { useAuthStore } from '@/stores/authStore';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080/api/v1';

// Public client for routes that don't require tenant key
export const publicApiClient = axios.create({
  baseURL: `${API_BASE_URL}/public`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to attach tenant key to public requests if available
publicApiClient.interceptors.request.use(
  (config) => {
    const { user } = useAuthStore.getState();
    if (user && user.tenantKey) {
      config.headers['X-Tenant-Key'] = user.tenantKey;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

const apiClient = axios.create({
  baseURL: `${API_BASE_URL}`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to attach token to every request
apiClient.interceptors.request.use(
  (config) => {
    const { accessToken, user } = useAuthStore.getState();
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
      if (user && user.tenantKey) {
        config.headers['X-Tenant-Key'] = user.tenantKey;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor để xử lý refresh token
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    // Nếu lỗi là 401 và không phải là request refresh token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const { refreshToken, login, logout } = useAuthStore.getState();
        if (!refreshToken) {
          logout();
          return Promise.reject(error);
        }

        const response = await axios.post(
          `${API_BASE_URL}/public/refresh-token`,
          { refreshToken }
        );

        const { accessToken: newAccessToken, refreshToken: newRefreshToken } = response.data.data;
        login(newAccessToken, newRefreshToken, useAuthStore.getState().user!);

        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        useAuthStore.getState().logout();
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;