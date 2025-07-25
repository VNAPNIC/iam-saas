"use client";

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter, useParams } from 'next/navigation';
import { KeyRound, Lock } from 'lucide-react';
import { authService } from '@/services/authService';
import { useTenant } from '@/contexts/TenantContext';
import { useTranslation } from 'react-i18next';
import { useUIStore } from '@/stores/uiStore';
import { FaMoon, FaSun } from 'react-icons/fa';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

function RecoverAccountForm() {
    const { t } = useTranslation();
    const router = useRouter();
    const searchParams = useSearchParams();
    const params = useParams();
    const tenantKey = params.tenantKey as string;
    const [token, setToken] = useState<string | null>(null);
    
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    useEffect(() => {
        const tokenFromUrl = searchParams.get('token');
        if (tokenFromUrl) {
            setToken(tokenFromUrl);
        } else {
            // If no token, assume user wants to use recovery code/security questions
            // This part will be handled by the main RecoverAccountPage component's tabs
        }
    }, [searchParams]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setError(t('recoverAccount.passwordMismatch'));
            return;
        }
        if (!token) {
            setError(t('recoverAccount.missingToken'));
            return;
        }

        setLoading(true);
        setError(null);
        setSuccessMessage(null);

        try {
            await authService.resetPassword({ token, newPassword: password });
            setSuccessMessage(t('recoverAccount.resetSuccess'));
            setTimeout(() => {
                router.push(`/${tenantKey}/login`);
            }, 3000);
        } catch (err: any) {
            setError(err.response?.data?.message || t('recoverAccount.resetError'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full">
            {successMessage ? (
                <p className="text-center text-green-600 bg-green-50 p-3 rounded-md">{successMessage}</p>
            ) : token ? (
                <form onSubmit={handleSubmit} className="space-y-4">
                     <div>
                        <Label htmlFor="password">{t('recoverAccount.newPasswordLabel')}</Label>
                        <Input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                    </div>
                     <div>
                        <Label htmlFor="confirmPassword">{t('recoverAccount.confirmNewPasswordLabel')}</Label>
                        <Input type="password" id="confirmPassword" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
                    </div>
                    {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
                    <Button type="submit" disabled={loading}>{loading ? t('recoverAccount.resettingButton') : t('recoverAccount.setPasswordButton')}</Button>
                </form>
            ) : (
                <p className="text-red-500 text-center">{t('recoverAccount.noTokenError')}</p>
            )}
        </div>
    );
}

export default function RecoverAccountPage() {
    const { t, i18n } = useTranslation();
    const { theme, toggleTheme } = useUIStore();
    const params = useParams();
    const tenantKey = params.tenantKey as string;
    const { tenantConfig, isLoading: isTenantConfigLoading } = useTenant();

    const handleLanguageChange = (value: string) => {
        i18n.changeLanguage(value);
    };

    if (isTenantConfigLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <p>Loading tenant configuration...</p>
            </div>
        );
    }

    return (
        <div className="flex items-center justify-center min-h-screen w-full">
            <div className="w-full max-w-md p-4">
                <Card className="w-full">
                    <CardHeader className="flex flex-col items-center justify-center text-center">
                        {tenantConfig?.logoUrl ? (
                            <img src={tenantConfig.logoUrl} alt={tenantConfig.name} className="w-12 h-12 object-contain mb-4" />
                        ) : (
                            <div className="w-12 h-12 bg-blue-500 rounded-md flex items-center justify-center text-white font-bold mb-4"
                                 style={{ backgroundColor: tenantConfig?.primaryColor || '#3B82F6' }}>
                                <Lock size="1.5em" />
                            </div>
                        )}
                        <CardTitle className="text-xl font-semibold text-gray-900">{t('recoverAccount.title')}</CardTitle>
                        <p className="text-sm text-gray-500">{t('recoverAccount.subtitle')}</p>
                    </CardHeader>
                    <CardContent>
                        <Tabs defaultValue="recovery-code" className="w-full">
                            <TabsList className="grid w-full grid-cols-2">
                                <TabsTrigger value="recovery-code">{t('recoverAccount.recoveryCodeTab')}</TabsTrigger>
                                <TabsTrigger value="security-questions">{t('recoverAccount.securityQuestionsTab')}</TabsTrigger>
                            </TabsList>
                            <TabsContent value="recovery-code" className="mt-4">
                                <form className="space-y-4">
                                    <div>
                                        <Label htmlFor="recovery-code">{t('recoverAccount.recoveryCodeLabel')}</Label>
                                        <Input type="text" id="recovery-code" placeholder={t('recoverAccount.recoveryCodePlaceholder')} />
                                    </div>
                                    <Button type="submit" className="w-full">{t('recoverAccount.verifyButton')}</Button>
                                </form>
                            </TabsContent>
                            <TabsContent value="security-questions" className="mt-4">
                                <form className="space-y-4">
                                    <div>
                                        <Label htmlFor="question1">{t('recoverAccount.securityQuestion1')}</Label>
                                        <Input type="text" id="question1" />
                                    </div>
                                    <div>
                                        <Label htmlFor="question2">{t('recoverAccount.securityQuestion2')}</Label>
                                        <Input type="text" id="question2" />
                                    </div>
                                    <Button type="submit" className="w-full">{t('recoverAccount.verifyButton')}</Button>
                                </form>
                            </TabsContent>
                        </Tabs>
                        
                        <Suspense fallback={<div>Loading form...</div>}>
                            <RecoverAccountForm />
                        </Suspense>

                        <p className="text-sm text-center mt-4 text-gray-600">
                            <Link href={`/${tenantKey}/login`} className="text-blue-500 hover:text-blue-700">{t('recoverAccount.backToSignIn')}</Link>
                        </p>
                    </CardContent>
                </Card>
            </div>

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
