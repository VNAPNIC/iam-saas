'use client';

import { useState, useEffect } from 'react';
import { FaPlus, FaCubes } from 'react-icons/fa';
import { applicationService } from '@/services/applicationService';
import { Application } from '@/types/application';

const ApplicationManagementPage = () => {
    const [applications, setApplications] = useState<Application[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isCredentialsModalOpen, setIsCredentialsModalOpen] = useState(false);
    const [newlyCreatedApp, setNewlyCreatedApp] = useState<Application | null>(null);

    useEffect(() => {
        const fetchApplications = async () => {
            try {
                setIsLoading(true);
                const response = await applicationService.listApplications();
                setApplications(response.data);
            } catch (err) {
                setError('Failed to fetch applications.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchApplications();
    }, []);

    const openAddModal = () => setIsAddModalOpen(true);
    const closeAddModal = () => setIsAddModalOpen(false);
    const closeCredentialsModal = () => setIsCredentialsModalOpen(false);

    const handleCreateApp = async (e: React.FormEvent) => {
        e.preventDefault();
        // Handle form submission and create application
        closeAddModal();
        // For now, mock a newly created app
        setNewlyCreatedApp({ id: '1', name: 'New App', clientId: 'mockClientId', clientSecret: 'mockClientSecret', createdAt: '2023-01-01' });
        setIsCredentialsModalOpen(true);
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
                <h1 className="text-2xl font-bold text-gray-900">Application Management</h1>
                <button onClick={openAddModal} className="text-sm bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center">
                    <FaPlus className="mr-2" /> Register New Application
                </button>
            </div>

            {applications.length === 0 ? (
                <div className="text-center card bg-white rounded-lg shadow p-8 border border-gray-200">
                    <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100">
                        <FaCubes className="text-2xl text-blue-600" />
                    </div>
                    <h3 className="mt-4 text-lg font-medium text-gray-900">No applications registered yet</h3>
                    <p className="mt-2 text-sm text-gray-500">Register your first application to start integrating with the IAM system.</p>
                    <div className="mt-6">
                        <button onClick={openAddModal} className="text-sm bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
                            Register First Application
                        </button>
                    </div>
                </div>
            ) : (
                <div className="card bg-white rounded-lg shadow border border-gray-200">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Application Name</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Client ID</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created At</th>
                                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {applications.map((app) => (
                                    <tr key={app.id}>
                                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{app.name}</td>
                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 font-mono">{app.clientId}</td>
                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{app.createdAt}</td>
                                        <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                                            <button className="text-blue-500 hover:text-blue-700">Details</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {isAddModalOpen && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center">
                    <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-lg">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Register New Application</h2>
                        <form onSubmit={handleCreateApp} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Application Name</label>
                                <input type="text" id="app-name" placeholder="e.g., My Awesome App" className="mt-1 block w-full border rounded-md p-2 text-sm" required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Redirect URIs</label>
                                <textarea id="app-redirect-uris" rows={3} placeholder="https://myapp.com/callback\nhttps://staging.myapp.com/callback" className="mt-1 block w-full border rounded-md p-2 text-sm font-mono" required></textarea>
                                <p className="text-xs text-gray-500 mt-1">Each URL on a new line. These are the allowed redirect URLs after successful login.</p>
                            </div>
                            <div className="flex justify-end space-x-2 pt-4">
                                <button type="button" onClick={closeAddModal} className="text-sm bg-gray-300 px-4 py-2 rounded-md">Cancel</button>
                                <button type="submit" className="text-sm bg-blue-600 text-white px-4 py-2 rounded-md">Create Application</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {isCredentialsModalOpen && newlyCreatedApp && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center">
                    <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-lg">
                        <h2 className="text-lg font-semibold text-gray-900 mb-2">Application Created Successfully!</h2>
                        <p className="text-sm text-gray-600 mb-4">These are the credentials for your application. Please copy and store them securely. You will not be able to view the Client Secret again after closing this window.</p>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Client ID</label>
                                <input type="text" id="client-id-display" readOnly value={newlyCreatedApp.clientId} className="mt-1 w-full p-2 bg-gray-100 rounded-md font-mono" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Client Secret</label>
                                <input type="text" id="client-secret-display" readOnly value={newlyCreatedApp.clientSecret} className="mt-1 w-full p-2 bg-gray-100 rounded-md font-mono" />
                            </div>
                        </div>
                        <div className="mt-6 text-right">
                            <button onClick={closeCredentialsModal} className="text-sm bg-blue-600 text-white px-4 py-2 rounded-md">Understood, Close</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default ApplicationManagementPage;
