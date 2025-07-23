'use client';

import { useState, useEffect } from 'react';
import { FaPlus } from 'react-icons/fa';
import { planService } from '@/services/planService';
import { Plan } from '@/types/plan';

const PlanManagementPage = () => {
    const [plans, setPlans] = useState<Plan[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        const fetchPlans = async () => {
            try {
                setIsLoading(true);
                const response = await planService.listPlans();
                setPlans(response.data);
            } catch (err) {
                setError('Failed to fetch plans.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchPlans();
    }, []);

    const openModal = () => setIsModalOpen(true);
    const closeModal = () => setIsModalOpen(false);

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Handle plan creation logic
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
                <h1 className="text-2xl font-bold text-gray-900">Plan Management</h1>
                <button onClick={openModal} className="text-sm bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center">
                    <FaPlus className="mr-2" /> Add Plan
                </button>
            </div>

            <div className="card bg-white rounded-lg shadow border border-gray-200">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase">Plan Name</th>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase">Price ($/month)</th>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase">User Limit</th>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase">API Call Limit</th>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase">Status</th>
                                <th className="px-4 py-3 text-right text-xs font-medium uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {plans.map((plan) => (
                                <tr key={plan.id}>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{plan.name}</td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{plan.price}</td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{plan.userLimit}</td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{plan.apiCallLimit}</td>
                                    <td className="px-4 py-3 whitespace-nowrap"><span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${plan.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>{plan.status}</span></td>
                                    <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
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
                    <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-lg">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Add New Plan</h2>
                        <form onSubmit={handleFormSubmit} className="space-y-4">
                            {/* Form fields will be added here */}
                            <div className="flex justify-end space-x-2 pt-4">
                                <button type="button" onClick={closeModal} className="text-sm bg-gray-300 px-4 py-2 rounded-md">Cancel</button>
                                <button type="submit" className="text-sm bg-blue-600 text-white px-4 py-2 rounded-md">Create Plan</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
};

export default PlanManagementPage;