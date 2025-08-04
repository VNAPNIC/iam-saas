'use client';

import { useState, useEffect, Suspense, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { publicApiClient } from '@/lib/apiClient';
import { AxiosError } from 'axios';
import { useTheme } from 'next-themes';
import { useUIStore } from '@/stores/uiStore';
import Link from 'next/link';

function VerifyEmailContent() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'expired' | 'info'>('loading');
  const [message, setMessage] = useState('');
  const [resending, setResending] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const email = searchParams.get('email');

  const { theme, setTheme } = useTheme();
  const { language, setLanguage } = useUIStore();

  const verifyEmail = useCallback(async (verificationToken: string) => {
    setStatus('loading');
    try {
      await publicApiClient.post('/auth/verify-email', { token: verificationToken });
      setStatus('success');
      setMessage('Email đã được xác thực thành công! Đang chuyển hướng...');
      setTimeout(() => router.push('/login'), 3000);
    } catch (err) {
      if (err instanceof AxiosError && err.response) {
        const errorData = err.response.data;
        setStatus(errorData.code === 'TOKEN_EXPIRED' ? 'expired' : 'error');
        setMessage(errorData.message || 'Xác thực thất bại.');
      } else {
        setStatus('error');
        setMessage('Đã xảy ra lỗi mạng.');
      }
    }
  }, [router]);

  useEffect(() => {
    if (token) {
      verifyEmail(token);
    } else if (email) {
      setStatus('info');
      setMessage('Một liên kết xác thực đã được gửi đến email của bạn. Vui lòng kiểm tra hộp thư đến (và cả thư mục spam).');
    } else {
        setStatus('error');
        setMessage('Không tìm thấy thông tin xác thực.');
    }
  }, [token, email, verifyEmail]);

  const resendVerification = async () => {
    if (!email) return;
    setResending(true);
    try {
      await publicApiClient.post('/auth/resend-verification', { email });
      setStatus('info');
      setMessage('Đã gửi lại liên kết xác thực mới! Vui lòng kiểm tra email.');
    } catch (err) {
      setStatus('error');
      setMessage('Không thể gửi lại liên kết xác thực.');
    } finally {
      setResending(false);
    }
  };

  const renderIcon = () => {
    switch (status) {
        case 'loading':
            return <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>;
        case 'success':
            return <i className="fas fa-check-circle text-5xl text-green-500 mb-4"></i>;
        case 'info':
            return <i className="fas fa-info-circle text-5xl text-blue-500 mb-4"></i>;
        case 'expired':
            return <i className="fas fa-clock text-5xl text-orange-500 mb-4"></i>;
        case 'error':
            return <i className="fas fa-times-circle text-5xl text-red-500 mb-4"></i>;
        default:
            return null;
    }
  }

  const renderTitle = () => {
    switch (status) {
        case 'loading':
            return "Đang xác thực...";
        case 'success':
            return "Xác thực thành công!";
        case 'info':
            return "Kiểm tra Email của bạn";
        case 'expired':
            return "Liên kết đã hết hạn";
        case 'error':
            return "Xác thực thất bại";
        default:
            return "";
    }
  }

  return (
    <div className="bg-gray-100 flex items-center justify-center min-h-screen">
        <div className="w-full max-w-md p-4">
            <div className="card bg-white rounded-lg shadow-lg p-6 border border-gray-200 text-center">
                <div className="flex items-center justify-center mb-6">
                    <div className="w-12 h-12 bg-blue-500 rounded-md flex items-center justify-center text-white font-bold">
                        <i className="fas fa-envelope-open-text fa-lg"></i>
                    </div>
                    <div className="ml-4 text-left">
                        <h1 className="text-xl font-semibold text-gray-900">Xác thực Email</h1>
                        <p className="text-sm text-gray-500">Bảo mật tài khoản của bạn</p>
                    </div>
                </div>

                <div className="mb-6">
                    {renderIcon()}
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">{renderTitle()}</h2>
                    <p className="text-gray-600">{message}</p>
                </div>

                {status === 'expired' && email && (
                    <button onClick={resendVerification} disabled={resending} className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 mb-4">
                        {resending ? 'Đang gửi...' : 'Gửi lại liên kết'}
                    </button>
                )}

                <div className="mt-6 pt-6 border-t border-gray-200">
                    <p className="text-sm text-gray-500">
                        Quay lại trang <Link href="/login" className="text-blue-500 hover:text-blue-700">Đăng nhập</Link>
                    </p>
                </div>
            </div>

            <div className="flex justify-center mt-4 space-x-4">
                <button id="dark-mode-toggle" className="text-gray-500 hover:text-gray-700" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
                    <i className={`fas ${theme === 'dark' ? 'fa-sun' : 'fa-moon'}`}></i>
                </button>
                <select id="language-selector" className="text-sm border border-gray-300 rounded-md px-2 py-1 bg-white" value={language} onChange={(e) => setLanguage(e.target.value as 'en' | 'vi')}>
                    <option value="en">English</option>
                    <option value="vi">Tiếng Việt</option>
                </select>
            </div>
        </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
        <div className="bg-gray-100 flex items-center justify-center min-h-screen">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
        </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  );
}