'use client';

import { useState, useEffect } from 'react';
import { FaPlus } from 'react-icons/fa';
import { serviceRoleService } from '@/services/serviceRoleService';
import { ServiceRole } from '@/types/serviceRole';

const ServiceRoleManagementPage = () => {
    const [serviceRoles, setServiceRoles] = useState<ServiceRole[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        const fetchServiceRoles = async () => {
            try {
                setIsLoading(true);
                const response = await serviceRoleService.listServiceRoles();
                setServiceRoles(response.data);
            } catch (err) {
                setError('Failed to fetch service roles.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchServiceRoles();
    }, []);

    const openModal = () => setIsModalOpen(true);
    const closeModal = () => setIsModalOpen(false);

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Handle service role creation logic
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
                <h1 className="text-2xl font-bold text-gray-900">Service Role Management</h1>
                <button onClick={openModal} className="text-sm bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center">
                    <FaPlus className="mr-2" /> Create New Role
                </button>
            </div>

            <div className="card bg-white rounded-lg shadow border border-gray-200">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase">Role Name</th>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase">Permissions</th>
                                <th className="px-4 py-3 text-right text-xs font-medium uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {serviceRoles.map((role) => (
                                <tr key={role.id}>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{role.name}</td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{role.permissions.join(', ')}</td>
                                    <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                                        <button className="text-blue-600 hover:text-blue-900 mr-3">Edit</button>
                                        <button className="text-red-600 hover:text-red-900">Delete</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center">
                    <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-lg">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Create New Service Role</h2>
                        <form onSubmit={handleFormSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium">Role Name</label>
                                <input type="text" id="service-role-name" placeholder="e.g., Billing Read-Only" className="mt-1 w-full border rounded-md p-2" required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium">Permissions</label>
                                <input type="text" id="service-role-permissions" placeholder="Comma-separated, e.g.: invoices:read,customers:read" className="mt-1 w-full border rounded-md p-2" />
                                <p className="text-xs text-gray-500 mt-1">These permissions are defined and checked by your system.</p>
                            </div>
                            <div className="flex justify-end space-x-2 pt-4">
                                <button type="button" onClick={closeModal} className="text-sm bg-gray-300 px-4 py-2 rounded-md">Cancel</button>
                                <button type="submit" className="text-sm bg-blue-600 text-white px-4 py-2 rounded-md">Save</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
};

export default ServiceRoleManagementPage;