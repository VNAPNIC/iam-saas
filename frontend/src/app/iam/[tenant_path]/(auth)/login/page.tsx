'use client';

import Image from 'next/image';
import { publicApiClient } from '@/lib/apiClient';
import { useAuthStore } from '@/stores/authStore';
import { AxiosError } from 'axios';
import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect, useCallback } from 'react';
import { useTheme } from 'next-themes';
import { useUIStore } from '@/stores/uiStore';
import { TenantConfig } from '@/types/tenant';
import { LanguageSelector } from '@/components/ui/language-selector';
import { ThemeToggle } from '@/components/ui/theme-toggle';

export default function TenantLoginPage() {
  const params = useParams();
  const router = useRouter();
  const tenantPath = params.tenant_path as string;

  const { login } = useAuthStore();
  const [tenantConfig, setTenantConfig] = useState<TenantConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({ email: '', password: '' });

  const { theme, setTheme } = useTheme();
  const { language, setLanguage } = useUIStore();

  // Template-style dark mode toggle
  const toggleDarkMode = () => {
    const isDarkMode = document.body.classList.toggle('dark-mode');
    // Also update next-themes for consistency
    setTheme(isDarkMode ? 'dark' : 'light');
  };

  // Initialize dark mode on component mount
  useEffect(() => {
    if (theme === 'dark') {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }, [theme]);

  // Force re-render when theme changes to update icon
  const [, forceUpdate] = useState({});
  useEffect(() => {
    forceUpdate({});
  }, [theme]);

  const fetchTenantConfig = useCallback(async () => {
    if (!tenantPath) return;
    setLoading(true);
    try {
      const response = await publicApiClient.get(`/iam/${tenantPath}/public/config`);
      console.log('Tenant config response:', response.data); // Debug log
      setTenantConfig(response.data.data || response.data); // Handle both formats
    } catch (err) {
      if (err instanceof AxiosError && err.response) {
        setError(err.response.data.error || 'Organization not found');
      } else {
        setError('Failed to load organization configuration');
      }
    } finally {
      setLoading(false);
    }
  }, [tenantPath]);

  useEffect(() => {
    fetchTenantConfig();
  }, [fetchTenantConfig]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    try {
      const response = await publicApiClient.post(`/iam/${tenantPath}/auth/login`, formData);
      const { accessToken, refreshToken, user, permissions = [] } = response.data;
      login(accessToken, refreshToken, user, permissions);
      router.push(`/dashboard`); // Redirect to a generic dashboard for now
    } catch (err) {
      if (err instanceof AxiosError && err.response) {
        setError(err.response.data.message || 'Login failed');
      } else {
        setError('Network error occurred');
      }
    }
  };

  const handleSSOLogin = () => {
    window.location.href = `${publicApiClient.defaults.baseURL}/iam/${tenantPath}/sso/login/default`;
  };

  if (loading) {
    return (
      <div className="bg-gray-100 dark:bg-gray-900 flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error && !tenantConfig) {
    return (
      <div className="bg-gray-100 dark:bg-gray-900 flex items-center justify-center min-h-screen">
        <div className="w-full max-w-md p-4 text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
          <p className="text-gray-600 dark:text-gray-300">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-100 dark:bg-gray-900 flex items-center justify-center min-h-screen">
      <div className="w-full max-w-md p-4">
        <div className="card bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-center mb-6">
            <div id="logo-container"
              className="w-12 h-12 rounded-md flex items-center justify-center text-white font-bold"
              style={{ backgroundColor: tenantConfig?.primaryColor || '#3B82F6' }}>
              {tenantConfig?.logoURL ? (
                <Image src={tenantConfig.logoURL} alt="Logo" width={32} height={32} className="object-contain" />
              ) : (
                <i className="fas fa-lock fa-lg"></i>
              )}
            </div>
            <div className="ml-4">
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white">{tenantConfig?.name || 'IAM SaaS'}</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">Chào mừng trở lại!</p>
            </div>
          </div>

          <form id="login-form" className="space-y-4" onSubmit={handleLogin}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
              <input type="email" id="email" name="email"
                className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="nhap@email.com" required
                value={formData.email}
                onChange={handleChange} />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Mật khẩu</label>
              <input type="password" id="password" name="password"
                className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Nhập mật khẩu" required
                value={formData.password}
                onChange={handleChange} />
            </div>
            <div className="flex items-center justify-between">
              <a href={`/iam/${tenantPath}/forgot-password`} className="text-sm text-blue-500 hover:text-blue-700">Quên mật khẩu?</a>
            </div>
            <button type="submit"
              className="w-full text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              style={{ backgroundColor: tenantConfig?.primaryColor || '#3B82F6' }}>
              Đăng nhập
            </button>
            {tenantConfig?.ssoEnabled && (
              <>
                <div className="relative flex py-2 items-center">
                  <div className="flex-grow border-t border-gray-300"></div>
                  <span className="flex-shrink mx-4 text-gray-500 text-sm">hoặc</span>
                  <div className="flex-grow border-t border-gray-300"></div>
                </div>
                <button type="button" onClick={handleSSOLogin}
                  className="w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 flex items-center justify-center">
                  <i className="fas fa-shield-alt mr-2"></i> Đăng nhập với SSO
                </button>
              </>
            )}
          </form>
          {tenantConfig?.allowPublicSignup && (
            <p className="text-sm text-center mt-4 text-gray-600 dark:text-gray-400">
              Chưa có tài khoản? <a href={`/iam/${tenantPath}/signup`} className="text-blue-500 hover:text-blue-700 dark:text-blue-400">Đăng ký ngay</a>
            </p>
          )}
          {error && (
            <p className="error-message text-center mt-4" id="login-error">{error}</p>
          )}
        </div>

        <div className="flex justify-center mt-4 space-x-4">
          <ThemeToggle />
          <LanguageSelector />
        </div>
      </div>
    </div>
  );
}