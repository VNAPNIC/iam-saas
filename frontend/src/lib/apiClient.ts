import axios from 'axios';
import { useAuthStore } from '@/stores/authStore';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080/api/v1';

// Helper function to extract tenant domain from current URL
const getTenantDomain = (): string | null => {
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    const parts = hostname.split('.');
    
    // For localhost development
    if (hostname === 'localhost' || hostname.includes('localhost:')) {
      // You can return a test domain for development
      return 'test-tenant';
    }
    
    // Skip www, app, and main domain
    const subdomain = parts[0];
    if (subdomain === 'www' || subdomain === 'app' || parts.length < 3) {
      return null;
    }
    
    return subdomain;
  }
  return null;
};

// Public client cho các route không yêu cầu authentication
export const publicApiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Không cần interceptor cho publicApiClient vì tenant path đã có trong URL

const apiClient = axios.create({
  baseURL: `${API_BASE_URL}`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor để đính kèm token và tenant domain vào mọi yêu cầu
apiClient.interceptors.request.use(
  (config) => {
    const { accessToken } = useAuthStore.getState();
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    
    const tenantDomain = getTenantDomain();
    if (tenantDomain) {
      config.headers['X-Tenant-Domain'] = tenantDomain;
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
    // Nếu lỗi là 401 và không phải là yêu cầu refresh token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const { refreshToken, login, logout } = useAuthStore.getState();
        if (!refreshToken) {
          logout();
          return Promise.reject(error);
        }

        const tenantDomain = getTenantDomain();
        const response = await axios.post(
          `${API_BASE_URL}/public/refresh-token`,
          { refreshToken },
          {
            headers: tenantDomain ? { 'X-Tenant-Domain': tenantDomain } : {},
            params: tenantDomain ? { tenantDomain } : {}
          }
        );

        const { accessToken: newAccessToken, refreshToken: newRefreshToken } = response.data.data;
        login(newAccessToken, newRefreshToken, useAuthStore.getState().user!, useAuthStore.getState().user!.permissions);

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

export { apiClient };
export default apiClient;