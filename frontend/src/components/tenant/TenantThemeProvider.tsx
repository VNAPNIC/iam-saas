'use client';

import { useEffect } from 'react';
import { useUIStore } from '@/stores/uiStore';

export const TenantThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const { theme } = useUIStore();

  useEffect(() => {
    // Apply theme to document
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark-mode');
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark-mode');
    }
  }, [theme]);

  return <>{children}</>;
};