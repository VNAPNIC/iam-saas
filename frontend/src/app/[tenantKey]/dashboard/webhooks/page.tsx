'use client';

import { useState, useEffect } from 'react';
import { FaPlus } from 'react-icons/fa';
import { webhookService } from '@/services/webhookService';
import { Webhook } from '@/types/webhook';

const WebhookManagementPage = () => {
    const [webhooks, setWebhooks] = useState<Webhook[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        const fetchWebhooks = async () => {
            try {
                setIsLoading(true);
                const response = await webhookService.listWebhooks();
                setWebhooks(response.data);
            } catch (err) {
                setError('Failed to fetch webhooks.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchWebhooks();
    }, []);

    const openModal = () => setIsModalOpen(true);
    const closeModal = () => setIsModalOpen(false);

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Handle webhook creation logic
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
                <h1 className="text-2xl font-bold text-gray-900">Webhooks</h1>
                <button onClick={openModal} className="text-sm bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center">
                    <FaPlus className="mr-2" /> Add Webhook
                </button>
            </div>

            <div className="card bg-white rounded-lg shadow border border-gray-200">
                <div className="p-4 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900">Webhook List</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Endpoint URL</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Events</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {webhooks.map((webhook) => (
                                <tr key={webhook.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{webhook.url}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{webhook.events.join(', ')}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${webhook.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{webhook.status}</span>
                                    </td>
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
                    <div className="bg-white rounded-lg p-6 w-full max-w-lg">
                        <h2 className="text-lg font-semibold mb-4 text-gray-900">Add Webhook</h2>
                        <form onSubmit={handleFormSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Endpoint URL</label>
                                <input type="url" id="webhook-url" className="mt-1 block w-full border border-gray-300 rounded-md p-2" placeholder="https://..." required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Secret Key</label>
                                <input type="text" id="webhook-secret" className="mt-1 block w-full border border-gray-300 rounded-md p-2" placeholder="Leave empty to auto-generate" />
                                <p className="text-xs text-gray-500 mt-1">Used to verify payload. If left empty, a key will be auto-generated.</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Events to Listen</label>
                                <div className="mt-2 grid grid-cols-2 gap-4 max-h-48 overflow-y-auto p-2 border rounded-md">
                                    <div>
                                        <h4 className="font-semibold text-sm text-gray-800">User</h4>
                                        <label className="flex items-center mt-2"><input type="checkbox" name="webhook_events" value="user.created" className="h-4 w-4" /><span className="ml-2 text-sm text-gray-700">user.created</span></label>
                                        <label className="flex items-center mt-2"><input type="checkbox" name="webhook_events" value="user.updated" className="h-4 w-4" /><span className="ml-2 text-sm text-gray-700">user.updated</span></label>
                                        <label className="flex items-center mt-2"><input type="checkbox" name="webhook_events" value="user.deleted" className="h-4 w-4" /><span className="ml-2 text-sm text-gray-700">user.deleted</span></label>
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-sm text-gray-800">Billing</h4>
                                        <label className="flex items-center mt-2"><input type="checkbox" name="webhook_events" value="billing.success" className="h-4 w-4" /><span className="ml-2 text-sm text-gray-700">billing.success</span></label>
                                        <label className="flex items-center mt-2"><input type="checkbox" name="webhook_events" value="billing.failed" className="h-4 w-4" /><span className="ml-2 text-sm text-gray-700">billing.failed</span></label>
                                    </div>
                                </div>
                            </div>
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

export default WebhookManagementPage;