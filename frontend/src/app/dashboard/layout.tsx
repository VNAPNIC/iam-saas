"use client";
import React from 'react';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
// import { AuthProvider } from '@/contexts/AuthContext'; // Sẽ cần context để quản lý auth

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // <AuthProvider>
      <div className="flex h-screen overflow-hidden bg-gray-100 dark:bg-gray-900">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header />
          <main className="flex-1 overflow-y-auto p-4 md:p-6">
            {children} 
          </main>
        </div>
      </div>
    // </AuthProvider>
  );
}