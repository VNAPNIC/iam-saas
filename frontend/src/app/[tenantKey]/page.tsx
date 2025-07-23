'use client';

import { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';

export default function HomePage() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const params = useParams();
  const tenantKey = params.tenantKey as string;

  useEffect(() => {
    if (isAuthenticated) {
      router.replace(`/${tenantKey}/dashboard`);
    } else {
      router.replace(`/${tenantKey}/login`);
    }
  }, [isAuthenticated, router, tenantKey]);

  return (
    <div className="flex items-center justify-center w-full min-h-screen bg-gray-50">
      <p className="text-gray-500">Loading...</p>
    </div>
  );
}