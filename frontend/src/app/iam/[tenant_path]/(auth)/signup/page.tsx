"use client";

import Image from 'next/image';
import { publicApiClient } from '@/lib/apiClient';
import { AxiosError } from 'axios';
import { useParams } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import { TenantConfig } from '@/types/tenant';
import { useTheme } from 'next-themes';
import { useUIStore } from '@/stores/uiStore';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { LanguageSelector } from '@/components/ui/language-selector';

export default function TenantSignupPage() {
  const params = useParams();
  const tenantPath = params.tenant_path as string;
  const [tenantConfig, setTenantConfig] = useState<TenantConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

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

  // Fetch tenant config
  const fetchTenantConfig = useCallback(async () => {
    if (!tenantPath) return;
    setLoading(true);
    try {
      const response = await publicApiClient.get(`/iam/${tenantPath}/public/config`);
      console.log('Tenant config response (signup):', response.data);
      setTenantConfig(response.data.data || response.data);
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

  const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      setError('Mật khẩu không khớp.');
      return;
    }

    if (formData.password.length < 8) {
      setError('Mật khẩu phải có ít nhất 8 ký tự.');
      return;
    }

    try {
      await publicApiClient.post(`/iam/${tenantPath}/auth/signup`, {
        name: formData.name,
        email: formData.email,
        password: formData.password,
      });

      alert('Đăng ký thành công! Vui lòng kiểm tra email để xác thực tài khoản.');
      window.location.href = `/iam/${tenantPath}/login`;
    } catch (err) {
      if (err instanceof AxiosError && err.response) {
        setError(err.response.data.message || 'Signup failed');
      } else {
        setError('Network error occurred');
      }
    }
  };

  const handleSSOSignup = () => {
    alert('Đang chuyển hướng đến nhà cung cấp SSO để đăng ký...');
    window.location.href = `${publicApiClient.defaults.baseURL}/iam/${tenantPath}/sso/login/default?signup=true`;
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
          <a href={`/${tenantPath}/login`} className="mt-4 inline-block bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
            Back to Login
          </a>
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
                <i className="fas fa-user-plus fa-lg"></i>
              )}
            </div>
            <div className="ml-4">
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Tạo tài khoản</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">Bắt đầu hành trình của bạn</p>
            </div>
          </div>

          <form id="signup-form" className="space-y-4" onSubmit={handleSignup}>
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Họ và tên</label>
              <input type="text" id="name" name="name"
                className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Nhập họ và tên" required
                value={formData.name}
                onChange={handleChange} />
            </div>
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
                placeholder="Ít nhất 8 ký tự" required
                value={formData.password}
                onChange={handleChange} />
            </div>
            <div>
              <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Xác nhận mật khẩu</label>
              <input type="password" id="confirm-password" name="confirmPassword"
                className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Nhập lại mật khẩu" required
                value={formData.confirmPassword}
                onChange={handleChange} />
            </div>

            <button type="submit"
              className="w-full text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              style={{ backgroundColor: tenantConfig?.primaryColor || '#3B82F6' }}>
              Đăng ký
            </button>
            {tenantConfig?.ssoEnabled && (
              <>
                <div className="relative flex py-2 items-center">
                  <div className="flex-grow border-t border-gray-300 dark:border-gray-600"></div>
                  <span className="flex-shrink mx-4 text-gray-500 dark:text-gray-400 text-sm">hoặc</span>
                  <div className="flex-grow border-t border-gray-300 dark:border-gray-600"></div>
                </div>
                <button type="button" onClick={handleSSOSignup}
                  className="w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 flex items-center justify-center">
                  <i className="fas fa-shield-alt mr-2"></i> Đăng ký với SSO
                </button>
              </>
            )}
          </form>
          <p className="text-sm text-center mt-4 text-gray-600 dark:text-gray-400">
            Đã có tài khoản? <a href={`/iam/${tenantPath}/login`} className="text-blue-500 hover:text-blue-700 dark:text-blue-400">Đăng nhập</a>
          </p>
          {error && (
            <p className="error-message text-red-600 dark:text-red-400 text-center mt-4" id="signup-error-general">{error}</p>
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