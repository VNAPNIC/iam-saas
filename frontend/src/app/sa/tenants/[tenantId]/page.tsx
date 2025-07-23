'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { FaArrowLeft, FaUsers, FaFileInvoiceDollar, FaClipboardList } from 'react-icons/fa';
import { tenantService } from '@/services/tenantService';
import { Tenant } from '@/types/tenant';

const TenantDetailsPage = () => {
    const params = useParams();
    const tenantId = params.tenantId as string;
    const [tenant, setTenant] = useState<Tenant | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchTenantDetails = async () => {
            try {
                setIsLoading(true);
                const response = await tenantService.getTenantDetails(tenantId);
                setTenant(response.data);
            } catch (err) {
                setError('Failed to fetch tenant details.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchTenantDetails();
    }, [tenantId]);

    const handleSuspendTenant = () => {
        if (confirm('Are you sure you want to suspend this tenant?')) {
            // Handle suspend logic
            alert('Tenant suspended!');
        }
    };

    const handleDeleteTenant = () => {
        if (confirm('Are you sure you want to delete this tenant? This action cannot be undone.')) {
            // Handle delete logic
            alert('Tenant deleted!');
        }
    };

    if (isLoading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>{error}</div>;
    }

    if (!tenant) {
        return <div>Tenant not found.</div>;
    }

    return (
        <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-6">
                <Link href="/sa/tenants" className="text-sm text-gray-500 hover:text-gray-700 flex items-center">
                    <FaArrowLeft className="mr-2" /> Back to Tenant Management
                </Link>
                <div className="flex items-center space-x-2">
                    <button onClick={handleSuspendTenant} className="text-sm bg-yellow-500 text-white px-4 py-2 rounded-md hover:bg-yellow-600">Suspend Tenant</button>
                    <button onClick={handleDeleteTenant} className="text-sm bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700">Delete Tenant</button>
                </div>
            </div>

            <div className="card bg-white rounded-lg shadow p-6 border border-gray-200 mb-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">{tenant.name}</h1>
                        <p className="text-sm text-gray-500">Service Plan: <span className="font-semibold text-blue-600">{tenant.plan}</span></p>
                    </div>
                    <div>
                        <span className={`px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full ${tenant.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                            {tenant.status}
                        </span>
                    </div>
                </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="card bg-white rounded-lg shadow p-4 border">
                    <p className="text-sm font-medium text-gray-500">User Count</p>
                    <p className="text-2xl font-semibold">{tenant.users.length}</p>
                </div>
                <div className="card bg-white rounded-lg shadow p-4 border">
                    <p className="text-sm font-medium text-gray-500">Invoices This Month</p>
                    <p className="text-2xl font-semibold">450 / 500</p>
                </div>
                <div className="card bg-white rounded-lg shadow p-4 border">
                    <p className="text-sm font-medium text-gray-500">API Calls (24h)</p>
                    <p className="text-2xl font-semibold">1,234 / 10,000</p>
                </div>
            </div>

            <div className="card bg-white rounded-lg shadow p-6 border border-gray-200">
                 <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Link href={`/${tenant.key}/dashboard/users`} className="block p-4 bg-gray-50 hover:bg-gray-100 rounded-lg text-center">
                        <FaUsers className="text-2xl text-blue-500 mb-2" />
                        <p className="font-medium">View Users</p>
                    </Link>
                    <Link href={`/${tenant.key}/dashboard/billing`} className="block p-4 bg-gray-50 hover:bg-gray-100 rounded-lg text-center">
                        <FaFileInvoiceDollar className="text-2xl text-green-500 mb-2" />
                        <p className="font-medium">View Billing</p>
                    </Link>
                    <Link href={`/${tenant.key}/dashboard/audit-logs`} className="block p-4 bg-gray-50 hover:bg-gray-100 rounded-lg text-center">
                        <FaClipboardList className="text-2xl text-yellow-500 mb-2" />
                        <p className="font-medium">View Audit Logs</p>
                    </Link>
                 </div>
            </div>
        </div>
    );
};

export default TenantDetailsPage;