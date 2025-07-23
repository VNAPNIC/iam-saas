'use client';

import { useState, useEffect } from 'react';
import { FaShieldAlt, FaExclamationTriangle, FaUserLock, FaClipboardList } from 'react-icons/fa';

const SecurityDashboardPage = () => {
    // Mock data for now
    const stats = {
        securityAlerts: 5,
        anomalousSessions: 2,
        lockedAccounts: 1,
        activePolicies: 3,
    };

    const anomalies = [
        {
            icon: <FaExclamationTriangle className="text-yellow-500 mt-1 mr-3" />,
            title: 'Unusual Sign-in Location',
            description: 'Account john.doe@acme.com signed in from IP 103.22.11.5 (Vietnam), which is unusual.',
            bgColor: 'bg-yellow-50',
        },
        {
            icon: <FaUserLock className="text-red-500 mt-1 mr-3" />,
            title: 'Privilege Escalation Anomaly',
            description: 'User jane.cooper@beta.inc was assigned the "Admin" role outside of business hours.',
            bgColor: 'bg-red-50',
        },
    ];

    const criticalLogs = [
        {
            level: 'CRITICAL',
            message: 'Super Admin deleted Tenant "Gamma Ltd".',
            time: '10 minutes ago',
            color: 'text-red-600',
        },
        {
            level: 'HIGH',
            message: 'MFA reset for all users of Tenant "Acme Corp".',
            time: '1 hour ago',
            color: 'text-orange-500',
        },
        {
            level: 'HIGH',
            message: 'SSO integration deleted for Tenant "Acme Corp".',
            time: 'Yesterday',
            color: 'text-orange-500',
        },
    ];

    return (
        <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                <div className="card bg-white rounded-lg shadow p-4 border border-red-200">
                    <p className="text-sm font-medium text-gray-500">Security Alerts (24h)</p>
                    <p className="text-2xl font-semibold text-red-600">{stats.securityAlerts}</p>
                </div>
                <div className="card bg-white rounded-lg shadow p-4 border border-yellow-200">
                    <p className="text-sm font-medium text-gray-500">Anomalous Sessions</p>
                    <p className="text-2xl font-semibold text-yellow-600">{stats.anomalousSessions}</p>
                </div>
                <div className="card bg-white rounded-lg shadow p-4 border border-blue-200">
                    <p className="text-sm font-medium text-gray-500">Locked Accounts</p>
                    <p className="text-2xl font-semibold text-blue-600">{stats.lockedAccounts}</p>
                </div>
                <div className="card bg-white rounded-lg shadow p-4 border border-green-200">
                    <p className="text-sm font-medium text-gray-500">Active ABAC Policies</p>
                    <p className="text-2xl font-semibold text-green-600">{stats.activePolicies}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="card bg-white rounded-lg shadow p-4 border border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Anomaly Detection (AI)</h2>
                    <div className="space-y-4">
                        {anomalies.map((anomaly, index) => (
                            <div key={index} className={`flex items-start p-3 ${anomaly.bgColor} rounded-lg`}>
                                {anomaly.icon}
                                <div>
                                    <p className="text-sm font-medium text-gray-900">{anomaly.title}</p>
                                    <p className="text-xs text-gray-600">{anomaly.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                
                <div className="card bg-white rounded-lg shadow p-4 border border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Critical Audit Logs</h2>
                    <ul className="divide-y divide-gray-200 max-h-60 overflow-y-auto">
                        {criticalLogs.map((log, index) => (
                            <li key={index} className="py-2">
                                <p className="text-sm text-gray-800"><span className={`font-bold ${log.color}`}>[{log.level}]</span> {log.message}</p>
                                <p className="text-xs text-gray-500">{log.time}</p>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </>
    );
};

export default SecurityDashboardPage;