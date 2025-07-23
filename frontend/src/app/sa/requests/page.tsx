'use client';

import { useState, useEffect } from 'react';
import { requestService } from '@/services/requestService';
import { TenantRequest, QuotaRequest } from '@/types/request';

const RequestManagementPage = () => {
    const [tenantRequests, setTenantRequests] = useState<TenantRequest[]>([]);
    const [quotaRequests, setQuotaRequests] = useState<QuotaRequest[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState('tenant');

    useEffect(() => {
        const fetchRequests = async () => {
            try {
                setIsLoading(true);
                const [tenantRes, quotaRes] = await Promise.all([
                    requestService.listTenantRequests(),
                    requestService.listQuotaRequests(),
                ]);
                setTenantRequests(tenantRes.data);
                setQuotaRequests(quotaRes.data);
            } catch (err) {
                setError('Failed to fetch requests.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchRequests();
    }, []);

    if (isLoading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>{error}</div>;
    }

    return (
        <>
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Request Inbox</h1>
            </div>

            <div className="mb-4 border-b border-gray-200">
                <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                    <button onClick={() => setActiveTab('tenant')} className={`tab ${activeTab === 'tenant' ? 'active' : ''}`}>
                        Tenant Approvals
                        <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-medium ${activeTab === 'tenant' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>{tenantRequests.length}</span>
                    </button>
                    <button onClick={() => setActiveTab('quota')} className={`tab ${activeTab === 'quota' ? 'active' : ''}`}>
                        Quota Requests
                        <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-medium ${activeTab === 'quota' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>{quotaRequests.length}</span>
                    </button>
                </nav>
            </div>

            {activeTab === 'tenant' && (
                <div className="card bg-white rounded-lg shadow border border-gray-200">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase">Tenant Name</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase">Plan</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase">Admin Email</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase">Request Date</th>
                                    <th className="px-4 py-3 text-right text-xs font-medium uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {tenantRequests.map((request) => (
                                    <tr key={request.id}>
                                        <td className="px-4 py-3 font-medium">{request.tenantName}</td>
                                        <td className="px-4 py-3">{request.plan}</td>
                                        <td className="px-4 py-3">{request.adminEmail}</td>
                                        <td className="px-4 py-3">{request.requestDate}</td>
                                        <td className="px-4 py-3 text-right space-x-2">
                                            <button className="text-sm bg-green-500 text-white px-3 py-1 rounded-md">Approve</button>
                                            <button className="text-sm bg-red-500 text-white px-3 py-1 rounded-md">Deny</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {activeTab === 'quota' && (
                <div className="card bg-white rounded-lg shadow border border-gray-200">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase">Tenant</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase">Quota Type</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase">Requested Amount</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase">Reason</th>
                                    <th className="px-4 py-3 text-right text-xs font-medium uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {quotaRequests.map((request) => (
                                    <tr key={request.id}>
                                        <td className="px-4 py-3 font-medium">{request.tenantName}</td>
                                        <td className="px-4 py-3">{request.quotaType}</td>
                                        <td className="px-4 py-3 font-semibold">{request.requestedAmount}</td>
                                        <td className="px-4 py-3">{request.reason}</td>
                                        <td className="px-4 py-3 text-right space-x-2">
                                            <button className="text-sm bg-green-500 text-white px-3 py-1 rounded-md">Approve</button>
                                            <button className="text-sm bg-red-500 text-white px-3 py-1 rounded-md">Deny</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </>
    );
};

export default RequestManagementPage;