'use client';

import { useState, useEffect } from 'react';

const AccessKeyAlertsPage = () => {
    // Mock data for now
    const stats = {
        alerts: 3,
        suspiciousIPs: 2,
        revokedKeys: 1,
        whitelistedIPs: 10,
    };

    const alerts = [
        {
            id: '1',
            time: '2023-07-23 10:00:00',
            severity: 'High',
            type: 'Unusual IP Access',
            keyGroup: 'Internal CRM',
            ipAddress: '192.168.1.100',
        },
        {
            id: '2',
            time: '2023-07-23 09:30:00',
            severity: 'Medium',
            type: 'Excessive API Calls',
            keyGroup: 'Mobile App',
            ipAddress: '203.0.113.45',
        },
    ];

    return (
        <>
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Access Key Alerts & Monitoring</h1>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                <div className="card bg-white rounded-lg shadow p-4 border border-red-200">
                    <p className="text-sm font-medium text-gray-500">Alerts (24h)</p>
                    <p className="text-2xl font-semibold text-red-600">{stats.alerts}</p>
                </div>
                <div className="card bg-white rounded-lg shadow p-4 border border-yellow-200">
                    <p className="text-sm font-medium text-gray-500">Suspicious IPs</p>
                    <p className="text-2xl font-semibold text-yellow-600">{stats.suspiciousIPs}</p>
                </div>
                <div className="card bg-white rounded-lg shadow p-4 border border-blue-200">
                    <p className="text-sm font-medium text-gray-500">Revoked Keys</p>
                    <p className="text-2xl font-semibold text-blue-600">{stats.revokedKeys}</p>
                </div>
                <div className="card bg-white rounded-lg shadow p-4 border border-green-200">
                    <p className="text-sm font-medium text-gray-500">Whitelisted IPs</p>
                    <p className="text-2xl font-semibold text-green-600">{stats.whitelistedIPs}</p>
                </div>
            </div>

            <div className="card bg-white rounded-lg shadow border border-gray-200">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase">Time</th>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase">Severity</th>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase">Alert Type</th>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase">Key Group</th>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase">IP Address</th>
                                <th className="px-4 py-3 text-right text-xs font-medium uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {alerts.map((alert) => (
                                <tr key={alert.id}>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{alert.time}</td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{alert.severity}</td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{alert.type}</td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{alert.keyGroup}</td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{alert.ipAddress}</td>
                                    <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                                        <button className="text-blue-600 hover:text-blue-900 mr-3">View Details</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
};

export default AccessKeyAlertsPage;