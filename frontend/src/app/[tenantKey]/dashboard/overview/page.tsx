'use client';

import { useState, useEffect } from 'react';
import { FaDownload, FaUsers, FaUserCheck, FaShieldAlt, FaClipboardList, FaPlug } from 'react-icons/fa';

const OverviewPage = () => {
    // Mock data for now
    const stats = {
        totalUsers: { value: 1248, trend: '+12.5%' },
        activeSessions: { value: 342, trend: '+8.2%' },
        mfaEnabled: { value: '89%', trend: '+15%' },
        auditEvents: { value: 2456, trend: '-3.2%' },
    };

    const recentActivity = [
        { id: '1', event: 'User Login', user: 'jane.doe@example.com', time: '2025-07-16 19:50:00', status: 'Success' },
        { id: '2', event: 'Role Updated', user: 'admin@example.com', time: '2025-07-16 19:35:00', status: 'Success' },
        { id: '3', event: 'Failed Login', user: 'unknown@example.com', time: '2025-07-16 18:50:00', status: 'Failed' },
        { id: '4', event: 'Password Reset', user: 'mike.smith@example.com', time: '2025-07-16 16:50:00', status: 'Success' },
        { id: '5', event: 'SSO Integration', user: 'admin@example.com', time: '2025-07-15 19:50:00', status: 'Success' },
    ];

    return (
        <>
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Overview</h1>
                <div className="flex space-x-2">
                    <button className="text-sm bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-50 flex items-center">
                        <FaDownload className="mr-2" /> Export Data
                    </button>
                </div>
            </div>

            <div className="card bg-white rounded-lg shadow p-4 border border-gray-200 mb-6">
                <div className="flex items-center space-x-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Time Range</label>
                        <select id="time-range" className="text-sm border border-gray-300 rounded-md px-3 py-2 bg-white">
                            <option value="day">Last 24 Hours</option>
                            <option value="week">Last 7 Days</option>
                            <option value="month">Last 30 Days</option>
                            <option value="custom">Custom</option>
                        </select>
                    </div>
                    <div id="custom-date-range" className="hidden flex space-x-2">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                            <input type="date" id="start-date" className="text-sm border border-gray-300 rounded-md px-3 py-2" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                            <input type="date" id="end-date" className="text-sm border border-gray-300 rounded-md px-3 py-2" />
                        </div>
                    </div>
                    <div className="flex items-end">
                        <button id="apply-filters" className="text-sm bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
                            Apply
                        </button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="card bg-white rounded-lg shadow p-4 border border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Total Users</p>
                            <p className="text-2xl font-semibold text-gray-900">{stats.totalUsers.value}</p>
                        </div>
                        <div className="p-3 rounded-full bg-blue-100 text-blue-500">
                            <FaUsers />
                        </div>
                    </div>
                    <div className="mt-2 flex items-center">
                        <span className="text-xs font-medium text-green-600">{stats.totalUsers.trend}</span>
                        <span className="text-xs text-gray-500 ml-1">from last month</span>
                    </div>
                    <div className="sparkline-container mt-2">
                        {/* <canvas id="total-users-sparkline"></canvas> */}
                    </div>
                </div>
                <div className="card bg-white rounded-lg shadow p-4 border border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Active Sessions</p>
                            <p className="text-2xl font-semibold text-gray-900">{stats.activeSessions.value}</p>
                        </div>
                        <div className="p-3 rounded-full bg-green-100 text-green-500">
                            <FaUserCheck />
                        </div>
                    </div>
                    <div className="mt-2 flex items-center">
                        <span className="text-xs font-medium text-green-600">{stats.activeSessions.trend}</span>
                        <span className="text-xs text-gray-500 ml-1">from last week</span>
                    </div>
                    <div className="sparkline-container mt-2">
                        {/* <canvas id="active-sessions-sparkline"></canvas> */}
                    </div>
                </div>
                <div className="card bg-white rounded-lg shadow p-4 border border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500">MFA Enabled</p>
                            <p className="text-2xl font-semibold text-gray-900">{stats.mfaEnabled.value}</p>
                        </div>
                        <div className="p-3 rounded-full bg-purple-100 text-purple-500">
                            <FaShieldAlt />
                        </div>
                    </div>
                    <div className="mt-2 flex items-center">
                        <span className="text-xs font-medium text-green-600">{stats.mfaEnabled.trend}</span>
                        <span className="text-xs text-gray-500 ml-1">since last quarter</span>
                    </div>
                    <div className="sparkline-container mt-2">
                        {/* <canvas id="mfa-enabled-sparkline"></canvas> */}
                    </div>
                </div>
                <div className="card bg-white rounded-lg shadow p-4 border border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Audit Events</p>
                            <p className="text-2xl font-semibold text-gray-900">{stats.auditEvents.value}</p>
                        </div>
                        <div className="p-3 rounded-full bg-yellow-100 text-yellow-500">
                            <FaClipboardList />
                        </div>
                    </div>
                    <div className="mt-2 flex items-center">
                        <span className="text-xs font-medium text-red-600">{stats.auditEvents.trend}</span>
                        <span className="text-xs text-gray-500 ml-1">from last month</span>
                    </div>
                    <div className="sparkline-container mt-2">
                        {/* <canvas id="audit-events-sparkline"></canvas> */}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="card bg-white rounded-lg shadow p-4 border border-gray-200 lg:col-span-2">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
                        <a href="#" className="text-sm text-blue-500 hover:text-blue-700">View All</a>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="table min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Event</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Time</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {recentActivity.map((activity) => (
                                    <tr key={activity.id}>
                                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{activity.event}</td>
                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{activity.user}</td>
                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{activity.time}</td>
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${activity.status === 'Success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{activity.status}</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
                
                <div className="card bg-white rounded-lg shadow p-4 border border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
                    <div className="space-y-3">
                        <a href="#" className="w-full flex items-center justify-between px-4 py-3 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 transition-colors">
                            <span className="font-medium">Invite User</span>
                            <FaUsers />
                        </a>
                        <a href="#" className="w-full flex items-center justify-between px-4 py-3 bg-purple-50 text-purple-600 rounded-md hover:bg-purple-100 transition-colors">
                            <span className="font-medium">Create Role</span>
                            <FaShieldAlt />
                        </a>
                        <a href="#" className="w-full flex items-center justify-between px-4 py-3 bg-green-50 text-green-600 rounded-md hover:bg-green-100 transition-colors">
                            <span className="font-medium">Configure MFA</span>
                            <FaShieldAlt />
                        </a>
                        <a href="#" className="w-full flex items-center justify-between px-4 py-3 bg-yellow-50 text-yellow-600 rounded-md hover:bg-yellow-100 transition-colors">
                            <span className="font-medium">View Audit Logs</span>
                            <FaClipboardList />
                        </a>
                        <a href="#" className="w-full flex items-center justify-between px-4 py-3 bg-indigo-50 text-indigo-600 rounded-md hover:bg-indigo-100 transition-colors">
                            <span className="font-medium">Setup Webhook</span>
                            <FaPlug />
                        </a>
                        <button className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 text-gray-600 rounded-md hover:bg-gray-100 transition-colors">
                            <span className="font-medium">Export Data</span>
                            <FaDownload />
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default OverviewPage;