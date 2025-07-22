"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { Lock } from 'lucide-react';
import { authService } from '@/services/authService'; // Sẽ thêm hàm forgotPassword vào đây

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccessMessage(null);

        try {
            await authService.forgotPassword({ email });
            setSuccessMessage("If your email exists in our system, you will receive a password reset link shortly.");
        } catch (err: any) {
            // Vẫn hiển thị thông báo thành công để bảo mật
            setSuccessMessage("If your email exists in our system, you will receive a password reset link shortly.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-gray-100 flex items-center justify-center min-h-screen">
            <div className="w-full max-w-md p-4">
                <div className="card bg-white rounded-lg shadow-lg p-6 border border-gray-200">
                    <div className="flex items-center justify-center mb-6">
                        <div className="w-12 h-12 bg-blue-500 rounded-md flex items-center justify-center text-white font-bold">
                            <Lock size={24} />
                        </div>
                        <div className="ml-4">
                            <h1 className="text-xl font-semibold text-gray-900">Reset Password</h1>
                            <p className="text-sm text-gray-500">Enter your email to receive a link</p>
                        </div>
                    </div>

                    {successMessage ? (
                        <p className="text-center text-green-600 bg-green-50 p-3 rounded-md">{successMessage}</p>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                                <input 
                                    type="email" 
                                    id="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                                    placeholder="name@company.com" 
                                    required 
                                />
                                {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
                            </div>
                            <button 
                                type="submit"
                                disabled={loading}
                                className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-blue-400"
                            >
                                {loading ? 'Sending...' : 'Send Reset Link'}
                            </button>
                        </form>
                    )}

                    <p className="text-sm text-center mt-4 text-gray-600">
                        Remember your password? <Link href="/login" className="text-blue-500 hover:text-blue-700">Back to Sign In</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
