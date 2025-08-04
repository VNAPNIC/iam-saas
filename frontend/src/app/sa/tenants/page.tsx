'use client';

import { useState, useEffect } from 'react';
import { FaPlus } from 'react-icons/fa';
import { tenantService, CreateTenantRequest } from '@/services/tenantService';
import { Tenant } from '@/types/tenant';
import { useHasPermission } from '@/hooks/useHasPermission';

const TenantManagementPage = () => {
    const canCreate = useHasPermission(['super:admin', 'tenants:create']);
    const [tenants, setTenants] = useState<Tenant[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newTenant, setNewTenant] = useState<CreateTenantRequest>({
        name: '',
        domain: ''
    });

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
    const closeModal = () => {
        setIsModalOpen(false);
        setNewTenant({ name: '', domain: '' });
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setNewTenant(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await tenantService.createTenant(newTenant);
            setTenants(prev => [...prev, response.data]);
            closeModal();
        } catch (err) {
            console.error('Failed to create tenant', err);
            alert('Failed to create tenant');
        }
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
                {canCreate && (
                    <button
                        onClick={openModal}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                        <FaPlus className="-ml-1 mr-2 h-5 w-5" />
                        Create New Tenant
                    </button>
                )}
            </div>

            <div className="bg-white shadow overflow-hidden sm:rounded-md">
                <ul className="divide-y divide-gray-200">
                    {tenants.map((tenant) => (
                        <li key={tenant.id}>
                            <a href={`/sa/tenants/${tenant.id}/settings`} className="block hover:bg-gray-50">
                                <div className="flex items-center px-4 py-4 sm:px-6">
                                    <div className="min-w-0 flex-1 flex items-center">
                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-center">
                                                <p className="text-sm font-medium text-blue-600 truncate">{tenant.name}</p>
                                                <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                    tenant.status === 'active' 
                                                        ? 'bg-green-100 text-green-800' 
                                                        : tenant.status === 'suspended' 
                                                            ? 'bg-red-100 text-red-800' 
                                                            : 'bg-yellow-100 text-yellow-800'
                                                }`}>
                                                    {tenant.status}
                                                </span>
                                            </div>
                                            <div className="mt-2 flex items-center text-sm text-gray-500">
                                                <span className="truncate">Domain: {tenant.domain}</span>
                                            </div>
                                            <div className="mt-1 flex items-center text-sm text-gray-500">
                                                <span>User Quota: {tenant.userQuota}</span>
                                                <span className="mx-2">•</span>
                                                <span>Created: {new Date(tenant.createdAt).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                </div>
                            </a>
                        </li>
                    ))}
                </ul>
            </div>

            {/* Modal for creating new tenant */}
            {isModalOpen && (
                <div className="fixed z-10 inset-0 overflow-y-auto">
                    <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true"></div>
                        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
                        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                <div className="sm:flex sm:items-start">
                                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                                        <h3 className="text-lg leading-6 font-medium text-gray-900">Create New Tenant</h3>
                                        <div className="mt-2">
                                            <form onSubmit={handleFormSubmit} className="space-y-4">
                                                <div>
                                                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">Tenant Name</label>
                                                    <input
                                                        type="text"
                                                        id="name"
                                                        name="name"
                                                        value={newTenant.name}
                                                        onChange={handleInputChange}
                                                        required
                                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                                    />
                                                </div>
                                                <div>
                                                    <label htmlFor="domain" className="block text-sm font-medium text-gray-700">Tenant Domain</label>
                                                    <input
                                                        type="text"
                                                        id="domain"
                                                        name="domain"
                                                        value={newTenant.domain}
                                                        onChange={handleInputChange}
                                                        required
                                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                                        placeholder="yourcompany.com"
                                                    />
                                                </div>
                                            </form>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                                <button
                                    type="submit"
                                    onClick={handleFormSubmit}
                                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                                >
                                    Create
                                </button>
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default TenantManagementPage;