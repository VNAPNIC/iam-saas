'use client';

import { useState, useEffect } from 'react';
import { FaPlus } from 'react-icons/fa';
import { tenantService } from '@/services/tenantService';
import { Tenant } from '@/types/tenant';

const TenantManagementPage = () => {
    const [tenants, setTenants] = useState<Tenant[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        const fetchTenants = async () => {
            try {
                setIsLoading(true);
                const response = await tenantService.listTenants();
                setTenants(response.data);
            } catch (err) {
                setError('Failed to fetch tenants.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchTenants();
    }, []);

    const openModal = () => setIsModalOpen(true);
    const closeModal = () => setIsModalOpen(false);

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Handle tenant creation logic
        closeModal();
    };

    if (isLoading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>{error}</div>;
    }

    return (
        <>
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Tenant Management</h1>
                <button onClick={openModal} className="text-sm bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center">
                    <FaPlus className="mr-2" /> Add Tenant
                </button>
            </div>

            <div className="card bg-white rounded-lg shadow border border-gray-200">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase">Tenant Name</th>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase">Plan</th>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase">Status</th>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase">Users</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {tenants.map((tenant) => (
                                <tr key={tenant.id}>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{tenant.name}</td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{tenant.plan}</td>
                                    <td className="px-4 py-3 whitespace-nowrap"><span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${tenant.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>{tenant.status}</span></td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{tenant.users.length}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center">
                    <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-lg">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Add New Tenant</h2>
                        <form onSubmit={handleFormSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Tenant Name</label>
                                <input type="text" id="tenant-name" className="mt-1 block w-full border rounded-md p-2 text-sm" required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Admin Email</label>
                                <input type="email" id="tenant-admin-email" className="mt-1 block w-full border rounded-md p-2 text-sm" required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Service Plan</label>
                                <select id="tenant-plan" className="mt-1 block w-full border rounded-md p-2 text-sm bg-white">
                                    <option value="Trial">Trial</option>
                                    <option value="Basic">Basic</option>
                                    <option value="Pro">Pro</option>
                                </select>
                            </div>
                            <div className="flex justify-end space-x-2 pt-4">
                                <button type="button" onClick={closeModal} className="text-sm bg-gray-300 px-4 py-2 rounded-md">Cancel</button>
                                <button type="submit" className="text-sm bg-blue-600 text-white px-4 py-2 rounded-md">Create Tenant</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
};

export default TenantManagementPage;