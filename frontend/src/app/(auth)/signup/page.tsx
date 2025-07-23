'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/services/authService';
import { FaUserPlus, FaMoon, FaSun, FaShieldAlt } from 'react-icons/fa';
import { useUIStore } from '@/stores/uiStore';
import { useTranslation } from 'react-i18next';

const SignupPage = () => {
    const { t, i18n } = useTranslation();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        tenantName: '',
    });
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const { theme, toggleTheme } = useUIStore();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setFormData((prev) => ({ ...prev, [id]: value }));
    };

    const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        i18n.changeLanguage(e.target.value);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            if (formData.password !== formData.confirmPassword) {
                throw new Error(t('signup.passwordMismatch'));
            }
            if (formData.password.length < 8) {
                throw new Error(t('signup.passwordTooShort'));
            }

            await authService.register(formData);
            alert(t('signup.successMessage'));
            router.push('/login');

        } catch (err: any) {
            // Handle custom validation errors or API errors
            const errorMessage = err.response?.data?.message || err.message || t('signup.genericError');
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full max-w-md p-4">
            <div className="card bg-white rounded-lg shadow-lg p-6 border border-gray-200">
                <div className="flex items-center justify-center mb-6">
                    <div className="w-12 h-12 bg-blue-500 rounded-md flex items-center justify-center text-white font-bold">
                        <FaUserPlus size="1.5em" />
                    </div>
                    <div className="ml-4">
                        <h1 className="text-xl font-semibold text-gray-900">{t('signup.title')}</h1>
                        <p className="text-sm text-gray-500">{t('signup.subtitle')}</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700">{t('signup.nameLabel')}</label>
                        <input type="text" id="name" value={formData.name} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm" placeholder={t('signup.namePlaceholder')} required />
                    </div>
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">{t('signup.emailLabel')}</label>
                        <input type="email" id="email" value={formData.email} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm" placeholder={t('signup.emailPlaceholder')} required />
                    </div>
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700">{t('signup.passwordLabel')}</label>
                        <input type="password" id="password" value={formData.password} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm" placeholder={t('signup.passwordPlaceholder')} required />
                    </div>
                    <div>
                        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">{t('signup.confirmPasswordLabel')}</label>
                        <input type="password" id="confirmPassword" value={formData.confirmPassword} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm" placeholder={t('signup.confirmPasswordPlaceholder')} required />
                    </div>
                     <div>
                        <label htmlFor="tenantName" className="block text-sm font-medium text-gray-700">{t('signup.tenantNameLabel')}</label>
                        <input type="text" id="tenantName" value={formData.tenantName} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm" placeholder={t('signup.tenantNamePlaceholder')} required />
                    </div>

                    {error && <p data-testid="error-message" className="error-message text-center text-red-500">{error}</p>}

                    <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-blue-400">
                        {loading ? t('signup.creatingAccountButton') : t('signup.signUpButton')}
                    </button>
                    <div className="relative flex py-2 items-center">
                        <div className="flex-grow border-t border-gray-300"></div>
                        <span className="flex-shrink mx-4 text-gray-500 text-sm">{t('signup.orSeparator')}</span>
                        <div className="flex-grow border-t border-gray-300"></div>
                    </div>
                    <button type="button" className="w-full bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-50 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 flex items-center justify-center">
                        <FaShieldAlt className="mr-2" /> {t('signup.ssoButton')}
                    </button>
                </form>
                <p className="text-sm text-center mt-4 text-gray-600">
                    {t('signup.hasAccount')} <Link href="/login" className="text-blue-500 hover:text-blue-700">{t('signup.signInLink')}</Link>
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

export default SignupPage;
