'use client';

import { useState, useEffect } from 'react';
import { FaDownload, FaCog, FaPlug, FaTrashAlt } from 'react-icons/fa';

const SsoIntegrationPage = () => {
    const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);

    const openConfigModal = () => setIsConfigModalOpen(true);
    const closeConfigModal = () => setIsConfigModalOpen(false);

    const handleConfigSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Handle SSO config save logic
        closeConfigModal();
    };

    const testConnection = () => {
        // Handle test connection logic
        alert('Testing connection...');
    };

    const deleteIntegration = () => {
        // Handle delete integration logic
        if (confirm('Are you sure you want to delete this SSO integration?')) {
            alert('SSO integration deleted.');
        }
    };

    return (
        <>
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-gray-900">SSO Integration</h1>
                <div className="flex space-x-2">
                    <button className="text-sm bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-50 flex items-center">
                        <FaDownload className="mr-2" /> Export History
                    </button>
                </div>
            </div>

            <div className="card bg-white rounded-lg shadow p-4 border border-gray-200 mb-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Current SSO Configuration</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">SSO Status</label>
                        <p className="text-sm text-green-600 font-semibold">Enabled</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Identity Provider</label>
                        <p className="text-sm text-gray-500">SAML</p>
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Metadata URL</label>
                        <p className="text-sm text-gray-500 break-all">https://idp.example.com/saml/metadata</p>
                    </div>
                </div>
                <div className="mt-6 flex flex-wrap gap-2">
                    <button className="text-sm bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center" onClick={openConfigModal}>
                        <FaCog className="mr-2" /> Edit Configuration
                    </button>
                    <button className="text-sm bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 flex items-center" onClick={testConnection}>
                        <FaPlug className="mr-2" /> Test Connection
                    </button>
                    <button className="text-sm bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 flex items-center" onClick={deleteIntegration}>
                        <FaTrashAlt className="mr-2" /> Delete Integration
                    </button>
                </div>
            </div>

            <div className="card bg-white rounded-lg shadow border border-gray-200">
                <div className="p-4 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900">SSO Change History</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actor</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Time</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Details</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            <tr>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">SSO Enabled</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">john.doe@acme.com</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">2025-07-16 18:30:00</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">SAML configured with metadata URL</td>
                            </tr>
                            <tr>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">SSO Updated</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">jane.cooper@acme.com</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">2025-07-15 14:20:00</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Client Secret updated</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            {isConfigModalOpen && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center">
                    <div className="bg-white rounded-lg p-6 w-full max-w-lg">
                        <h2 className="text-lg font-semibold mb-4 text-gray-900">SSO Configuration</h2>
                        <form onSubmit={handleConfigSubmit} className="space-y-4">
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700">SSO Status</label>
                                <select id="sso-status" className="mt-1 block w-full border border-gray-300 rounded-md p-2">
                                    <option value="enabled">Enabled</option>
                                    <option value="disabled">Disabled</option>
                                </select>
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700">Identity Provider</label>
                                <select id="sso-provider" className="mt-1 block w-full border border-gray-300 rounded-md p-2">
                                    <option value="saml">SAML</option>
                                    <option value="oauth2">OAuth2</option>
                                    <option value="oidc">OpenID Connect</option>
                                </select>
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700">Metadata URL</label>
                                <input type="url" id="sso-metadata-url" className="mt-1 block w-full border border-gray-300 rounded-md p-2" placeholder="https://idp.example.com/saml/metadata" />
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700">Client ID</label>
                                <input type="text" id="sso-client-id" className="mt-1 block w-full border border-gray-300 rounded-md p-2" />
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700">Client Secret</label>
                                <input type="password" id="sso-client-secret" className="mt-1 block w-full border border-gray-300 rounded-md p-2" />
                            </div>
                            <div className="flex justify-end space-x-2">
                                <button type="button" className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600" onClick={closeConfigModal}>Cancel</button>
                                <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">Save</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
};

export default SsoIntegrationPage;