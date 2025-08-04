"use client";

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { publicApiClient } from '@/lib/apiClient';
import { useTheme } from 'next-themes';
import { useUIStore } from '@/stores/uiStore';
import Link from 'next/link';
import Image from 'next/image';
import { TenantConfig } from '@/types/tenant';
import { LanguageSelector } from '@/components/ui/language-selector';
import { ThemeToggle } from '@/components/ui/theme-toggle';

export default function ForgotPasswordPage() {
  const params = useParams();
  const tenantPath = params.tenant_path as string;

  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [tenantConfig, setTenantConfig] = useState<TenantConfig | null>(null);
  const [configLoading, setConfigLoading] = useState(true);

  const { theme, setTheme } = useTheme();
  const { language, setLanguage } = useUIStore();

  // Template-style dark mode toggle
  const toggleDarkMode = () => {
    const isDarkMode = document.body.classList.toggle('dark-mode');
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
    setConfigLoading(true);
    try {
      const response = await publicApiClient.get(`/iam/${tenantPath}/public/config`);
      console.log('Tenant config response (forgot-password):', response.data);
      setTenantConfig(response.data.data || response.data);
    } catch (err) {
      console.error('Failed to load tenant config:', err);
      // Don't show error for config, just use defaults
    } finally {
      setConfigLoading(false);
    }
  }, [tenantPath]);

  useEffect(() => {
    fetchTenantConfig();
  }, [fetchTenantConfig]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    try {
      await publicApiClient.post(`/iam/${tenantPath}/auth/forgot-password`, { email });
      setMessage('Nếu email của bạn tồn tại trong hệ thống, bạn sẽ nhận được một liên kết đặt lại mật khẩu.');
      setEmail(''); // Clear the input
    } catch (err) {
      // To prevent user enumeration, we show a generic message even on error.
      // The backend should handle logging the actual error.
      setMessage('Nếu email của bạn tồn tại trong hệ thống, bạn sẽ nhận được một liên kết đặt lại mật khẩu.');
    } finally {
      setLoading(false);
    }
  };

  if (configLoading) {
    return (
      <div className="bg-gray-100 dark:bg-gray-900 flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="bg-gray-100 dark:bg-gray-900 flex items-center justify-center min-h-screen">
      <div className="w-full max-w-md p-4">
        <div className="card bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-center mb-6">
            <div className="w-12 h-12 rounded-md flex items-center justify-center text-white font-bold"
              style={{ backgroundColor: tenantConfig?.primaryColor || '#3B82F6' }}>
              {tenantConfig?.logoURL ? (
                <Image src={tenantConfig.logoURL} alt="Logo" width={32} height={32} className="object-contain" />
              ) : (
                <i className="fas fa-key fa-lg"></i>
              )}
            </div>
            <div className="ml-4">
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Đặt lại mật khẩu</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">Nhập email để nhận liên kết</p>
            </div>
          </div>

          <form id="forgot-password-form" className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
              <input type="email" id="email" name="email"
                className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="nhap@email.com" required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <button type="submit"
              className="w-full text-white px-4 py-2 rounded-md hover:opacity-90 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              style={{ backgroundColor: tenantConfig?.primaryColor || '#3B82F6' }}
              disabled={loading}>
              {loading ? 'Đang gửi...' : 'Gửi liên kết đặt lại'}
            </button>
          </form>
          <p className="text-sm text-center mt-4 text-gray-600 dark:text-gray-400">
            Nhớ mật khẩu rồi? <Link href={`/iam/${tenantPath}/login`} className="text-blue-500 hover:text-blue-700 dark:text-blue-400">Quay lại Đăng nhập</Link>
          </p>
          {message && (
            <p id="success-message" className="mt-4 text-center text-sm text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/50 p-3 rounded-md">{message}</p>
          )}
          {error && (
            <p className="error-message text-red-600 dark:text-red-400 text-center mt-4">{error}</p>
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