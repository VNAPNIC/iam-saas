"use client";

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'; // Card component có vẻ là một phần của cấu trúc, tôi sẽ giữ lại nó.
import { Download, Users, UserCheck, Shield, ClipboardList, UserPlus, Tag } from 'lucide-react';
import Link from 'next/link';

interface StatCardProps {
    title: string;
    value: string;
    trend: string;
    icon: React.ElementType;
    color: string;
}

// Component Card thống kê
const StatCard: React.FC<StatCardProps> = ({ title, value, trend, icon: Icon, color }) => (
    <div className="card bg-white rounded-lg shadow p-4 border border-gray-200">
        <div className="flex items-center justify-between">
            <div>
                <p className="text-sm font-medium text-gray-500">{title}</p>
                <p className="text-2xl font-semibold text-gray-900">{value}</p>
            </div>
            <div className={`p-3 rounded-full ${color.replace("text-", "bg-").replace("-500", "-100")} ${color}`}>
                <Icon className="h-5 w-5" />
            </div>
        </div>
        <div className="mt-2 flex items-center">
            {/* Logic để hiển thị màu trend xanh hoặc đỏ cần được thêm vào sau */}
            <span className="text-xs font-medium text-green-600">{trend}</span> 
        </div>
        <div className="h-8 mt-2 bg-gray-100 rounded-md">{/* Placeholder for sparkline */}</div>
    </div>
);

// Component Bảng hoạt động
const ActivityTable = () => (
    <div className="overflow-x-auto">
        <table className="table min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
                <tr>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Event</th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
                {/* Dữ liệu mẫu */}
                <tr>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">User Login</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">jane.doe@example.com</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">2025-07-16 19:50:00</td>
                    <td className="px-4 py-3 whitespace-nowrap"><span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Success</span></td>
                </tr>
                 <tr>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">Failed Login</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">unknown@example.com</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">2025-07-16 18:50:00</td>
                    <td className="px-4 py-3 whitespace-nowrap"><span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">Failed</span></td>
                </tr>
            </tbody>
        </table>
    </div>
);

// Component Hành động nhanh
const QuickActions = () => (
    <div className="space-y-3">
        <Link href="/dashboard/users" className="w-full flex items-center justify-between px-4 py-3 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 transition-colors">
            <span className="font-medium">Invite User</span>
            <UserPlus className="h-5 w-5" />
        </Link>
         <Link href="/dashboard/roles" className="w-full flex items-center justify-between px-4 py-3 bg-purple-50 text-purple-600 rounded-md hover:bg-purple-100 transition-colors">
            <span className="font-medium">Create Role</span>
            <Tag className="h-5 w-5" />
        </Link>
        <Link href="/dashboard/settings" className="w-full flex items-center justify-between px-4 py-3 bg-green-50 text-green-600 rounded-md hover:bg-green-100 transition-colors">
            <span className="font-medium">Configure MFA</span>
            <Shield className="h-5 w-5" />
        </Link>
    </div>
);

export default function DashboardOverviewPage() {
    const { user } = useAuth();

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Welcome, {user?.name || 'User'}!</h1>
                <button className="text-sm bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-50 flex items-center">
                    <Download className="mr-2 h-4 w-4" />
                    Export Data
                </button>
            </div>

            <div className="card bg-white rounded-lg shadow p-4 border border-gray-200 mb-6">
                <div className="flex items-center space-x-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Time Range</label>
                        <select className="text-sm border border-gray-300 rounded-md px-3 py-2 bg-white">
                            <option value="month">Last 30 Days</option>
                            <option value="week">Last 7 Days</option>
                            <option value="day">Last 24 Hours</option>
                        </select>
                    </div>
                    <div className="flex items-end">
                        <button className="text-sm bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
                            Apply
                        </button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <StatCard title="Total Users" value="1,248" trend="+12.5%" icon={Users} color="text-blue-500" />
                <StatCard title="Active Sessions" value="342" trend="+8.2%" icon={UserCheck} color="text-green-500" />
                <StatCard title="MFA Enabled" value="89%" trend="+15%" icon={Shield} color="text-purple-500" />
                <StatCard title="Audit Events" value="2,456" trend="-3.2%" icon={ClipboardList} color="text-yellow-500" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="card bg-white rounded-lg shadow p-4 border border-gray-200 lg:col-span-2">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
                        <Link href="/dashboard/audit-logs" className="text-sm text-blue-500 hover:text-blue-700">View All</Link>
                    </div>
                    <ActivityTable />
                </div>
                
                <div className="card bg-white rounded-lg shadow p-4 border border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
                    <QuickActions />
                </div>
            </div>
        </div>
    );
}