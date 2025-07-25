'use client';

import { useState, useEffect } from 'react';
import { FaPlus, FaDownload, FaUsers } from 'react-icons/fa';
import { userService } from '@/services/userService';
import { User } from '@/types/user';

const UserManagementPage = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                setIsLoading(true);
                const response = await userService.listUsers();
                setUsers(response.data);
            } catch (err) {
                setError('Failed to fetch users.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchUsers();
    }, []);

    const openModal = () => setIsModalOpen(true);
    const closeModal = () => setIsModalOpen(false);

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Handle user creation logic
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
                <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
                <div className="flex space-x-2">
                    <button onClick={openModal} className="text-sm bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center">
                        <FaPlus className="mr-2" /> Add User
                    </button>
                    <button className="text-sm bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-50 flex items-center">
                        <FaDownload className="mr-2" /> Export
                    </button>
                </div>
            </div>

            {users.length === 0 ? (
                <div className="text-center card bg-white rounded-lg shadow p-8 border border-gray-200">
                    <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100">
                        <FaUsers className="text-2xl text-blue-600" />
                    </div>
                    <h3 className="mt-4 text-lg font-medium text-gray-900">No users yet</h3>
                    <p className="mt-2 text-sm text-gray-500">Get started by inviting the first member to your team.</p>
                    <div className="mt-6">
                        <button onClick={openModal} className="text-sm bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
                            Invite first user
                        </button>
                    </div>
                </div>
            ) : (
                <div id="users-main-content">
                    {/* ... filter section ... */}
                    <div className="card bg-white rounded-lg shadow border border-gray-200">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {users.map((user) => (
                                        <tr key={user.id}>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="ml-4">
                                                        <div className="text-sm font-medium text-gray-900">{user.name}</div>
                                                        <div className="text-sm text-gray-500">{user.email}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.RoleIDs.join(', ')}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                                    {user.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">{/* Action buttons */}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* ... modal section ... */}
        </>
    );
};

export default UserManagementPage;