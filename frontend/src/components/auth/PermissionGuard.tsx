'use client';

import { useAuth } from '@/hooks/useAuth';
import { ReactNode } from 'react';

interface PermissionGuardProps {
  permission?: string;
  role?: string;
  requireSuperAdmin?: boolean;
  requireTenantAdmin?: boolean;
  children: ReactNode;
  fallback?: ReactNode;
}

export const PermissionGuard = ({
  permission,
  role,
  requireSuperAdmin = false,
  requireTenantAdmin = false,
  children,
  fallback = null,
}: PermissionGuardProps) => {
  const { hasPermission, hasRole, isSuperAdmin, isTenantAdmin, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <>{fallback}</>;
  }

  // Check super admin requirement
  if (requireSuperAdmin && !isSuperAdmin()) {
    return <>{fallback}</>;
  }

  // Check tenant admin requirement
  if (requireTenantAdmin && !isTenantAdmin() && !isSuperAdmin()) {
    return <>{fallback}</>;
  }

  // Check specific permission
  if (permission && !hasPermission(permission)) {
    return <>{fallback}</>;
  }

  // Check specific role
  if (role && !hasRole(role)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};