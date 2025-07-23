'use client';

import { useState } from 'react';
import { FaPlayCircle, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import { policyService } from '@/services/policyService';

const PolicySimulatorPage = () => {
    const [formData, setFormData] = useState({ userEmail: '', actionKey: '', contextIp: '', contextTime: '' });
    const [result, setResult] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.id]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const response = await policyService.simulate(formData);
            setResult(response.data);
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="card bg-white rounded-lg shadow p-6 border border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Simulation Parameters</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">User to Test</label>
                        <input type="email" id="user-email" value={formData.userEmail} onChange={handleChange} placeholder="e.g., john.doe@acme.com" className="mt-1 block w-full border rounded-md p-2" required />
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Action to Test</label>
                        <input type="text" id="action-key" value={formData.actionKey} onChange={handleChange} placeholder="e.g., invoice.create" className="mt-1 block w-full border rounded-md p-2" required />
                    </div>
                    
                    <div className="border-t pt-4">
                         <h3 className="text-md font-semibold text-gray-800 mb-2">Context Attributes (Optional)</h3>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700">IP Address</label>
                                <input type="text" id="context-ip" value={formData.contextIp} onChange={handleChange} placeholder="192.168.1.10" className="mt-1 block w-full border rounded-md p-2" />
                            </div>
                             <div>
                                <label className="block text-sm font-medium text-gray-700">Time</label>
                                <input type="time" id="context-time" value={formData.contextTime} onChange={handleChange} className="mt-1 block w-full border rounded-md p-2" />
                            </div>
                         </div>
                    </div>

                    <div className="flex justify-end pt-2">
                         <button type="submit" disabled={isLoading} className="w-full text-lg bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 flex items-center justify-center">
                            <FaPlayCircle className="mr-2" /> {isLoading ? 'Running...' : 'Run Simulation'}
                        </button>
                    </div>
                </form>
            </div>

            <div className="card bg-white rounded-lg shadow p-6 border border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Analysis Result</h2>
                <div className="text-center p-8 bg-gray-50 rounded-lg">
                    {!result ? (
                        <p className="text-gray-500">Enter parameters and run the simulation to see the result.</p>
                    ) : result.decision === 'ALLOWED' ? (
                        <div className="text-center p-8 bg-green-50 rounded-lg">
                            <FaCheckCircle className="fa-4x text-green-500 mb-4 mx-auto" />
                            <h3 className="text-2xl font-bold text-green-600">ALLOWED</h3>
                            <p className="text-gray-600 mt-2">User <strong className="user-email">{formData.userEmail}</strong> has permission to perform action <strong className="action-key">{formData.actionKey}</strong>.</p>
                            <div className="text-left mt-4 text-sm">
                                <h4 className="font-semibold">Reason:</h4>
                                <ul className="list-disc list-inside space-y-1 text-gray-500">
                                    <li>Granted by role: <strong className="role-name">{result.matchedRole}</strong></li>
                                    <li>Satisfies policy: <strong className="policy-name">{result.matchedPolicy}</strong></li>
                                </ul>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center p-8 bg-red-50 rounded-lg">
                            <FaTimesCircle className="fa-4x text-red-500 mb-4 mx-auto" />
                            <h3 className="text-2xl font-bold text-red-600">DENIED</h3>
                            <p className="text-gray-600 mt-2">User <strong className="user-email">{formData.userEmail}</strong> does not have permission to perform action <strong className="action-key">{formData.actionKey}</strong>.</p>
                            <div className="text-left mt-4 text-sm">
                                <h4 className="font-semibold">Reason:</h4>
                                <ul className="list-disc list-inside space-y-1 text-gray-500">
                                    <li className="reason-item">{result.reason}</li>
                                </ul>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PolicySimulatorPage;