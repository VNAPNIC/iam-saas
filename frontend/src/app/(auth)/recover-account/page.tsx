"use client";

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { KeyRound } from 'lucide-react';
import { authService } from '@/services/authService';

function RecoverAccountForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
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
            setError("No recovery token provided. Please request a new password reset link.");
        }
    }, [searchParams]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }
        if (!token) {
            setError("Recovery token is missing.");
            return;
        }

        setLoading(true);
        setError(null);
        setSuccessMessage(null);

        try {
            await authService.resetPassword({ token, newPassword: password });
            setSuccessMessage("Your password has been reset successfully! You can now sign in with your new password.");
            setTimeout(() => {
                router.push('/login');
            }, 3000);
        } catch (err: any) {
            setError(err.response?.data?.message || "Failed to reset password. The link may be invalid or expired.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full max-w-md">
            {successMessage ? (
                <p className="text-center text-green-600 bg-green-50 p-3 rounded-md">{successMessage}</p>
            ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                     <div>
                        <label htmlFor="password">New Password</label>
                        <input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                    </div>
                     <div>
                        <label htmlFor="confirmPassword">Confirm New Password</label>
                        <input type="password" id="confirmPassword" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
                    </div>
                    {error && <p>{error}</p>}
                    <button type="submit" disabled={loading || !token}>{loading ? 'Resetting...' : 'Set New Password'}</button>
                </form>
            )}
        </div>
    );
}

export default function RecoverAccountPage() {
    return (
        <div className="bg-gray-100 flex items-center justify-center min-h-screen">
            <div className="w-full max-w-md p-4">
                <div className="card bg-white rounded-lg shadow-lg p-6 border border-gray-200">
                    <div className="flex items-center justify-center mb-6">
                        <div className="w-12 h-12 bg-blue-500 rounded-md flex items-center justify-center text-white font-bold">
                            <KeyRound size={24} />
                        </div>
                        <div className="ml-4">
                            <h1 className="text-xl font-semibold text-gray-900">Set New Password</h1>
                            <p className="text-sm text-gray-500">Create a new password for your account</p>
                        </div>
                    </div>
                    <Suspense fallback={<div>Loading...</div>}>
                        <RecoverAccountForm />
                    </Suspense>
                    <p className="text-sm text-center mt-4 text-gray-600">
                        <Link href="/login" className="text-blue-500 hover:text-blue-700">Back to Sign In</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}