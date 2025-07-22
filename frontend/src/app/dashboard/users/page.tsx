"use client";

import React, { useState, useEffect } from 'react';
import { Plus, Download, Users } from 'lucide-react';
import InviteUserModal from '@/components/users/InviteUserModal';
import EditUserModal from '@/components/users/EditUserModal';
import { userService } from '@/services/userService';

interface UserRowProps {
    user: any;
    onEdit: (user: any) => void;
    onDelete: (user: any) => void;
}

const UserRow: React.FC<UserRowProps> = ({ user, onEdit, onDelete }) => (
    <tr>
        <td className="px-6 py-4 whitespace-nowrap">
            <div className="flex items-center">
                <div className="flex-shrink-0 h-10 w-10">
                    <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                        <Users className="h-6 w-6 text-gray-400" />
                    </div>
                </div>
                <div className="ml-4">
                    <div className="text-sm font-medium text-gray-900">{user.name}</div>
                    <div className="text-sm text-gray-500">{user.email}</div>
                </div>
            </div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.role || 'N/A'}</td>
        <td className="px-6 py-4 whitespace-nowrap">
            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                {user.status}
            </span>
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
            <button onClick={() => onEdit(user)} className="text-indigo-600 hover:text-indigo-900">Edit</button>
            <button onClick={() => onDelete(user)} className="text-red-600 hover:text-red-900 ml-4">Delete</button>
        </td>
    </tr>
);

export default function UserManagementPage() {
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    const [isInviteModalOpen, setInviteModalOpen] = useState(false);
    const [isEditModalOpen, setEditModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const data = await userService.getUsers();
                setUsers(data || []);
            } catch (err) {
                setError("Failed to fetch users.");
            } finally {
                setLoading(false);
            }
        };
        fetchUsers();
    }, []);

    const handleUserInvited = (newUser: any) => {
        setUsers(prev => [newUser, ...prev]);
    };

    const handleEditClick = (user: any) => {
        setSelectedUser(user);
        setEditModalOpen(true);
    };

    const handleUserUpdated = (updatedUser: any) => {
        setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
    };

    const handleDeleteClick = async (user: any) => {
        if (window.confirm(`Are you sure you want to delete ${user.name}?`)) {
            try {
                await userService.deleteUser(user.id);
                setUsers(prev => prev.filter(u => u.id !== user.id));
            } catch (err) {
                alert("Failed to delete user.");
            }
        }
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
                <div className="flex space-x-2">
                    <button onClick={() => setInviteModalOpen(true)} className="text-sm bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center">
                        <Plus className="mr-2 h-4 w-4" /> Add User
                    </button>
                </div>
            </div>

            {/* ... Filters ... */}

            <div className="card bg-white rounded-lg shadow border border-gray-200">
                <div className="overflow-x-auto">
                    {loading ? (
                        <p className="p-4 text-center">Loading users...</p>
                    ) : error ? (
                        <p className="p-4 text-center text-red-500">{error}</p>
                    ) : (
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
                                {users.length > 0 ? (
                                    users.map(user => <UserRow key={user.id} user={user} onEdit={handleEditClick} onDelete={handleDeleteClick} />)
                                ) : (
                                    <tr><td colSpan={4} className="text-center p-8">No users yet.</td></tr>
                                )}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            <InviteUserModal isOpen={isInviteModalOpen} onClose={() => setInviteModalOpen(false)} onUserInvited={handleUserInvited} />
            {selectedUser && <EditUserModal isOpen={isEditModalOpen} onClose={() => setEditModalOpen(false)} user={selectedUser} onUserUpdated={handleUserUpdated} />}
        </div>
    );
}
