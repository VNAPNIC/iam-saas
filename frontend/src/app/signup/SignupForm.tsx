
"use client";

import Link from 'next/link';
import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslation } from 'react-i18next';

import { publicApiClient } from '@/lib/apiClient';
import { AxiosError } from 'axios';
import { LanguageSelector } from '@/components/ui/language-selector';
import { ThemeToggle } from '@/components/ui/theme-toggle';

function SignupFormContent() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    companyName: '',
    tenantKey: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedPlan = searchParams.get('plan') || 'starter';
  const { t } = useTranslation();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = t('signup.nameLabel') + ' is required';
    if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Valid email is required';
    if (formData.password.length < 8) newErrors.password = t('signup.passwordTooShort');
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = t('signup.passwordMismatch');
    if (!formData.companyName.trim()) newErrors.companyName = t('signup.tenantNameLabel') + ' is required';
    if (!formData.tenantKey.trim()) {
      newErrors.tenantKey = 'Tenant key is required';
    } else if (!/^[a-z0-9-]+$/.test(formData.tenantKey)) {
      newErrors.tenantKey = 'Tenant key can only contain lowercase letters, numbers, and hyphens';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);
    try {
      await publicApiClient.post('/auth/signup', { ...formData, plan: selectedPlan });
      router.push('/verify-email?email=' + encodeURIComponent(formData.email) + '&message=signup_success');
    } catch (err) {
      if (err instanceof AxiosError && err.response) {
        const errorData = err.response.data;
        setErrors(errorData.field ? { [errorData.field]: errorData.error } : { general: errorData.error || 'Signup failed' });
      } else {
        setErrors({ general: 'Network error occurred' });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 py-12">
      <div className="w-full max-w-md p-4">
        {/* Theme and Language Controls */}
        <div className="flex justify-center mt-4 space-x-4">
          <ThemeToggle />
          <LanguageSelector />
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-center mb-6">
            <div className="w-12 h-12 bg-blue-500 rounded-md flex items-center justify-center text-white font-bold">
              <i className="fas fa-user-plus fa-lg"></i>
            </div>
            <div className="ml-4">
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white">{t('signup.title')}</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">{t('signup.subtitle')}</p>
            </div>
          </div>
          <div className="mb-6 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-md">
            <p className="text-sm text-blue-800 dark:text-blue-300">
              Selected Plan: <span className="font-semibold capitalize">{selectedPlan}</span>
            </p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('signup.nameLabel')}</label>
              <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white" placeholder={t('signup.namePlaceholder')} required />
              {errors.name && <p className="text-red-600 dark:text-red-400 text-xs mt-1">{errors.name}</p>}
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('signup.emailLabel')}</label>
              <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white" placeholder={t('signup.emailPlaceholder')} required />
              {errors.email && <p className="text-red-600 dark:text-red-400 text-xs mt-1">{errors.email}</p>}
            </div>
            <div>
              <label htmlFor="companyName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('signup.tenantNameLabel')}</label>
              <input type="text" id="companyName" name="companyName" value={formData.companyName} onChange={handleChange} className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white" placeholder={t('signup.tenantNamePlaceholder')} required />
              {errors.companyName && <p className="text-red-600 dark:text-red-400 text-xs mt-1">{errors.companyName}</p>}
            </div>
            <div>
              <label htmlFor="tenantKey" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Tenant Key</label>
              <input type="text" id="tenantKey" name="tenantKey" value={formData.tenantKey} onChange={handleChange} className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white" placeholder="acme-corp" required />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">This will be your unique identifier: domain.xyz/{formData.tenantKey || 'your-key'}</p>
              {errors.tenantKey && <p className="text-red-600 dark:text-red-400 text-xs mt-1">{errors.tenantKey}</p>}
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('signup.passwordLabel')}</label>
              <input type="password" id="password" name="password" value={formData.password} onChange={handleChange} className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white" placeholder={t('signup.passwordPlaceholder')} required />
              {errors.password && <p className="text-red-600 dark:text-red-400 text-xs mt-1">{errors.password}</p>}
            </div>
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('signup.confirmPasswordLabel')}</label>
              <input type="password" id="confirmPassword" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white" placeholder={t('signup.confirmPasswordPlaceholder')} required />
              {errors.confirmPassword && <p className="text-red-600 dark:text-red-400 text-xs mt-1">{errors.confirmPassword}</p>}
            </div>
            <button type="submit" disabled={loading} className="w-full bg-blue-600 dark:bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-700 dark:hover:bg-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50">
              {loading ? t('signup.creatingAccountButton') : t('signup.signUpButton')}
            </button>
          </form>
          <p className="text-sm text-center mt-4 text-gray-600 dark:text-gray-400">
            {t('signup.hasAccount')}{' '}
            <Link href="/login" className="text-blue-500 hover:text-blue-700 dark:text-blue-400">{t('signup.signInLink')}</Link>
          </p>
          {errors.general && <p className="text-sm text-center mt-4 text-red-600 dark:text-red-400">{errors.general}</p>}
        </div>
        <div className="flex justify-center mt-4 space-x-4">
          <ThemeToggle />
          <LanguageSelector />
        </div>
      </div>
    </div>
  );
}

export default function SignupForm() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SignupFormContent />
    </Suspense>
  );
}
