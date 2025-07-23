"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useParams } from 'next/navigation';
import { useTenantStore } from '@/stores/tenantStore';
import axios from 'axios';

interface TenantConfig {
  name: string;
  logoUrl: string | null;
  primaryColor: string | null;
  isOnboarded: boolean;
}

interface TenantContextType {
  tenantConfig: TenantConfig | null;
  isLoading: boolean;
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

export const TenantProvider = ({ children }: { children: ReactNode }) => {
  const { tenantKey } = useParams();
  const { config, setTenantConfig } = useTenantStore();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTenantConfig = async () => {
      if (!tenantKey) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080/api/v1'}/public/tenant-config/${tenantKey}`
        );
        setTenantConfig(response.data.data);
      } catch (error) {
        console.error("Failed to fetch tenant config:", error);
        setTenantConfig(null); // Clear config on error
      } finally {
        setIsLoading(false);
      }
    };

    if (!config) { // Only fetch if not already in store
      fetchTenantConfig();
    } else {
      setIsLoading(false);
    }
  }, [tenantKey, config, setTenantConfig]);

  const contextValue = {
    tenantConfig: config,
    isLoading,
  };

  return (
    <TenantContext.Provider value={contextValue}>
      {children}
    </TenantContext.Provider>
  );
};

export const useTenant = () => {
  const context = useContext(TenantContext);
  if (context === undefined) {
    throw new Error('useTenant must be used within a TenantProvider');
  }
  return context;
};