"use client";

import { useAuthStore } from '@/stores/authStore';
import { useRouter, useParams } from 'next/navigation';
import { useEffect, ReactNode } from 'react';

const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();
  const params = useParams();
  const tenantKey = params.tenantKey as string;

  useEffect(() => {
    if (!isAuthenticated) {
      router.push(`/${tenantKey}/login`);
    }
  }, [isAuthenticated, router, tenantKey]);

  if (!isAuthenticated) {
    return null; 
  }

  return <>{children}</>;
};

export default ProtectedRoute;
