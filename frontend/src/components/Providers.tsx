'use client';

// import { ThemeProvider } from "next-themes";

// Simple ThemeProvider replacement
const ThemeProvider = ({ children }: any) => <div>{children}</div>;

import { Toaster } from "@/components/ui/toaster";

// Add other client providers here if needed

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      {children}
      <Toaster />
    </ThemeProvider>
  );
}
