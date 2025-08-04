"use client";

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { publicApiClient } from '@/lib/apiClient';
import { useAuthStore } from '@/stores/authStore';
import { AxiosError } from 'axios';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { LanguageSelector } from '@/components/ui/language-selector';

// HỆ THỐNG 1: Trang đăng nhập cho Tenant Admin tại domain.xyz/login
export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { login } = useAuthStore();
  const { t } = useTranslation();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await publicApiClient.post('/auth/login', { email, password });
      const { accessToken, refreshToken, user, permissions } = response.data.data;
      login(accessToken, refreshToken, user, permissions);
      
      // Check user role and redirect accordingly
      if (user.role === 'super_admin') {
        router.push('/sa');
      } else {
        router.push('/dashboard'); // Tenant Admin dashboard
      }
    } catch (err) {
      if (err instanceof AxiosError && err.response) {
        setError(err.response.data.error || 'Login failed');
      } else {
        setError('Network error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSSOLogin = () => {
    // Redirect to SSO provider
    window.location.href = '/api/v1/auth/sso/login';
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
      <div className="w-full max-w-md p-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700">
          {/* IAM SaaS Branding */}
          <div className="flex items-center justify-center mb-6">
            <div className="w-12 h-12 bg-blue-500 rounded-md flex items-center justify-center text-white font-bold">
              <i className="fas fa-lock fa-lg"></i>
            </div>
            <div className="ml-4">
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white">IAM SaaS</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">{t('login.welcomeBack')}</p>
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('login.email')}
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder={t('login.emailPlaceholder')}
                required
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('login.password')}
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder={t('login.passwordPlaceholder')}
                required
              />
            </div>
            <div className="flex items-center justify-between">
              <Link href="/forgot-password" className="text-sm text-blue-500 hover:text-blue-700 dark:text-blue-400">
                {t('login.forgotPassword')}
              </Link>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 dark:bg-blue-500 dark:hover:bg-blue-600"
            >
              {loading ? t('login.signingIn') : t('login.signIn')}
            </button>
            
            <div className="relative flex py-2 items-center">
              <div className="flex-grow border-t border-gray-300"></div>
              <span className="flex-shrink mx-4 text-gray-500 text-sm">or</span>
              <div className="flex-grow border-t border-gray-300"></div>
            </div>
            
            <button
              type="button"
              onClick={handleSSOLogin}
              className="w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 flex items-center justify-center"
            >
              <i className="fas fa-shield-alt mr-2"></i> {t('login.signInWithSSO')}
            </button>
          </form>
          
          <p className="text-sm text-gray-600 dark:text-gray-400 text-center mt-4">
                {t('login.noAccount')}{" "}
                <Link href="/signup" className="text-blue-500 hover:text-blue-700 dark:text-blue-400">
                  {t('login.signUp')}
                </Link>
              </p>
          
          {error && (
            <p className="text-sm text-center mt-4 text-red-600 dark:text-red-400">{error}</p>
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