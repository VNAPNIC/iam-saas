'use client';

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { useParams } from 'next/navigation';
import { useTheme } from 'next-themes';
import { tenantService } from '@/services/tenantService';
import { Tenant, TenantBranding } from '@/types/tenant';
import { useUIStore } from '@/stores/uiStore';

interface TenantBrandingContextType {
  tenant: Tenant | null;
  branding: TenantBranding | null;
  loading: boolean;
  error: string | null;
}

const TenantBrandingContext = createContext<TenantBrandingContextType>({
  tenant: null,
  branding: null,
  loading: true,
  error: null,
});

export const useTenantBranding = () => {
  const context = useContext(TenantBrandingContext);
  if (!context) {
    throw new Error('useTenantBranding must be used within TenantBrandingProvider');
  }
  return context;
};

interface TenantBrandingProviderProps {
  children: ReactNode;
}

export const TenantBrandingProvider = ({ children }: TenantBrandingProviderProps) => {
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [branding, setBranding] = useState<TenantBranding | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const params = useParams();
  const tenantPath = params.tenant_path as string;
  const { setLanguage } = useUIStore();
  const { setTheme } = useTheme();

  const applyBranding = useCallback((brandingData: TenantBranding, tenantData: Tenant) => {
    if (!brandingData) return;

    // Apply primary color
    if (brandingData.primaryColor) {
      document.documentElement.style.setProperty('--primary-color', brandingData.primaryColor);
    }

    // Apply custom CSS
    if (brandingData.customCSS) {
      const styleElement = document.createElement('style');
      styleElement.textContent = brandingData.customCSS;
      document.head.appendChild(styleElement);
    }

    // Set default language from tenant settings
    if (tenantData.emailConfig?.defaultLanguage) {
      setLanguage(tenantData.emailConfig.defaultLanguage as 'en' | 'vi');
    }

    // Apply dark mode setting from tenant settings
    if (tenantData.passwordPolicy?.darkModeEnabled !== undefined) {
      setTheme(tenantData.passwordPolicy.darkModeEnabled ? 'dark' : 'light');
    }
  }, [setLanguage, setTheme]);

  useEffect(() => {
    const loadTenantData = async () => {
      if (!tenantPath) return;

      try {
        setLoading(true);
        setError(null);

        // Load tenant config
        const tenantResponse = await tenantService.getTenantByDomain(tenantPath);
        setTenant(tenantResponse.data);

        // Load tenant branding
        const brandingResponse = await tenantService.getTenantBranding(tenantPath);
        const brandingData = brandingResponse.data as TenantBranding;
        setBranding(brandingData);

        // Apply branding
        applyBranding(brandingData, tenantResponse.data);

      } catch (err) {
        console.error('Error loading tenant data:', err);
        setError('Failed to load tenant configuration');
      } finally {
        setLoading(false);
      }
    };

    loadTenantData();
  }, [tenantPath, applyBranding]);


  return (
    <TenantBrandingContext.Provider value={{ tenant, branding, loading, error }}>
      {children}
    </TenantBrandingContext.Provider>
  );
};
