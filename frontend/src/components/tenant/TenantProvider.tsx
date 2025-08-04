'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { TenantConfig } from '@/types/tenant';
import { publicApiClient } from '@/lib/apiClient';
import { AxiosError } from 'axios';

interface TenantContextType {
  tenantConfig: TenantConfig | null;
  loading: boolean;
  error: string | null;
  refetchConfig: () => Promise<void>;
}

// const TenantContext = createContext<TenantContextType | undefined>(undefined);

interface TenantProviderProps {
  children: React.ReactNode;
  tenantPath: string;
}

export function TenantProvider({ children, tenantPath }: TenantProviderProps) {
  const [tenantConfig, setTenantConfig] = useState<TenantConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTenantConfig = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await publicApiClient.get(`/iam/${tenantPath}/public/config`);
      setTenantConfig(response.data);
    } catch (err) {
      if (err instanceof AxiosError && err.response) {
        if (err.response.status === 404) {
          setError('Organization not found');
        } else {
          setError(err.response.data.error || 'Failed to load organization configuration');
        }
      } else {
        setError('Network error occurred');
      }
    } finally {
      setLoading(false);
    }
  }, [tenantPath]);

  useEffect(() => {
    if (tenantPath) {
      fetchTenantConfig();
    }
  }, [tenantPath, fetchTenantConfig]);

  const contextValue: TenantContextType = {
    tenantConfig,
    loading,
    error,
    refetchConfig: fetchTenantConfig,
  };

  return (
    <div>
      {children}
    </div>
  );
}

export function useTenant() {
  // const context = useContext(TenantContext);
  // if (context === undefined) {
  //   throw new Error('useTenant must be used within a TenantProvider');
  // }
  // return context;
  return {
    tenantConfig: null,
    loading: false,
    error: null,
    refetchConfig: () => Promise.resolve()
  };
}

// HOC for tenant-aware components
export function withTenant<P extends object>(
  Component: React.ComponentType<P & { tenantConfig: TenantConfig | null }>
) {
  return function TenantAwareComponent(props: P) {
    const { tenantConfig } = useTenant();
    return <Component {...props} tenantConfig={tenantConfig} />;
  };
}