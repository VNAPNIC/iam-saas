'use client';

import { useState, useEffect } from 'react';
import { FaPlus, FaDownload } from 'react-icons/fa';
import { permissionService } from '@/services/permissionService';
import { Permission } from '@/types/permission';

const PermissionManagementPage = () => {
    const [permissions, setPermissions] = useState<Permission[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        const fetchPermissions = async () => {
            try {
                setIsLoading(true);
                const response = await permissionService.listPermissions();
                setPermissions(response.data);
            } catch (err) {
                setError('Failed to fetch permissions.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchPermissions();
    }, []);

    const openModal = () => setIsModalOpen(true);
    const closeModal = () => setIsModalOpen(false);

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Handle permission creation logic
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
                <h1 className="text-2xl font-bold text-gray-900">Permission Management</h1>
                <div className="flex space-x-2">
                    <button onClick={openModal} className="text-sm bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center">
                        <FaPlus className="mr-2" /> Add Permission
                    </button>
                    <button className="text-sm bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-50 flex items-center">
                        <FaDownload className="mr-2" /> Export
                    </button>
                </div>
            </div>

            <div className="card bg-white rounded-lg shadow border border-gray-200">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Permission Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Key</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Roles</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {permissions.map((permission) => (
                                <tr key={permission.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{permission.description}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{permission.key}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{permission.description}</td>
                                    <td className="px-6 py-4 whitespace-nowrap"><span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">{permission.roles.length} roles</span></td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
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
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <h2 className="text-lg font-semibold mb-4">Add Permission</h2>
                        <form onSubmit={handleFormSubmit} className="space-y-4">
                            {/* Form fields will be added here */}
                            <div className="flex justify-end space-x-2">
                                <button type="button" onClick={closeModal} className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md">Cancel</button>
                                <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-md">Save</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
};

export default PermissionManagementPage;