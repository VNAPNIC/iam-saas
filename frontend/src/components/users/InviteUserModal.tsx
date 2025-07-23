"use client";

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { userService } from '@/services/userService';
import { useParams } from 'next/navigation';

interface InviteUserModalProps {
    isOpen: boolean;
    onClose: () => void;
    onUserInvited: (newUser: any) => void;
}

export default function InviteUserModal({ isOpen, onClose, onUserInvited }: InviteUserModalProps) {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [role, setRole] = useState('Editor'); // Mặc định là Editor
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const { user } = useAuth();
    const params = useParams();
    const tenantKey = params.tenantKey as string;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const invitedUser = await userService.invite(tenantKey, { name, email, role });
            alert('Invitation sent successfully!');
            onUserInvited(invitedUser); // Call callback with the new user data
            onClose(); // Close modal
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to send invitation.');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl">
                <h2 className="text-lg font-semibold mb-4">Invite New User</h2>
                {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="user-name" className="block text-sm font-medium text-gray-700">Full Name</label>
                        <input 
                            type="text" 
                            id="user-name" 
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="mt-1 block w-full border border-gray-300 rounded-md p-2 text-sm"
                            required 
                        />
                    </div>
                    <div>
                        <label htmlFor="user-email" className="block text-sm font-medium text-gray-700">Email</label>
                        <input 
                            type="email" 
                            id="user-email" 
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="mt-1 block w-full border border-gray-300 rounded-md p-2 text-sm"
                            required 
                        />
                    </div>
                    <div>
                        <label htmlFor="user-role" className="block text-sm font-medium text-gray-700">Role</label>
                        <select 
                            id="user-role" 
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                            className="mt-1 block w-full border border-gray-300 rounded-md p-2 bg-white text-sm"
                        >
                            <option>Admin</option>
                            <option>Editor</option>
                            <option>Viewer</option>
                        </select>
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
                            {loading ? 'Sending...' : 'Send Invitation'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
