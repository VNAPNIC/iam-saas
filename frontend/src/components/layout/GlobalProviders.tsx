'use client';

import { useEffect } from 'react';
import { ThemeProvider } from '@/components/theme-provider';
import { LanguageProvider } from '@/components/layout/LanguageProvider';
import { useUIStore } from '@/stores/uiStore';
import { useTheme } from 'next-themes';

// Component để đồng bộ theme giữa next-themes và uiStore
function ThemeSync() {
  const { theme: uiTheme, setTheme: setUITheme } = useUIStore();
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    // One-way sync from next-themes to uiStore.
    // next-themes is the source of truth.
    if (resolvedTheme && resolvedTheme !== uiTheme) {
      setUITheme(resolvedTheme as 'light' | 'dark');
    }
  }, [resolvedTheme, uiTheme, setUITheme]);

  return null;
}

interface GlobalProvidersProps {
  children: React.ReactNode;
}

export function GlobalProviders({ children }: GlobalProvidersProps) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <LanguageProvider>
        <ThemeSync />
        {children}
      </LanguageProvider>
    </ThemeProvider>
  );
}