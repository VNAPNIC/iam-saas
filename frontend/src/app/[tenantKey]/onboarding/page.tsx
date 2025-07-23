"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { useUIStore } from '@/stores/uiStore';
import { useAuthStore } from '@/stores/authStore';
import { User } from '@/types/user';
import { userService } from '@/services/userService';
import toast from 'react-hot-toast';

interface InviteUserPayload {
    name: string;
    email: string;
    role: string;
}

export default function OnboardingWizardPage() {
    const { t } = useTranslation();
    const { theme, toggleTheme } = useUIStore();
    const router = useRouter();
    const params = useParams();
    const tenantKey = params.tenantKey as string;
    const { user } = useAuthStore();

    const [currentStep, setCurrentStep] = useState(1);
    const [tenantName, setTenantName] = useState(user?.name || '');
    const [primaryColor, setPrimaryColor] = useState('#4338ca');
    const [allowPublicSignup, setAllowPublicSignup] = useState(true);
    const [logoFile, setLogoFile] = useState<File | null>(null);
    const [memberEmail, setMemberEmail] = useState('');
    const [memberName, setMemberName] = useState('');
    const [memberRole, setMemberRole] = useState('Viewer');
    const [loading, setLoading] = useState(false);

    const handleNext = async () => {
        setLoading(true);
        try {
            if (currentStep === 1) {
                // Step 1: Customize Tenant
                // For now, only primaryColor and allowPublicSignup are handled via API
                // Logo upload would require a separate file upload mechanism
                await userService.updateProfile(tenantKey, { name: tenantName }); // Update tenant name via user profile for now
                await userService.updateTenantBranding(tenantKey, { primaryColor, allowPublicSignup });
                toast.success("Tenant settings updated!");
            } else if (currentStep === 2) {
                // Step 2: Invite Member
                const payload: InviteUserPayload = { name: memberName, email: memberEmail, role: memberRole };
                await userService.invite(tenantKey, payload);
                toast.success(`Invitation sent to ${memberEmail}`);
            }
            setCurrentStep(currentStep + 1);
        } catch (err: any) {
            toast.error(err.response?.data?.message || "An error occurred.");
        } finally {
            setLoading(false);
        }
    };

    const handlePrev = () => {
        setCurrentStep(currentStep - 1);
    };

    const handleFinish = () => {
        router.push(`/${tenantKey}/dashboard`);
    };

    const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setLogoFile(e.target.files[0]);
            // TODO: Implement actual logo upload to storage and get URL
        }
    };

    return (
        <div className="bg-gray-100 flex items-center justify-center min-h-screen">
            <button onClick={toggleTheme} className="fixed top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white bg-white dark:bg-gray-800 p-2 rounded-full shadow-md z-10">
                {theme === 'dark' ? <i className="fas fa-sun"></i> : <i className="fas fa-moon"></i>}
            </button>

            <div className="w-full max-w-2xl">
                <div className="card bg-white rounded-lg shadow-lg p-8">
                    <div className="mb-8">
                        <div className="flex items-center justify-between">
                            <div className={`step ${currentStep >= 1 ? 'active' : ''}`} data-step="1">
                                <div className="step-circle">1</div>
                                <p className="step-label">{t('onboarding.customize')}</p>
                            </div>
                            <div className={`flex-1 border-t-2 transition-colors duration-500 mx-4 ${currentStep >= 2 ? 'border-blue-500' : ''}`} id="progress-bar-1"></div>
                            <div className={`step ${currentStep >= 2 ? 'active' : ''}`} data-step="2">
                                <div className="step-circle">2</div>
                                <p className="step-label">{t('onboarding.inviteMembers')}</p>
                            </div>
                            <div className={`flex-1 border-t-2 transition-colors duration-500 mx-4 ${currentStep >= 3 ? 'border-blue-500' : ''}`} id="progress-bar-2"></div>
                            <div className={`step ${currentStep >= 3 ? 'active' : ''}`} data-step="3">
                                <div className="step-circle">3</div>
                                <p className="step-label">{t('onboarding.complete')}</p>
                            </div>
                        </div>
                    </div>

                    <div id="wizard-content">
                        {currentStep === 1 && (
                            <div id="step-1" className="wizard-step">
                                <h2 className="text-2xl font-bold mb-2 text-gray-900">{t('onboarding.customizeTitle')}</h2>
                                <p className="text-gray-600 mb-6">{t('onboarding.customizeSubtitle')}</p>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">{t('onboarding.tenantName')}</label>
                                        <input type="text" value={tenantName} onChange={(e) => setTenantName(e.target.value)} className="mt-1 block w-full border rounded-md p-2" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">{t('onboarding.companyLogo')}</label>
                                        <input type="file" onChange={handleLogoChange} className="mt-1 block w-full border rounded-md p-2 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">{t('onboarding.primaryColor')}</label>
                                        <input type="color" value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} className="mt-1 block w-full border rounded-md p-2" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">{t('onboarding.allowPublicSignup')}</label>
                                        <input type="checkbox" checked={allowPublicSignup} onChange={(e) => setAllowPublicSignup(e.target.checked)} className="mt-1 h-5 w-5 rounded text-blue-600" />
                                    </div>
                                </div>
                                <div className="mt-8 text-right">
                                    <button onClick={handleNext} disabled={loading} className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:bg-blue-400">
                                        {loading ? t('onboarding.saving') : t('onboarding.continue')}
                                    </button>
                                </div>
                            </div>
                        )}

                        {currentStep === 2 && (
                            <div id="step-2" className="wizard-step">
                                <h2 className="text-2xl font-bold mb-2 text-gray-900">{t('onboarding.inviteTitle')}</h2>
                                <p className="text-gray-600 mb-6">{t('onboarding.inviteSubtitle')}</p>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">{t('onboarding.memberEmail')}</label>
                                        <input type="email" value={memberEmail} onChange={(e) => setMemberEmail(e.target.value)} placeholder="email@example.com" className="mt-1 block w-full border rounded-md p-2" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">{t('onboarding.memberName')}</label>
                                        <input type="text" value={memberName} onChange={(e) => setMemberName(e.target.value)} placeholder="John Doe" className="mt-1 block w-full border rounded-md p-2" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">{t('onboarding.assignRole')}</label>
                                        <select value={memberRole} onChange={(e) => setMemberRole(e.target.value)} className="mt-1 block w-full border rounded-md p-2 bg-white">
                                            <option value="Admin">Admin</option>
                                            <option value="Editor">Editor</option>
                                            <option value="Viewer">Viewer</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="mt-8 flex justify-between">
                                    <button onClick={handlePrev} disabled={loading} className="bg-gray-200 text-gray-800 px-6 py-2 rounded-md hover:bg-gray-300 disabled:bg-gray-400">
                                        {t('onboarding.back')}
                                    </button>
                                    <button onClick={handleNext} disabled={loading} className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:bg-blue-400">
                                        {loading ? t('onboarding.sending') : t('onboarding.inviteAndContinue')}
                                    </button>
                                </div>
                            </div>
                        )}

                        {currentStep === 3 && (
                            <div id="step-3" className="wizard-step text-center">
                                <i className="fas fa-check-circle text-5xl text-green-500 mb-4"></i>
                                <h2 className="text-2xl font-bold mb-2 text-gray-900">{t('onboarding.setupCompleteTitle')}</h2>
                                <p className="text-gray-600 mb-6">{t('onboarding.setupCompleteSubtitle')}</p>
                                <div className="mt-8">
                                    <button onClick={handleFinish} className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 text-lg">
                                        {t('onboarding.goToDashboard')}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}