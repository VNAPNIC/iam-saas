'use client';

import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { useAuthStore } from '@/stores/authStore';
import { useRouter, useParams } from 'next/navigation';
import { useEffect } from 'react';
import { useTenant } from '@/contexts/TenantContext';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuthStore();
  const router = useRouter();
  const params = useParams();
  const tenantKey = params.tenantKey as string;
  const { tenantConfig, isLoading: isTenantConfigLoading } = useTenant();

  useEffect(() => {
    // Redirect to onboarding if user is tenant admin and tenant is not onboarded
    // Assuming tenantConfig.isOnboarded is a field that comes from the backend
    // and user.role indicates if they are a tenant admin
    const TENANT_ADMIN_ROLE_ID = 'YOUR_TENANT_ADMIN_ROLE_ID'; // TODO: Replace with the actual RoleID for 'Tenant Admin'
    if (!isTenantConfigLoading && tenantConfig && !tenantConfig.isOnboarded && user?.RoleIDs?.includes(TENANT_ADMIN_ROLE_ID)) { // Check if user has Tenant Admin role
      router.push(`/${tenantKey}/onboarding`);
    }
  }, [user, router, tenantKey, tenantConfig, isTenantConfigLoading]);

  return (
    <ProtectedRoute>
      <div className="flex h-screen overflow-hidden">
        {/* Sidebar */}
        <Sidebar />
        {/* Container for header and content */}
        <div id="content-area" className="content-area flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <Header />
          {/* Main content area */}
          <main id="main-content" className="flex-1 overflow-y-auto p-4">
            <div>{children}</div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}