"use client";

import React, { useState, useEffect } from 'react';
import { userService } from '@/services/userService';

interface EditUserModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: any;
    onUserUpdated: (updatedUser: any) => void;
}

export default function EditUserModal({ isOpen, onClose, user, onUserUpdated }: EditUserModalProps) {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user) {
            setName(user.name);
            setEmail(user.email);
        }
    }, [user]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const updatedUser = await userService.updateUser(user.id, { name });
            onUserUpdated(updatedUser);
            onClose();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to update user.');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl">
                <h2 className="text-lg font-semibold mb-4">Edit User</h2>
                {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="edit-user-name" className="block text-sm font-medium text-gray-700">Full Name</label>
                        <input 
                            type="text" 
                            id="edit-user-name" 
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="mt-1 block w-full border border-gray-300 rounded-md p-2 text-sm"
                            required 
                        />
                    </div>
                    <div>
                        <label htmlFor="edit-user-email" className="block text-sm font-medium text-gray-700">Email</label>
                        <input 
                            type="email" 
                            id="edit-user-email" 
                            value={email}
                            className="mt-1 block w-full border border-gray-300 rounded-md p-2 text-sm bg-gray-100"
                            disabled // Không cho sửa email
                        />
                    </div>
                    <div className="flex justify-end space-x-2 pt-4">
                        <button 
                            type="button" 
                            onClick={onClose} 
                            className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md text-sm hover:bg-gray-300"
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit" 
                            disabled={loading}
                            className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700 disabled:bg-blue-400"
                        >
                            {loading ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
