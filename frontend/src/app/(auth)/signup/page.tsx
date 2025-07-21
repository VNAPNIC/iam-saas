'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { authService, type AuthData } from '@/services/authService';
import toast from 'react-hot-toast';
import Link from 'next/link';

export default function SignUpPage() {
  const [tenantName, setTenantName] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { login } = useAuthStore();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      toast.error('Password must be at least 8 characters long.');
      return;
    }
    setLoading(true);

    try {
      const responseData = await authService.register({ tenantName, name, email, password });
      login(responseData.accessToken, responseData.user);
      toast.success('Account created successfully! Redirecting...');
      router.push('/dashboard');
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Sign up failed. Please try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div>
          <h2 className="auth-title" data-testid="signup-title">
            Create your account
          </h2>
          <p className="auth-subtitle">
            Already have an account?{' '}
            <Link href="/login" data-testid="login-link">
              Sign in
            </Link>
          </p>
        </div>
        <div className="mt-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="tenantName" className="form-label">
                Company Name
              </label>
              <input
                id="tenantName"
                name="tenantName"
                type="text"
                required
                className="form-input"
                value={tenantName}
                onChange={(e) => setTenantName(e.target.value)}
                data-testid="signup-tenant-name"
              />
            </div>
            <div>
              <label htmlFor="name" className="form-label">
                Full Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                className="form-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                data-testid="signup-full-name"
              />
            </div>
            <div>
              <label htmlFor="email" className="form-label">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="form-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                data-testid="signup-email"
              />
            </div>
            <div>
              <label htmlFor="password" className="form-label">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                className="form-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                data-testid="signup-password"
              />
            </div>

            {error && (
              <div
                className="p-3 mt-4 text-sm text-red-700 bg-red-100 border border-red-400 rounded"
                data-testid="signup-error"
              >
                {error}
              </div>
            )}

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="btn-primary"
                data-testid="signup-submit-button"
              >
                {loading ? 'Creating account...' : 'Create account'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}