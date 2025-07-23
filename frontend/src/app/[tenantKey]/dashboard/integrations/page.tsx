'use client';

import { useState } from 'react';
import Image from 'next/image';
import { FaPlug } from 'react-icons/fa';

const IntegrationsPage = () => {
    const [isScimModalOpen, setIsScimModalOpen] = useState(false);
    const [isSiemModalOpen, setIsSiemModalOpen] = useState(false);
    const [isSalesforceModalOpen, setIsSalesforceModalOpen] = useState(false);

    const openModal = (type: string) => {
        if (type === 'scim') setIsScimModalOpen(true);
        else if (type === 'siem') setIsSiemModalOpen(true);
        else if (type === 'salesforce') setIsSalesforceModalOpen(true);
    };

    const closeModal = (type: string) => {
        if (type === 'scim') setIsScimModalOpen(false);
        else if (type === 'siem') setIsSiemModalOpen(false);
        else if (type === 'salesforce') setIsSalesforceModalOpen(false);
    };

    const handleSiemSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Handle SIEM configuration save
        closeModal('siem');
    };

    return (
        <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                <div className="card bg-white rounded-lg shadow border border-gray-200 p-6 flex flex-col">
                    <div className="flex items-center mb-4">
                        <Image src="https://www.okta.com/sites/default/files/Okta_Logo_BrightBlue_Medium.png" alt="Okta Logo" width={40} height={40} className="mr-4" />
                        <div>
                            <h3 className="font-bold text-lg text-gray-900">SCIM User Provisioning</h3>
                            <p className="text-xs text-gray-500">Automatically sync users from Okta, Azure AD.</p>
                        </div>
                    </div>
                    <div className="flex-grow"></div>
                    <div className="flex items-center justify-between">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">Not Connected</span>
                        <button className="text-sm bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700" onClick={() => openModal('scim')}>Configure</button>
                    </div>
                </div>

                <div className="card bg-white rounded-lg shadow border border-gray-200 p-6 flex flex-col">
                    <div className="flex items-center mb-4">
                        <Image src="https://www.splunk.com/content/dam/splunk2/images/2021-splunk-logo.png" alt="Splunk Logo" width={40} height={40} className="mr-4" />
                        <div>
                            <h3 className="font-bold text-lg text-gray-900">SIEM Log Forwarding</h3>
                            <p className="text-xs text-gray-500">Push Audit Logs to Splunk, ELK.</p>
                        </div>
                    </div>
                    <div className="flex-grow"></div>
                    <div className="flex items-center justify-between">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Connected</span>
                        <button className="text-sm bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700" onClick={() => openModal('siem')}>Manage</button>
                    </div>
                </div>
                
                <div className="card bg-white rounded-lg shadow border border-gray-200 p-6 flex flex-col">
                    <div className="flex items-center mb-4">
                        <Image src="https://www.salesforce.com/content/dam/web/en_us/www/images/nav/salesforce-cloud-logo-nav.png" alt="Salesforce Logo" width={40} height={40} className="mr-4" />
                        <div>
                            <h3 className="font-bold text-lg text-gray-900">Salesforce / HRIS</h3>
                            <p className="text-xs text-gray-500">Sync data via Webhooks.</p>
                        </div>
                    </div>
                    <div className="flex-grow"></div>
                    <div className="flex items-center justify-between">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">Not Connected</span>
                        <button className="text-sm bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700" onClick={() => openModal('salesforce')}>Connect</button>
                    </div>
                </div>

            </div>

            {isScimModalOpen && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center">
                    <div className="bg-white rounded-lg p-6 w-full max-w-lg">
                        <h2 className="text-lg font-semibold mb-4 text-gray-900">SCIM Configuration</h2>
                        <p className="text-sm text-gray-600 mb-4">Use the information below to configure in your Identity Provider (IdP).</p>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">SCIM Base URL (Tenant URL)</label>
                                <input type="text" readOnly value="https://api.iamsaas.com/scim/v2/your-tenant-id" className="mt-1 block w-full bg-gray-100 border rounded-md p-2" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">API Token (Secret Token)</label>
                                <input type="text" readOnly value="**********" className="mt-1 block w-full bg-gray-100 border rounded-md p-2" />
                            </div>
                        </div>
                        <div className="flex justify-end mt-6">
                            <button type="button" className="text-sm bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600" onClick={() => closeModal('scim')}>Close</button>
                        </div>
                    </div>
                </div>
            )}

            {isSiemModalOpen && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center">
                    <div className="bg-white rounded-lg p-6 w-full max-w-lg">
                        <h2 className="text-lg font-semibold mb-4 text-gray-900">SIEM Log Forwarding Configuration</h2>
                        <form onSubmit={handleSiemSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Status</label>
                                <select id="siem-status" className="mt-1 block w-full border rounded-md p-2 bg-white">
                                    <option value="enabled">Enabled</option>
                                    <option value="disabled">Disabled</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">SIEM Endpoint URL</label>
                                <input type="url" id="siem-url" placeholder="https://your-siem-instance.com/api/logs" className="mt-1 block w-full border rounded-md p-2 text-sm" required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Authorization Header</label>
                                <input type="text" id="siem-auth-header" placeholder="e.g., Bearer your_secret_token" className="mt-1 block w-full border rounded-md p-2 text-sm" />
                            </div>
                            <div className="border-t pt-4">
                                <button type="button" className="text-sm text-blue-600 hover:text-blue-800">
                                    <FaPlug className="mr-2" />Test Connection
                                </button>
                            </div>
                            <div className="flex justify-end space-x-2">
                                <button type="button" className="text-sm bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600" onClick={() => closeModal('siem')}>Close</button>
                                <button type="submit" className="text-sm bg-blue-600 text-white px-4 py-2 rounded-md">Save</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            
            {isSalesforceModalOpen && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center">
                    <div className="bg-white rounded-lg p-6 w-full max-w-lg">
                        <h2 className="text-lg font-semibold mb-4 text-gray-900">Connect Salesforce</h2>
                        <p className="text-sm text-gray-600 mb-4">To connect, please navigate to the <a href="#" className="text-blue-500 hover:underline">Webhook Management</a> page and create a new webhook for Salesforce events.</p>
                        <div className="flex justify-end mt-6">
                            <button type="button" className="text-sm bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600" onClick={() => closeModal('salesforce')}>Close</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default IntegrationsPage;