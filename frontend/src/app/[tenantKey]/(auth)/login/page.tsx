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

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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

    const handleLanguageChange = (value: string) => {
        i18n.changeLanguage(value);
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            const response = await authService.login({ ...formData, tenantKey });
            await login(response.data);
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
            <Card className="w-full">
                <CardHeader className="flex flex-col items-center justify-center text-center">
                    {tenantConfig?.logoUrl ? (
                        <img src={tenantConfig.logoUrl} alt={tenantConfig.name} className="w-12 h-12 object-contain mb-4" />
                    ) : (
                        <div className="w-12 h-12 bg-blue-500 rounded-md flex items-center justify-center text-white font-bold mb-4"
                            style={{ backgroundColor: tenantConfig?.primaryColor || '#3B82F6' }}>
                            <FaLock size="1.5em" />
                        </div>
                    )}
                    <CardTitle className="text-xl font-semibold text-gray-900">{tenantConfig?.name || t('login.title')}</CardTitle>
                    <p className="text-sm text-gray-500">{t('login.welcome')}</p>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleLogin} className="space-y-4">
                        <div>
                            <Label htmlFor="email">{t('login.emailLabel')}</Label>
                            <Input type="email" id="email" value={formData.email} onChange={handleChange} placeholder={t('login.emailPlaceholder')} required />
                        </div>
                        <div>
                            <Label htmlFor="password">{t('login.passwordLabel')}</Label>
                            <Input type="password" id="password" value={formData.password} onChange={handleChange} placeholder={t('login.passwordPlaceholder')} required />
                        </div>
                        <div className="flex items-center justify-between">
                            <Link href={`/${tenantKey}/forgot-password`} className="text-sm text-blue-500 hover:text-blue-700">{t('login.forgotPassword')}</Link>
                        </div>
                        <Button type="submit" disabled={loading} className="w-full"
                            style={{ backgroundColor: tenantConfig?.primaryColor || '#2563EB' }}>
                            {loading ? t('login.signingInButton') : t('login.signInButton')}
                        </Button>
                        <div className="relative flex py-2 items-center">
                            <div className="flex-grow border-t border-gray-300"></div>
                            <span className="flex-shrink mx-4 text-gray-500 text-sm">{t('login.orSeparator')}</span>
                            <div className="flex-grow border-t border-gray-300"></div>
                        </div>
                        <Button type="button" variant="outline" className="w-full flex items-center justify-center">
                            <FaShieldAlt className="mr-2" /> {t('login.ssoButton')}
                        </Button>
                    </form>
                    {error && <p data-testid="error-message" className="text-red-500 text-sm mt-4 text-center">{error}</p>}
                    <p className="text-sm text-center mt-4 text-gray-600">
                        {t('login.noAccount')} <Link href={`/${tenantKey}/signup`} className="text-blue-500 hover:text-blue-700">{t('login.signUpLink')}</Link>
                    </p>
                </CardContent>
            </Card>

            <div className="flex justify-center mt-4 space-x-4">
                <Button variant="ghost" onClick={toggleTheme} data-testid="theme-toggle">
                    {theme === 'dark' ? <FaSun /> : <FaMoon />}
                </Button>
                <Select onValueChange={handleLanguageChange} defaultValue={i18n.language}>
                    <SelectTrigger className="w-[100px]">
                        <SelectValue placeholder="Language" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="vi">Tiếng Việt</SelectItem>
                    </SelectContent>
                </Select>
            </div>
        </div>
    );
};

export default LoginPage;
