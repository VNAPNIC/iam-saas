'use client';

import { useState, useEffect } from 'react';
import { FaPlus, FaSearch, FaCopy } from 'react-icons/fa';
import { accessKeyService } from '@/services/accessKeyService';
import { AccessKeyGroup } from '@/types/accessKey';

const AccessKeyManagementPage = () => {
    const [keyGroups, setKeyGroups] = useState<AccessKeyGroup[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isCreateGroupModalOpen, setIsCreateGroupModalOpen] = useState(false);
    const [isShowKeyModalOpen, setIsShowKeyModalOpen] = useState(false);
    const [newlyCreatedKey, setNewlyCreatedKey] = useState<string | null>(null);

    useEffect(() => {
        const fetchKeyGroups = async () => {
            try {
                setIsLoading(true);
                const response = await accessKeyService.listAccessKeyGroups();
                setKeyGroups(response.data);
            } catch (err) {
                setError('Failed to fetch key groups.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchKeyGroups();
    }, []);

    const openCreateGroupModal = () => setIsCreateGroupModalOpen(true);
    const closeCreateGroupModal = () => setIsCreateGroupModalOpen(false);
    const closeShowKeyModal = () => setIsShowKeyModalOpen(false);

    const handleCreateKeyGroup = async (e: React.FormEvent) => {
        e.preventDefault();
        // Handle key group creation logic
        closeCreateGroupModal();
        // For now, mock a newly created key
        setNewlyCreatedKey('mock_access_key_123');
        setIsShowKeyModalOpen(true);
    };

    const handleCreateKey = async (groupId: string) => {
        // Handle key creation logic for a specific group
        setNewlyCreatedKey('mock_access_key_for_group_' + groupId);
        setIsShowKeyModalOpen(true);
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
                <h1 className="text-2xl font-bold text-gray-900">Access Key Management</h1>
                <button onClick={openCreateGroupModal} className="text-sm bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
                    <FaPlus className="mr-2" /> Create New Key Group
                </button>
            </div>

            <div className="card bg-white rounded-lg shadow p-4 border border-gray-200 mb-6">
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaSearch className="text-gray-400" />
                    </div>
                    <input type="text" id="search-groups-input" placeholder="Search groups by name..."
                        className="w-full text-sm border-gray-300 rounded-md p-2 pl-10" />
                </div>
            </div>

            <div id="key-groups-container" className="space-y-6">
                {keyGroups.map((group) => (
                    <div key={group.id} className="card bg-white rounded-lg shadow border border-gray-200 p-4">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold text-gray-900">{group.name}</h2>
                            <button onClick={() => handleCreateKey(group.id)} className="text-sm bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
                                <FaPlus className="mr-2" /> Add Key
                            </button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-medium uppercase">Access Key ID</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium uppercase">Created At</th>
                                        <th className="px-4 py-3 text-right text-xs font-medium uppercase">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {group.keys.map((key) => (
                                        <tr key={key.id}>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{key.id}</td>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{key.createdAt}</td>
                                            <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                                                <button className="text-red-600 hover:text-red-900">Delete</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ))}
            </div>

            {isCreateGroupModalOpen && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center">
                    <div className="bg-white rounded-lg p-6 w-full max-w-lg">
                        <h2 className="text-lg font-semibold mb-4">Create New Key Group</h2>
                        <form onSubmit={handleCreateKeyGroup} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium">Group Name</label>
                                <input type="text" id="key-group-name" className="mt-1 w-full border rounded-md p-2" required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium">Assign Service Role</label>
                                <select id="key-group-role" className="mt-1 w-full border rounded-md p-2 bg-white">
                                    {/* Options will be loaded dynamically */}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium">Key Type</label>
                                <select id="key-type" className="mt-1 w-full border rounded-md p-2 bg-white">
                                    <option value="user-key">User Key (Client to Service)</option>
                                    <option value="direct-key">Direct Key (Service to Service)</option>
                                </select>
                            </div>
                            <div className="flex justify-end space-x-2 pt-4">
                                <button type="button" onClick={closeCreateGroupModal} className="bg-gray-300 px-4 py-2 rounded-md">Cancel</button>
                                <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-md">Create Group</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {isShowKeyModalOpen && newlyCreatedKey && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center">
                    <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-lg">
                        <h2 className="text-lg font-semibold text-gray-900 mb-2">Access Key Created!</h2>
                        <p className="text-sm text-red-600 bg-red-50 p-3 rounded-md mb-4">⚠️ This is the only time you will see this Key. Please copy and store it securely.</p>
                        <div className="relative">
                            <input type="text" id="api-key-display" readOnly value={newlyCreatedKey} className="w-full p-3 pr-10 bg-gray-100 rounded-md font-mono" />
                            <button id="copy-key-btn" className="absolute top-1/2 right-2 -translate-y-1/2 text-gray-500 hover:text-gray-800">
                                <FaCopy className="text-lg" />
                            </button>
                        </div>
                        <div className="mt-6 text-right">
                            <button onClick={closeShowKeyModal} className="text-sm bg-blue-600 text-white px-4 py-2 rounded-md">Understood, Close</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default AccessKeyManagementPage;