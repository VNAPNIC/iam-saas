import React, { useState, useEffect } from 'react';
import { roleService } from '@/services/roleService';
import { useParams } from 'next/navigation';

interface RoleModalProps {
    isOpen: boolean;
    onClose: () => void;
    role: any; // Define more specific type later
    onSave: (savedRole: any) => void;
    tenantKey: string;
}

export default function RoleModal({ isOpen, onClose, role, onSave, tenantKey }: RoleModalProps) {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [permissions, setPermissions] = useState<any[]>([]);
    const [selectedPermissions, setSelectedPermissions] = useState(new Set());
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const isEditMode = !!role;

    // Lấy danh sách tất cả permissions khi modal mở
    useEffect(() => {
        if (isOpen) {
            roleService.getPermissions()
                .then(setPermissions)
                .catch(() => setError("Could not load permissions."));
        }
    }, [isOpen, tenantKey]);

    // Điền thông tin form nếu là chế độ edit
    useEffect(() => {
        if (role) {
            setName(role.name);
            setDescription(role.description);
            setSelectedPermissions(new Set(role.permissions.map((p: any) => p.id)));
        } else {
            // Reset form khi mở modal để tạo mới
            setName('');
            setDescription('');
            setSelectedPermissions(new Set());
        }
    }, [role]);

    const handlePermissionChange = (permissionId: number) => {
        const newSelection = new Set(selectedPermissions);
        if (newSelection.has(permissionId)) {
            newSelection.delete(permissionId);
        } else {
            newSelection.add(permissionId);
        }
        setSelectedPermissions(newSelection);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const payload = {
            name,
            description,
            permissionIds: Array.from(selectedPermissions),
        };

        try {
            const savedRole = isEditMode 
                ? await roleService.updateRole(tenantKey, role.id, payload)
                : await roleService.createRole(tenantKey, payload);
            onSave(savedRole);
            onClose();
        } catch (err: any) {
            setError(err.response?.data?.message || (isEditMode ? 'Failed to update role.' : 'Failed to create role.'));
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl">
                <h2 className="text-lg font-semibold mb-4">{isEditMode ? 'Edit Role' : 'Add Role'}</h2>
                {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700">Role Name</label>
                        <input type="text" value={name} onChange={e => setName(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md p-2" required />
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700">Description</label>
                        <textarea value={description} onChange={e => setDescription(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md p-2" rows={3}></textarea>
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700">Permissions</label>
                        <div className="mt-2 space-y-2 max-h-48 overflow-y-auto border p-2 rounded-md">
                            {permissions.map(p => (
                                <label key={p.id} className="flex items-center">
                                    <input 
                                        type="checkbox" 
                                        className="h-4 w-4 text-blue-600"
                                        checked={selectedPermissions.has(p.id)}
                                        onChange={() => handlePermissionChange(p.id)}
                                    />
                                    <span className="ml-2 text-sm text-gray-700">{p.resource}: {p.action}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                    <div className="flex justify-end space-x-2">
                        <button type="button" onClick={onClose} className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md text-sm hover:bg-gray-300">Cancel</button>
                        <button type="submit" disabled={loading} className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700 disabled:bg-blue-400">
                            {loading ? 'Saving...' : 'Save'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
