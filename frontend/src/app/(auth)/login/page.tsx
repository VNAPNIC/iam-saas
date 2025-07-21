'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { useUIStore, type Language } from '@/stores/uiStore';
import { authService } from '@/services/authService';
import toast from 'react-hot-toast';
import Link from 'next/link';

const translations = {
  vn: {
    title: "IAM SaaS",
    welcome: "Chào mừng trở lại!",
    emailLabel: "Email",
    emailPlaceholder: "nhap@email.com",
    passwordLabel: "Mật khẩu",
    passwordPlaceholder: "Nhập mật khẩu",
    forgotPassword: "Quên mật khẩu?",
    loginButton: "Đăng nhập",
    processing: "Đang xử lý...",
    or: "hoặc",
    ssoButton: "Đăng nhập với SSO",
    noAccount: "Chưa có tài khoản?",
    registerNow: "Đăng ký ngay"
  },
  en: {
    title: "IAM SaaS",
    welcome: "Welcome back!",
    emailLabel: "Email",
    emailPlaceholder: "enter@email.com",
    passwordLabel: "Password",
    passwordPlaceholder: "Enter password",
    forgotPassword: "Forgot password?",
    loginButton: "Login",
    processing: "Processing...",
    or: "or",
    ssoButton: "Login with SSO",
    noAccount: "No account yet?",
    registerNow: "Register now"
  }
};

const LockIcon = () => ( <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z" clipRule="evenodd" /></svg> );
const ShieldIcon = () => ( <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20"><path d="M10 12a2 2 0 100-4 2 2 0 000 4z" /><path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" /></svg> );
const MoonIcon = () => ( <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"></path></svg> );
const SunIcon = () => ( <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm-.707 7.072l.707-.707a1 1 0 10-1.414-1.414l-.707.707a1 1 0 001.414 1.414zM3 11a1 1 0 100-2H2a1 1 0 100 2h1z" clipRule="evenodd"></path></svg> );


export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuthStore();
  const { theme, language, toggleTheme, setLanguage } = useUIStore();
  const router = useRouter();

  const t = translations[language];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const responseData = await authService.login({ email, password });
      login(responseData.accessToken, responseData.user);
      toast.success('Login successful!');
      router.push('/dashboard');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex items-center justify-center min-h-screen">
      <div className="w-full max-w-md p-4">
        <div className="card bg-white rounded-lg shadow-lg p-6 border border-gray-200">
          <div className="flex items-center justify-center mb-6">
            <div className="w-12 h-12 bg-blue-500 rounded-md flex items-center justify-center text-white font-bold">
              <LockIcon />
            </div>
            <div className="ml-4">
              <h1 className="text-xl font-semibold text-gray-900">{t.title}</h1>
              <p className="text-sm text-gray-500">{t.welcome}</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">{t.emailLabel}</label>
              <input type="email" id="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm" placeholder={t.emailPlaceholder} data-testid="login-email"/>
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">{t.passwordLabel}</label>
              <input type="password" id="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm" placeholder={t.passwordPlaceholder} data-testid="login-password"/>
            </div>
            <div className="flex items-center justify-between">
              <a href="#" className="text-sm text-blue-500 hover:text-blue-700">{t.forgotPassword}</a>
            </div>
            <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-blue-400" data-testid="login-submit-button">
              {loading ? t.processing : t.loginButton}
            </button>
            <div className="relative flex py-2 items-center">
              <div className="flex-grow border-t border-gray-300"></div>
              <span className="flex-shrink mx-4 text-gray-500 text-sm">{t.or}</span>
              <div className="flex-grow border-t border-gray-300"></div>
            </div>
            <button type="button" className="w-full bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-50 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 flex items-center justify-center">
              <ShieldIcon /> {t.ssoButton}
            </button>
          </form>
          <p className="text-sm text-center mt-4 text-gray-600">
            {t.noAccount} <Link href="/signup" className="text-blue-500 hover:text-blue-700">{t.registerNow}</Link>
          </p>
        </div>

        <div className="flex justify-center mt-4 space-x-4">
          <button onClick={toggleTheme} className="text-gray-500 hover:text-gray-700">
            {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
          </button>
          <select value={language} onChange={(e) => setLanguage(e.target.value as Language)} className="text-sm border border-gray-300 rounded-md px-2 py-1 bg-white">
            <option value="en">English</option>
            <option value="vn">Tiếng Việt</option>
          </select>
        </div>
      </div>
    </main>
  );
}