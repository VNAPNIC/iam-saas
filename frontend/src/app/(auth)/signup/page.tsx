'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast, { Toaster } from 'react-hot-toast';
import { useUIStore, type Language } from '@/stores/uiStore';
import { useTranslation } from '@/lib/i18n';
import { authService } from '@/services/authService';

const UserPlusIcon = () => (
  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"></path>
  </svg>
);

const ShieldIcon = () => (
  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
    <path
      fillRule="evenodd"
      d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
      clipRule="evenodd"
    />
  </svg>
);

const MoonIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
    <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"></path>
  </svg>
);

const SunIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
    <path
      fillRule="evenodd"
      d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm-.707 7.072l.707-.707a1 1 0 10-1.414-1.414l-.707.707a1 1 0 001.414 1.414zM3 11a1 1 0 100-2H2a1 1 0 100 2h1z"
      clipRule="evenodd"
    ></path>
  </svg>
);

export default function SignUpPage() {
  const [name, setName] = useState('');
  const [tenantName, setTenantName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();
  const t = useTranslation();
  const { theme, language, toggleTheme, setLanguage } = useUIStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password !== confirmPassword) {
      setError(t.passwordMismatch);
      return;
    }
    setLoading(true);

    try {
      console.log('Attempting to register with:', { name, email, password, tenantName });
      const user = await authService.register({ name, email, password, tenantName });
      console.log('Registration successful, user:', user);
      toast.success(t.signupSuccess, { duration: 5000 });
      router.push('/login');
      console.log('Redirecting to /login');
    } catch (err: any) {
      console.error('Registration error:', err);
      const backendMessage = err.response?.data?.message;
      const errorMessage =
        backendMessage === 'email_already_exists'
          ? t.emailAlreadyExists
          : backendMessage || t.signupFailed || 'Registration failed.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <main className="flex items-center justify-center min-h-screen">
      <Toaster />
      <div className="w-full max-w-md p-4">
        <div className="card bg-white rounded-lg shadow-lg p-6 border border-gray-200">
          <div className="flex items-center justify-center mb-6">
            <div className="w-12 h-12 bg-blue-500 rounded-md flex items-center justify-center text-white font-bold">
              <UserPlusIcon />
            </div>
            <div className="ml-4">
              <h1 className="text-xl font-semibold text-gray-900">{t.signupTitle}</h1>
              <p className="text-sm text-gray-500">{t.signupWelcome}</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="tenantName" className="block text-sm font-medium text-gray-700">
                {t.tenantNameLabel}
              </label>
              <input
                type="text"
                id="tenantName"
                value={tenantName}
                onChange={(e) => setTenantName(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                placeholder={t.tenantNamePlaceholder}
                required
                data-testid="signup-tenant-name"
              />
            </div>
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                {t.fullNameLabel}
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                placeholder={t.fullNamePlaceholder}
                required
                data-testid="signup-full-name"
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                {t.emailLabel}
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                placeholder={t.emailPlaceholder}
                required
                data-testid="signup-email"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                {t.passwordLabel}
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                placeholder={t.passwordPlaceholderSignup}
                required
                data-testid="signup-password"
              />
            </div>
            <div>
              <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700">
                {t.confirmPasswordLabel}
              </label>
              <input
                type="password"
                id="confirm-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                placeholder={t.confirmPasswordPlaceholder}
                required
                data-testid="signup-confirm-password"
              />
            </div>
            {error && (
              <p className="text-sm text-red-600 text-center" data-testid="signup-error">
                {error}
              </p>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-blue-400"
              data-testid="signup-submit-button"
            >
              {loading ? t.processing : t.registerButton}
            </button>
            <div className="relative flex py-2 items-center">
              <div className="flex-grow border-t border-gray-300"></div>
              <span className="flex-shrink mx-4 text-gray-500 text-sm">{t.or}</span>
              <div className="flex-grow border-t border-gray-300"></div>
            </div>
            <button
              type="button"
              className="w-full bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-50 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 flex items-center justify-center"
            >
              <ShieldIcon /> {t.ssoButton.replace('Sign in', 'Sign up')}
            </button>
          </form>
          <p className="text-sm text-center mt-4 text-gray-600">
            {t.hasAccount}{' '}
            <Link href="/login" className="text-blue-500 hover:text-blue-700">
              {t.loginNow}
            </Link>
          </p>
        </div>
        <div className="flex justify-center mt-4 space-x-4">
          <button onClick={toggleTheme} className="text-gray-500 hover:text-gray-700">
            {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
          </button>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value as Language)}
            className="text-sm border border-gray-300 rounded-md px-2 py-1 bg-white"
          >
            <option value="en">English</option>
            <option value="vn">Tiếng Việt</option>
          </select>
        </div>
      </div>
    </main>
  );
}