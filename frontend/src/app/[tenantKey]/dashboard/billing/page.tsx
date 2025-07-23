'use client';

import { useState, useEffect } from 'react';
import { FaGem } from 'react-icons/fa';

const BillingPage = () => {
    const [isQuotaModalOpen, setIsQuotaModalOpen] = useState(false);
    const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);

    const openQuotaModal = () => setIsQuotaModalOpen(true);
    const closeQuotaModal = () => setIsQuotaModalOpen(false);
    const openUpgradeModal = () => setIsUpgradeModalOpen(true);
    const closeUpgradeModal = () => setIsUpgradeModalOpen(false);

    const handleQuotaRequest = (e: React.FormEvent) => {
        e.preventDefault();
        // Handle quota request logic
        closeQuotaModal();
    };

    const handleUpgradePlan = (e: React.FormEvent) => {
        e.preventDefault();
        // Handle upgrade plan logic
        closeUpgradeModal();
    };

    return (
        <>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                <div className="lg:col-span-2 card bg-white rounded-lg shadow p-6 border border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Your Current Plan</h2>
                    <div className="flex items-center">
                        <div className="p-3 rounded-full bg-blue-100 text-blue-500 mr-4">
                            <FaGem className="fa-2x" />
                        </div>
                        <div>
                            <h3 className="text-base font-medium text-gray-900">Premium</h3>
                            <p className="text-sm text-gray-500">$99/month</p>
                            <p className="text-sm text-gray-500">Next renewal: <span className="font-semibold">Aug 15, 2025</span></p>
                        </div>
                    </div>
                    <div className="mt-4 flex space-x-2">
                        <button className="text-sm bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700" onClick={openUpgradeModal}>Upgrade Plan</button>
                        <button className="text-sm bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700">Cancel Plan</button>
                    </div>
                </div>
                
                <div className="card bg-white rounded-lg shadow p-6 border border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Quota Usage</h2>
                    <div className="space-y-4">
                        <div>
                            <div className="flex justify-between text-sm font-medium text-gray-700">
                                <span>Users</span>
                                <span>85 / 100</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2.5 mt-1">
                                <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: '85%' }}></div>
                            </div>
                        </div>
                        <div>
                            <div className="flex justify-between text-sm font-medium text-gray-700">
                                <span>Invoices</span>
                                <span>450 / 500</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2.5 mt-1">
                                <div className="bg-yellow-500 h-2.5 rounded-full" style={{ width: '90%' }}></div>
                            </div>
                        </div>
                        <div className="pt-2">
                            <button onClick={openQuotaModal} className="w-full text-sm bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700">Request Quota Increase</button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="card bg-white rounded-lg shadow p-4 border border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Payment History</h2>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Invoice</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            <tr>
                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">Jul 15, 2025</td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-800">Premium Plan Payment</td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">$99.00</td>
                                <td className="px-4 py-3 whitespace-nowrap text-right text-sm"><a href="#" className="text-blue-500 hover:underline">Download</a></td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            {isQuotaModalOpen && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center">
                    <div className="bg-white rounded-lg p-6 w-full max-w-lg">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Request Quota Increase</h2>
                        <form onSubmit={handleQuotaRequest} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Quota Type</label>
                                <select id="quota-type" className="mt-1 block w-full border rounded-md p-2 bg-white">
                                    <option>Users</option>
                                    <option>Invoices</option>
                                    <option>API Calls</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Desired Amount</label>
                                <input type="number" id="quota-amount" placeholder="e.g., 200" className="mt-1 block w-full border rounded-md p-2" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Reason</label>
                                <textarea id="quota-reason" rows={3} placeholder="We need more users for a new project..." className="mt-1 block w-full border rounded-md p-2"></textarea>
                            </div>
                            <div className="flex justify-end space-x-2">
                                <button type="button" onClick={closeQuotaModal} className="text-sm bg-gray-300 text-gray-700 px-4 py-2 rounded-md">Cancel</button>
                                <button type="submit" className="text-sm bg-blue-600 text-white px-4 py-2 rounded-md">Submit Request</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {isUpgradeModalOpen && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <h2 className="text-xl font-semibold mb-4 text-gray-900">Upgrade Plan</h2>
                        <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                            <p className="text-sm text-gray-700">You are upgrading to <strong id="upgrade-plan-name"></strong>.</p>
                            <p className="text-lg font-bold text-gray-900">Total: <span id="upgrade-price"></span></p>
                        </div>
                        <form onSubmit={handleUpgradePlan} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Card Information</label>
                                <div className="mt-1 p-3 border rounded-md" id="card-element">
                                    <div className="payment-placeholder">Enter your card details</div>
                                </div>
                            </div>
                            <button type="submit" className="w-full bg-green-600 text-white font-bold py-3 rounded-md hover:bg-green-700">Confirm Payment</button>
                            <button type="button" className="w-full text-center text-sm text-gray-600 mt-2 hover:underline" onClick={closeUpgradeModal}>Cancel</button>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
};

export default BillingPage;