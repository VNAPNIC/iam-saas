'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FaLock, FaMoon, FaSun } from 'react-icons/fa';
import { useUIStore } from '@/stores/uiStore';
import { authService } from '@/services/authService';
import { useParams } from 'next/navigation';
import { useTenant } from '@/contexts/TenantContext';

export default function ForgotPasswordPage() {
    const { t, i18n } = useTranslation();
    const { theme, toggleTheme } = useUIStore();
    const [email, setEmail] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const params = useParams();
    const tenantKey = params.tenantKey as string;
    const { tenantConfig, isLoading: isTenantConfigLoading } = useTenant();

    const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        i18n.changeLanguage(e.target.value);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccessMessage(null);

        try {
            await authService.forgotPassword({ email });
            setSuccessMessage(t('forgotPassword.successMessage'));
        } catch (err: any) {
            setSuccessMessage(t('forgotPassword.successMessage'));
        } finally {
            setLoading(false);
        }
    };

    if (isTenantConfigLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <p>Loading tenant configuration...</p>
            </div>
        );
    }

    return (
        <div className="w-full max-w-md p-4">
            <div className="card bg-white rounded-lg shadow-lg p-6 border border-gray-200">
                <div className="flex items-center justify-center mb-6">
                    {tenantConfig?.logoUrl ? (
                        <img src={tenantConfig.logoUrl} alt={tenantConfig.name} className="w-12 h-12 object-contain" />
                    ) : (
                        <div className="w-12 h-12 bg-blue-500 rounded-md flex items-center justify-center text-white font-bold"
                             style={{ backgroundColor: tenantConfig?.primaryColor || '#3B82F6' }}>
                            <FaLock size="1.5em" />
                        </div>
                    )}
                    <div className="ml-4">
                        <h1 className="text-xl font-semibold text-gray-900">{tenantConfig?.name || t('forgotPassword.title')}</h1>
                        <p className="text-sm text-gray-500">{t('forgotPassword.subtitle')}</p>
                    </div>
                </div>

                {successMessage ? (
                    <p className="text-center text-green-600 bg-green-50 p-3 rounded-md">{successMessage}</p>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">{t('forgotPassword.emailLabel')}</label>
                            <input 
                                type="email" 
                                id="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                                placeholder={t('forgotPassword.emailPlaceholder')} 
                                required 
                            />
                            {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
                        </div>
                        <button 
                            type="submit"
                            disabled={loading}
                            className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-blue-400"
                            style={{ backgroundColor: tenantConfig?.primaryColor || '#2563EB' }}
                        >
                            {loading ? t('forgotPassword.sendingButton') : t('forgotPassword.sendButton')}
                        </button>
                    </form>
                )}

                <p className="text-sm text-center mt-4 text-gray-600">
                    {t('forgotPassword.rememberPassword')} <Link href={`/${tenantKey}/login`} className="text-blue-500 hover:text-blue-700">{t('forgotPassword.backToSignIn')}</Link>
                </p>
            </div>

            <div className="flex justify-center mt-4 space-x-4">
                <button onClick={toggleTheme} data-testid="theme-toggle" className="text-gray-500 hover:text-gray-700">
                    {theme === 'dark' ? <FaSun /> : <FaMoon />}
                </button>
                <select onChange={handleLanguageChange} defaultValue={i18n.language} className="text-sm border border-gray-300 rounded-md px-2 py-1 bg-white">
                    <option value="en">English</option>
                    <option value="vi">Tiếng Việt</option>
                </select>
            </div>
        </div>
    );
}