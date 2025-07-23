'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { authService } from '@/services/authService';
import toast from 'react-hot-toast';

function AcceptInvitationForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error('Passwords do not match.');
      return;
    }
    if (!token) {
      toast.error('Invalid invitation token.');
      return;
    }
    setLoading(true);
    try {
      await authService.acceptInvitation({ token, password });
      toast.success('Invitation accepted! You can now log in.');
      router.push('/login');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to accept invitation.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md dark:bg-gray-800">
      <h1 className="text-2xl font-bold text-center text-gray-900 dark:text-white">Accept Invitation</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">New Password</label>
          <input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1 block w-full border rounded-md p-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white" required />
        </div>
        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Confirm New Password</label>
          <input type="password" id="confirmPassword" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="mt-1 block w-full border rounded-md p-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white" required />
        </div>
        <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-blue-400">
          {loading ? 'Setting Password...' : 'Set Password and Join'}
        </button>
      </form>
    </div>
  );
}

export default function AcceptInvitationPage() {
    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
            <Suspense fallback={<div>Loading...</div>}>
                <AcceptInvitationForm />
            </Suspense>
        </div>
    )
}