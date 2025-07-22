"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { authService } from '@/services/authService';

const LoginPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await authService.login(formData);
      // Gọi hàm login từ context để lưu token và thông tin user
      await login(response.data.token);
      // Chuyển hướng đã được xử lý bên trong hàm login của context

    } catch (err: any) {
      setError(err.response?.data?.message || "Login failed. Please check your credentials.");
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-4">
        <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
          <div className="flex items-center justify-center mb-6">
             <div className="w-12 h-12 bg-blue-500 rounded-md flex items-center justify-center text-white font-bold">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 0 1 3 3m3 0a6 6 0 0 1-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1 1 21.75 8.25Z" />
                </svg>
            </div>
            <div className="ml-4">
              <h1 className="text-xl font-semibold text-gray-900">Sign In</h1>
              <p className="text-sm text-gray-500">Welcome back</p>
            </div>
          </div>

          {error && <p className="bg-red-100 text-red-700 p-3 rounded-md mb-4 text-sm">{error}</p>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email Address</label>
              <input type="email" id="email" value={formData.email} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm" placeholder="name@company.com" required />
            </div>
            <div>
                <div className="flex items-center justify-between">
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
                    <Link href="/forgot-password" className="text-sm text-blue-500 hover:text-blue-700">Forgot password?</Link>
                </div>
                <input type="password" id="password" value={formData.password} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm" placeholder="Your password" required />
            </div>
            <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-blue-400">
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>

          <p className="text-sm text-center mt-4 text-gray-600">
            Don't have an account? <Link href="/signup" className="text-blue-500 hover:text-blue-700">Sign Up</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
