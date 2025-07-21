'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Shield, Activity, LogOut, User } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { useRouter } from 'next/navigation';
import { useTranslation } from '@/lib/i18n';
import Link from 'next/link';

export default function DashboardPage() {
  const { user, logout } = useAuthStore();
  const router = useRouter();
  const t = useTranslation();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <div className="flex min-h-screen">
      <aside className="w-64 bg-gray-800 text-white p-4">
        <div className="flex items-center mb-6">
          <h2 className="text-xl font-bold">{t.title}</h2>
        </div>
        <nav className="space-y-2">
          <Link href="/dashboard" className="flex items-center p-2 hover:bg-gray-700 rounded">
            <Users className="w-5 h-5 mr-2" />
            {t.dashboard}
          </Link>
          <Link href="/users" className="flex items-center p-2 hover:bg-gray-700 rounded">
            <Users className="w-5 h-5 mr-2" />
            {t.users}
          </Link>
          <Link href="/settings" className="flex items-center p-2 hover:bg-gray-700 rounded">
            <Shield className="w-5 h-5 mr-2" />
            {t.settings}
          </Link>
        </nav>
        <div className="absolute bottom-4 w-64 p-4">
          <button
            data-testid="sidebar-user-menu-button"
            className="flex items-center w-full p-2 hover:bg-gray-700 rounded"
          >
            <User className="w-5 h-5 mr-2" />
            {user?.name || 'User'}
          </button>
          <button
            data-testid="sidebar-logout-button"
            onClick={handleLogout}
            className="flex items-center w-full p-2 hover:bg-gray-700 rounded mt-2"
          >
            <LogOut className="w-5 h-5 mr-2" />
            {t.logout}
          </button>
        </div>
      </aside>

      <main className="flex-1 p-6 bg-gray-100">
        <h1 className="text-3xl font-bold mb-6">{t.dashboard}</h1>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-full">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <CardTitle className="ml-4 text-sm font-medium text-gray-500">Total Users</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">1,257</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex items-center">
              <div className="p-3 bg-green-100 rounded-full">
                <Shield className="w-6 h-6 text-green-600" />
              </div>
              <CardTitle className="ml-4 text-sm font-medium text-gray-500">Active Roles</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">15</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex items-center">
              <div className="p-3 bg-yellow-100 rounded-full">
                <Activity className="w-6 h-6 text-yellow-600" />
              </div>
              <CardTitle className="ml-4 text-sm font-medium text-gray-500">API Calls (24h)</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">89,123</p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}