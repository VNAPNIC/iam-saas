import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface TenantConfig {
  name: string;
  logoUrl: string | null;
  primaryColor: string | null;
  isOnboarded: boolean;
}

interface TenantState {
  config: TenantConfig | null;
  setTenantConfig: (config: TenantConfig | null) => void;
}

export const useTenantStore = create<TenantState>()(
  persist(
    (set) => ({
      config: null,
      setTenantConfig: (config) => set({ config }),
    }),
    { name: 'tenant-config-storage' }
  )
);