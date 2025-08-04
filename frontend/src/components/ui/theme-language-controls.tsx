'use client';

import { ThemeToggle } from '@/components/ui/theme-toggle';
import { LanguageSelector } from '@/components/ui/language-selector';

interface ThemeLanguageControlsProps {
  className?: string;
  layout?: 'horizontal' | 'vertical';
}

export function ThemeLanguageControls({ 
  className = '', 
  layout = 'horizontal' 
}: ThemeLanguageControlsProps) {
  const containerClass = layout === 'horizontal' 
    ? 'flex items-center space-x-4' 
    : 'flex flex-col space-y-2';

  return (
    <div className={`${containerClass} ${className}`}>
      <ThemeToggle />
      <LanguageSelector />
    </div>
  );
}