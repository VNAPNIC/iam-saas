"use client";
import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
                email,
                password
            });
            // Lưu token và chuyển hướng
            localStorage.setItem('accessToken', response.data.data.accessToken);
            window.location.href = '/dashboard';
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };
    
    // ... JSX được chuyển đổi từ login.html
    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {/* ... các input fields ... */}
            <button type="submit" disabled={loading} className="...">
                {loading ? 'Logging in...' : 'Đăng nhập'}
            </button>
        </form>
    );
}