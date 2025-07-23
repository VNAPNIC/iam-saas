"use client";

import { useAuth } from '@/contexts/AuthContext';
import { useRouter, useParams } from 'next/navigation';
import { useEffect, ReactNode } from 'react';

const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const tenantKey = params.tenantKey as string;

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push(`/${tenantKey}/login`);
    }
  }, [isAuthenticated, isLoading, router, tenantKey]);

  if (isLoading) {
    return (
        <div className="flex items-center justify-center min-h-screen">
            <p>Loading...</p>
        </div>
    );
  }

  if (isAuthenticated) {
    return <>{children}</>;
  }

  return null; 
};

export default ProtectedRoute;
