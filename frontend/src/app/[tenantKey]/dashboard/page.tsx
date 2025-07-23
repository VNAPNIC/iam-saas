"use client";

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, Users, UserCheck, Shield, ClipboardList, UserPlus, Tag } from 'lucide-react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { useParams } from 'next/navigation';

interface StatCardProps {
    title: string;
    value: string;
    trend: string;
    icon: React.ElementType;
    color: string;
}

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
            <span className="text-xs font-medium text-green-600">{trend}</span> 
        </div>
        <div className="h-8 mt-2 bg-gray-100 rounded-md">{/* Placeholder for sparkline */}</div>
    </div>
);

const ActivityTable = () => {
    const { t } = useTranslation();
    return (
        <div className="overflow-x-auto">
            <table className="table min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('dashboardPage.event')}</th>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('dashboardPage.user')}</th>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('dashboardPage.time')}</th>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('dashboardPage.status')}</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    <tr>
                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{t('dashboardPage.userLogin')}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">jane.doe@example.com</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">2025-07-16 19:50:00</td>
                        <td className="px-4 py-3 whitespace-nowrap"><span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">{t('dashboardPage.success')}</span></td>
                    </tr>
                     <tr>
                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{t('dashboardPage.failedLogin')}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">unknown@example.com</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">2025-07-16 18:50:00</td>
                        <td className="px-4 py-3 whitespace-nowrap"><span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">{t('dashboardPage.failed')}</span></td>
                    </tr>
                </tbody>
            </table>
        </div>
    );
};

const QuickActions = () => {
    const { t } = useTranslation();
    const params = useParams();
    const tenantKey = params.tenantKey as string;
    return (
        <div className="space-y-3">
            <Link href={`/${tenantKey}/dashboard/users`} className="w-full flex items-center justify-between px-4 py-3 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 transition-colors">
                <span className="font-medium">{t('dashboardPage.inviteUser')}</span>
                <UserPlus className="h-5 w-5" />
            </Link>
             <Link href={`/${tenantKey}/dashboard/roles`} className="w-full flex items-center justify-between px-4 py-3 bg-purple-50 text-purple-600 rounded-md hover:bg-purple-100 transition-colors">
                <span className="font-medium">{t('dashboardPage.createRole')}</span>
                <Tag className="h-5 w-5" />
            </Link>
            <Link href={`/${tenantKey}/dashboard/settings`} className="w-full flex items-center justify-between px-4 py-3 bg-green-50 text-green-600 rounded-md hover:bg-green-100 transition-colors">
                <span className="font-medium">{t('dashboardPage.configureMFA')}</span>
                <Shield className="h-5 w-5" />
            </Link>
        </div>
    );
};

export default function DashboardOverviewPage() {
    const { user } = useAuth();
    const { t } = useTranslation();
    const params = useParams();
    const tenantKey = params.tenantKey as string;

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-gray-900">{t('dashboardPage.welcome', { name: user?.name || 'User' })}</h1>
                <button className="text-sm bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-50 flex items-center">
                    <Download className="mr-2 h-4 w-4" />
                    {t('dashboardPage.exportData')}
                </button>
            </div>

            <div className="card bg-white rounded-lg shadow p-4 border border-gray-200 mb-6">
                <div className="flex items-center space-x-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">{t('dashboardPage.timeRange')}</label>
                        <select className="text-sm border border-gray-300 rounded-md px-3 py-2 bg-white">
                            <option value="month">{t('dashboardPage.last30Days')}</option>
                            <option value="week">{t('dashboardPage.last7Days')}</option>
                            <option value="day">{t('dashboardPage.last24Hours')}</option>
                        </select>
                    </div>
                    <div className="flex items-end">
                        <button className="text-sm bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
                            {t('dashboardPage.apply')}
                        </button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <StatCard title={t('dashboardPage.totalUsers')} value="1,248" trend="+12.5%" icon={Users} color="text-blue-500" />
                <StatCard title={t('dashboardPage.activeSessions')} value="342" trend="+8.2%" icon={UserCheck} color="text-green-500" />
                <StatCard title={t('dashboardPage.mfaEnabled')} value="89%" trend="+15%" icon={Shield} color="text-purple-500" />
                <StatCard title={t('dashboardPage.auditEvents')} value="2,456" trend="-3.2%" icon={ClipboardList} color="text-yellow-500" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="card bg-white rounded-lg shadow p-4 border border-gray-200 lg:col-span-2">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-gray-900">{t('dashboardPage.recentActivity')}</h2>
                                    <Link href={`/${tenantKey}/dashboard/audit-logs`} className="text-sm text-blue-500 hover:text-blue-700">{t('dashboardPage.viewAll')}</Link>
                    </div>
                    <ActivityTable />
                </div>
                
                <div className="card bg-white rounded-lg shadow p-4 border border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('dashboardPage.quickActions')}</h2>
                    <QuickActions />
                </div>
            </div>
        </div>
    );
}