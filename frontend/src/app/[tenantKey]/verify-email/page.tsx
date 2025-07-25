"use client";

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams, useParams } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { authService } from '@/services/authService';

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = useParams();
  const tenantKey = params.tenantKey as string;
  const { t } = useTranslation();

  const [status, setStatus] = useState<'verifying' | 'success' | 'failed'>('verifying');
  const [message, setMessage] = useState(t('verifyEmail.pleaseWait'));

  useEffect(() => {
    const token = searchParams.get('token');

    const verifyToken = async () => {
      if (!token) {
        setStatus('failed');
        setMessage(t('verifyEmail.failedMessage'));
        return;
      }

      try {
        await authService.verifyEmail({ token });
        setStatus('success');
        setMessage(t('verifyEmail.successMessage'));
      } catch (err) {
        setStatus('failed');
        setMessage(t('verifyEmail.failedMessage'));
      }
    };

    verifyToken();
  }, [searchParams, t]);

  const handleActionButtonClick = () => {
    if (status === 'success') {
      router.push(`/${tenantKey}/login`);
    } else if (status === 'failed') {
      // Implement resend logic here if needed
      alert(t('verifyEmail.resendLink'));
    }
  };

  return (
    <div className="w-full max-w-md p-4">
      <Card className="text-center">
        <CardContent className="p-6">
          <div id="status-icon" className="mb-4">
            {status === 'verifying' && <i className="fas fa-spinner fa-spin fa-3x text-blue-500"></i>}
            {status === 'success' && <i className="fas fa-check-circle fa-3x text-green-500"></i>}
            {status === 'failed' && <i className="fas fa-times-circle fa-3x text-red-500"></i>}
          </div>

          <h1 id="status-title" className="text-xl font-semibold text-gray-900 mb-2">
            {status === 'verifying' && t('verifyEmail.verifying')}
            {status === 'success' && t('verifyEmail.successTitle')}
            {status === 'failed' && t('verifyEmail.failedTitle')}
          </h1>

          <p id="status-message" className="text-sm text-gray-600">{message}</p>

          <div className="mt-6">
            <Button
              id="action-button"
              onClick={handleActionButtonClick}
              className="w-full"
            >
              {status === 'success' && t('verifyEmail.goToLogin')}
              {status === 'failed' && t('verifyEmail.resendLink')}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <div className="bg-gray-100 flex items-center justify-center min-h-screen">
      <Suspense fallback={<div>Loading...</div>}>
        <VerifyEmailContent />
      </Suspense>
    </div>
  );
}
