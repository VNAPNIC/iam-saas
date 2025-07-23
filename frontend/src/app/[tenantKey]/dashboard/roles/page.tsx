'use client';

import { useState, useEffect } from 'react';
import { FaPlus, FaDownload, FaShieldAlt, FaEdit, FaEye, FaUserTie, FaCog, FaBell } from 'react-icons/fa';
import { roleService } from '@/services/roleService';
import { Role } from '@/types/role';

const RoleManagementPage = () => {
    const [roles, setRoles] = useState<Role[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        const fetchRoles = async () => {
            try {
                setIsLoading(true);
                const response = await roleService.listRoles();
                setRoles(response.data);
            } catch (err) {
                setError('Failed to fetch roles.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchRoles();
    }, []);

    const openModal = () => setIsModalOpen(true);
    const closeModal = () => setIsModalOpen(false);

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Handle role creation logic
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
                <h1 className="text-2xl font-bold text-gray-900">Role Management</h1>
                <div className="flex space-x-2">
                    <button onClick={openModal} className="text-sm bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center">
                        <FaPlus className="mr-2" /> Add Role
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
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Icon</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Permissions</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Users</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {roles.map((role) => (
                                <tr key={role.id}>
                                    <td className="px-6 py-4 whitespace-nowrap"><div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-md flex items-center justify-center text-blue-500"><FaShieldAlt /></div></td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{role.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{role.description}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{role.permissions.length} permissions</td>
                                    <td className="px-6 py-4 whitespace-nowrap"><span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">{role.users.length} users</span></td>
                                    <td className="px-6 py-4 whitespace-nowrap"><span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${role.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>{role.status}</span></td>
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
                        <h2 className="text-lg font-semibold mb-4">Add Role</h2>
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

export default RoleManagementPage;