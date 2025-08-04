'use client';

import { useEffect } from 'react';
import { I18nextProvider } from 'react-i18next';
import i18n from '@/lib/i18n';
import { useUIStore } from '@/stores/uiStore';

export const LanguageProvider = ({ children }: { children: React.ReactNode }) => {
  const { language } = useUIStore();

  useEffect(() => {
    // Change language when uiStore language changes
    if (i18n.language !== language) {
      i18n.changeLanguage(language);
    }
  }, [language]);

  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
};