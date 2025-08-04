'use client';

import { useState, useEffect, Suspense, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { publicApiClient } from '@/lib/apiClient';
import { AxiosError } from 'axios';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { LanguageSelector } from '@/components/ui/language-selector';

function VerifyEmailContent() {
  const { t } = useTranslation();
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'expired' | 'info'>('loading');
  const [message, setMessage] = useState('');
  const [resending, setResending] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const email = searchParams.get('email');

  const verifyEmail = useCallback(async (verificationToken: string) => {
    setStatus('loading');
    try {
      await publicApiClient.post('/auth/verify-email', { token: verificationToken });
      setStatus('success');
      // Sử dụng key từ file JSON và thêm thông báo chuyển hướng
      setMessage(`${t('verifyEmail.successMessage')} ${t('verifyEmail.redirecting')}`);
      setTimeout(() => router.push('/login'), 3000);
    } catch (err) {
      if (err instanceof AxiosError && err.response) {
        const errorData = err.response.data;
        setStatus(errorData.code === 'TOKEN_EXPIRED' ? 'expired' : 'error');
        // Ưu tiên thông báo lỗi từ API, nếu không có thì dùng key dịch
        setMessage(errorData.message || t('verifyEmail.failedMessage'));
      } else {
        setStatus('error');
        setMessage(t('common.internal_server_error'));
      }
    }
  }, [router, t]);

  useEffect(() => {
    if (token) {
      verifyEmail(token);
    } else if (email) {
      setStatus('info');
      setMessage(t('verifyEmail.linkSent'));
    } else {
        setStatus('error');
        setMessage(t('verifyEmail.tokenNotFound'));
    }
  }, [token, email, verifyEmail, t]);

  const resendVerification = async () => {
    if (!email) return;
    setResending(true);
    try {
      await publicApiClient.post('/auth/resend-verification', { email });
      setStatus('info');
      setMessage(t('verifyEmail.resendSuccess'));
    } catch (err) {
      setStatus('error');
      setMessage(t('verifyEmail.resendFailed'));
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
            return t('verifyEmail.verifying');
        case 'success':
            return t('verifyEmail.successTitle');
        case 'info':
            return t('verifyEmail.checkEmailTitle');
        case 'expired':
            return t('verifyEmail.expiredTitle');
        case 'error':
            return t('verifyEmail.failedTitle');
        default:
            return "";
    }
  }

  return (
    <div className="bg-gray-100 dark:bg-gray-900 flex items-center justify-center min-h-screen">
        <div className="w-full max-w-md p-4">
            <div className="card bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700 text-center">
                <div className="flex items-center justify-center mb-6">
                    <div className="w-12 h-12 bg-blue-500 rounded-md flex items-center justify-center text-white font-bold">
                        <i className="fas fa-envelope-open-text fa-lg"></i>
                    </div>
                    <div className="ml-4 text-left">
                        <h1 className="text-xl font-semibold text-gray-900 dark:text-white">{t('verifyEmail.title')}</h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{t('verifyEmail.subtitle')}</p>
                    </div>
                </div>

                <div className="mb-6">
                    {renderIcon()}
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{renderTitle()}</h2>
                    <p className="text-gray-600 dark:text-gray-300">{message}</p>
                </div>

                {status === 'expired' && email && (
                    <button onClick={resendVerification} disabled={resending} className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 disabled:opacity-50 mb-4">
                        {resending ? t('verifyEmail.resending') : t('verifyEmail.resendLink')}
                    </button>
                )}

                <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        {t('verifyEmail.backTo')} <Link href="/login" className="text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-500">{t('login.signIn')}</Link>
                    </p>
                </div>
            </div>

            <div className="flex justify-center mt-4 space-x-4">
                <ThemeToggle />
                <LanguageSelector />
            </div>
        </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
        <div className="bg-gray-100 dark:bg-gray-900 flex items-center justify-center min-h-screen">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
        </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  );
}