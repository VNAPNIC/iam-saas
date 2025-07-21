import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'; // Giả định có component Card
import { Users, Shield, Activity } from 'lucide-react';

// Giả định có component Card, nếu chưa có, bạn có thể tạo một file đơn giản
// tại src/components/ui/card.tsx hoặc thay thế bằng các thẻ div thông thường.

export default function DashboardPage() {
  return (
    <main className="flex-1 p-6">
      <h1 className="text-3xl font-bold mb-6">Overview</h1>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Card: Total Users */}
        <div className="p-4 bg-white rounded-lg shadow-md">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-full">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Users</p>
              <p className="text-2xl font-bold">1,257</p>
            </div>
          </div>
        </div>

        {/* Card: Active Roles */}
        <div className="p-4 bg-white rounded-lg shadow-md">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-full">
              <Shield className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Active Roles</p>
              <p className="text-2xl font-bold">15</p>
            </div>
          </div>
        </div>

        {/* Card: API Calls (24h) */}
        <div className="p-4 bg-white rounded-lg shadow-md">
          <div className="flex items-center">
            <div className="p-3 bg-yellow-100 rounded-full">
              <Activity className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">API Calls (24h)</p>
              <p className="text-2xl font-bold">89,123</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
