"use client";

import React, { useState, useEffect } from 'react';
import { Plus, Shield } from 'lucide-react';
import { roleService } from '@/services/roleService';
import RoleModal from '@/components/roles/RoleModal';

interface RoleRowProps {
    role: any; // Tạm thời dùng any, sẽ định nghĩa chi tiết sau
    onEdit: (role: any) => void;
    onDelete: (role: any) => void;
}

const RoleRow: React.FC<RoleRowProps> = ({ role, onEdit, onDelete }) => (
    <tr>
        <td className="px-6 py-4 whitespace-nowrap">
            <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-md flex items-center justify-center text-blue-500">
                <Shield size={20} />
            </div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
            <div className="text-sm font-medium text-gray-900">{role.name}</div>
            {role.isSystemRole && <div className="text-xs text-gray-500">System Role</div>}
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 max-w-xs truncate">{role.description}</td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{role.permissions?.length || 0} permissions</td>
        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
            <button onClick={() => onEdit(role)} className="text-indigo-600 hover:text-indigo-900" disabled={role.isSystemRole}>Edit</button>
            {!role.isSystemRole && (
                 <button onClick={() => onDelete(role)} className="text-red-600 hover:text-red-900 ml-4">Delete</button>
            )}
        </td>
    </tr>
);

export default function RoleManagementPage() {
    const [roles, setRoles] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isModalOpen, setModalOpen] = useState(false);
    const [selectedRole, setSelectedRole] = useState(null);

    useEffect(() => {
        const fetchRoles = async () => {
            try {
                const data = await roleService.getRoles();
                setRoles(data || []);
            } catch (err) {
                setError("Failed to fetch roles.");
            } finally {
                setLoading(false);
            }
        };
        fetchRoles();
    }, []);

    const handleSave = (savedRole: any) => {
        if (selectedRole) { // Update
            setRoles(prev => prev.map(r => r.id === savedRole.id ? savedRole : r));
        } else { // Create
            setRoles(prev => [savedRole, ...prev]);
        }
    };

    const handleAddClick = () => {
        setSelectedRole(null);
        setModalOpen(true);
    };

    const handleEditClick = (role: any) => {
        setSelectedRole(role);
        setModalOpen(true);
    };

    const handleDeleteClick = async (role: any) => {
        if (window.confirm(`Are you sure you want to delete the "${role.name}" role?`)) {
            try {
                await roleService.deleteRole(role.id);
                setRoles(prev => prev.filter(r => r.id !== role.id));
            } catch (err) {
                alert("Failed to delete role.");
            }
        }
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Role Management</h1>
                <div className="flex space-x-2">
                    <button onClick={handleAddClick} className="text-sm bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center">
                        <Plus className="mr-2 h-4 w-4" /> Add Role
                    </button>
                </div>
            </div>

            <div className="card bg-white rounded-lg shadow border border-gray-200">
                <div className="overflow-x-auto">
                     {loading ? (
                        <p className="p-4 text-center">Loading roles...</p>
                    ) : error ? (
                        <p className="p-4 text-center text-red-500">{error}</p>
                    ) : (
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Icon</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role Name</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Permissions</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {roles.map(role => <RoleRow key={role.id} role={role} onEdit={handleEditClick} onDelete={handleDeleteClick} />)}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            <RoleModal isOpen={isModalOpen} onClose={() => setModalOpen(false)} role={selectedRole} onSave={handleSave} />
        </div>
    );
}