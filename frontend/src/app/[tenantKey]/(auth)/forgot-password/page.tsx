'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FaLock, FaMoon, FaSun } from 'react-icons/fa';
import { useUIStore } from '@/stores/uiStore';
import { authService } from '@/services/authService';
import { useParams } from 'next/navigation';
import { useTenant } from '@/contexts/TenantContext';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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

    const handleLanguageChange = (value: string) => {
        i18n.changeLanguage(value);
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
            setSuccessMessage(t('forgotPassword.successMessage')); // Always show success message for security reasons
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
                    <CardTitle className="text-xl font-semibold text-gray-900">{tenantConfig?.name || t('forgotPassword.title')}</CardTitle>
                    <p className="text-sm text-gray-500">{t('forgotPassword.subtitle')}</p>
                </CardHeader>
                <CardContent>
                    {successMessage ? (
                        <p className="text-center text-green-600 bg-green-50 p-3 rounded-md">{successMessage}</p>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <Label htmlFor="email">{t('forgotPassword.emailLabel')}</Label>
                                <Input 
                                    type="email" 
                                    id="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder={t('forgotPassword.emailPlaceholder')} 
                                    required 
                                />
                                {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
                            </div>
                            <Button 
                                type="submit"
                                disabled={loading}
                                className="w-full"
                                style={{ backgroundColor: tenantConfig?.primaryColor || '#2563EB' }}
                            >
                                {loading ? t('forgotPassword.sendingButton') : t('forgotPassword.sendButton')}
                            </Button>
                            <div className="relative flex py-2 items-center">
                                <div className="flex-grow border-t border-gray-300"></div>
                                <span className="flex-shrink mx-4 text-gray-500 text-sm">{t('forgotPassword.orSeparator')}</span>
                                <div className="flex-grow border-t border-gray-300"></div>
                            </div>
                            <Link href={`/${tenantKey}/recover-account`} className="w-full block text-center bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-50 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2">
                                {t('forgotPassword.useRecoveryCode')}
                            </Link>
                        </form>
                    )}

                    <p className="text-sm text-center mt-4 text-gray-600">
                        {t('forgotPassword.rememberPassword')} <Link href={`/${tenantKey}/login`} className="text-blue-500 hover:text-blue-700">{t('forgotPassword.backToSignIn')}</Link>
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
}
