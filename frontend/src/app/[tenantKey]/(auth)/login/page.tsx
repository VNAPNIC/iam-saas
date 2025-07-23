'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { authService } from '@/services/authService';
import { FaLock, FaMoon, FaSun, FaShieldAlt } from 'react-icons/fa';
import { useUIStore } from '@/stores/uiStore';
import { useTranslation } from 'react-i18next';
import { useParams } from 'next/navigation';
import { useTenant } from '@/contexts/TenantContext';

const LoginPage = () => {
    const { t, i18n } = useTranslation();
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const { theme, toggleTheme } = useUIStore();
    const params = useParams();
    const tenantKey = params.tenantKey as string;
    const { tenantConfig, isLoading: isTenantConfigLoading } = useTenant();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setFormData((prev) => ({ ...prev, [id]: value }));
    };

    const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        i18n.changeLanguage(e.target.value);
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            const response = await authService.login({ ...formData, tenantKey });
            await login(response.data.accessToken, response.data.refreshToken, response.data.user, response.data.isOnboarded);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
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
                        <h1 className="text-xl font-semibold text-gray-900">{tenantConfig?.name || t('login.title')}</h1>
                        <p className="text-sm text-gray-500">{t('login.welcome')}</p>
                    </div>
                </div>

                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">{t('login.emailLabel')}</label>
                        <input type="email" id="email" value={formData.email} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm" placeholder={t('login.emailPlaceholder')} required />
                    </div>
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700">{t('login.passwordLabel')}</label>
                        <input type="password" id="password" value={formData.password} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm" placeholder={t('login.passwordPlaceholder')} required />
                    </div>
                    <div className="flex items-center justify-between">
                        <Link href={`/${tenantKey}/forgot-password`} className="text-sm text-blue-500 hover:text-blue-700">{t('login.forgotPassword')}</Link>
                    </div>
                    <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-blue-400"
                            style={{ backgroundColor: tenantConfig?.primaryColor || '#2563EB' }}>
                        {loading ? t('login.signingInButton') : t('login.signInButton')}
                    </button>
                    <div className="relative flex py-2 items-center">
                        <div className="flex-grow border-t border-gray-300"></div>
                        <span className="flex-shrink mx-4 text-gray-500 text-sm">{t('login.orSeparator')}</span>
                        <div className="flex-grow border-t border-gray-300"></div>
                    </div>
                    <button type="button" className="w-full bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-50 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 flex items-center justify-center">
                        <FaShieldAlt className="mr-2" /> {t('login.ssoButton')}
                    </button>
                </form>
                {error && <p data-testid="error-message" className="error-message mt-4 text-center text-red-500">{error}</p>}
                <p className="text-sm text-center mt-4 text-gray-600">
                    {t('login.noAccount')} <Link href={`/${tenantKey}/signup`} className="text-blue-500 hover:text-blue-700">{t('login.signUpLink')}</Link>
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
};

export default LoginPage;