'use client';

import { useState, useEffect } from 'react';
import { FaDownload } from 'react-icons/fa';

const AuditLogsPage = () => {
    // Mock data for now
    const auditLogs = [
        {
            id: '1',
            action: 'role_updated',
            actor: 'admin@saas.com',
            target: 'Role: Editor',
            timestamp: '2025-07-17 14:30:00',
            ip: '192.168.1.1',
            details: 'Updated permissions for Editor role.',
            status: 'success',
        },
        {
            id: '2',
            action: 'login_success',
            actor: 'john.doe@acme.com',
            target: 'N/A',
            timestamp: '2025-07-17 14:25:10',
            ip: '203.0.113.25',
            details: 'Successful login via email/password.',
            status: 'success',
        },
        {
            id: '3',
            action: 'login_failed',
            actor: 'unknown@example.com',
            target: 'N/A',
            timestamp: '2025-07-17 14:22:05',
            ip: '198.51.100.10',
            details: 'Incorrect password.',
            status: 'failed',
        },
    ];

    return (
        <>
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Audit Logs</h1>
                <div className="flex space-x-2">
                    <button className="text-sm bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-50 flex items-center">
                        <FaDownload className="mr-2" /> Export Logs
                    </button>
                </div>
            </div>

            <div className="card bg-white rounded-lg shadow p-4 border border-gray-200 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Action</label>
                        <select id="action-filter" className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 bg-white">
                            <option value="">All</option>
                            <option value="login">Login</option>
                            <option value="user_created">User Created</option>
                            <option value="role_updated">Role Updated</option>
                            <option value="sso_updated">SSO Updated</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">User</label>
                        <input type="text" id="user-filter" placeholder="Email or user ID" className="w-full text-sm border border-gray-300 rounded-md px-3 py-2" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Time Range</label>
                        <input type="date" id="date-filter" className="w-full text-sm border border-gray-300 rounded-md px-3 py-2" />
                    </div>
                    <div className="flex items-end">
                        <button id="apply-filters" className="w-full text-sm bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
                            Filter
                        </button>
                    </div>
                </div>
            </div>

            <div className="card bg-white rounded-lg shadow border border-gray-200">
                <div className="p-4 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900">Log Details</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actor</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Target</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Time</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">IP</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Details</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {auditLogs.map((log) => (
                                <tr key={log.id}>
                                    <td className="px-6 py-4 whitespace-nowrap"><span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${log.status === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{log.action}</span></td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{log.actor}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{log.target}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{log.timestamp}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{log.ip}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{log.details}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
};

export default AuditLogsPage;