'use client';

import { useState, useEffect } from 'react';

const SupportTicketsPage = () => {
    // Mock data for now
    const tickets = [
        {
            id: '1',
            subject: 'Cannot log in to dashboard',
            sender: 'john.doe@example.com',
            date: '2025-07-20',
            status: 'New',
            description: 'I am unable to log in to the dashboard. I have tried resetting my password but it did not work.',
        },
        {
            id: '2',
            subject: 'Quota increase request',
            sender: 'admin@acme.com',
            date: '2025-07-19',
            status: 'Pending',
            description: 'We need to increase our user quota to 500 for a new project.',
        },
    ];

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedTicket, setSelectedTicket] = useState<any>(null);

    const openModal = (ticket: any) => {
        setSelectedTicket(ticket);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setSelectedTicket(null);
        setIsModalOpen(false);
    };

    const handleReplySubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Handle reply logic
        closeModal();
    };

    return (
        <>
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Support Ticket Management</h1>
            </div>

            <div className="card bg-white rounded-lg shadow p-4 border border-gray-200 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <input type="text" placeholder="Search by subject or sender..." className="col-span-1 text-sm border-gray-300 rounded-md p-2" />
                    <select className="text-sm border-gray-300 rounded-md p-2 bg-white">
                        <option>All Statuses</option>
                        <option>New</option>
                        <option>Pending</option>
                        <option>Closed</option>
                    </select>
                    <button className="text-sm bg-blue-600 text-white px-4 py-2 rounded-md">Filter</button>
                </div>
            </div>

            <div className="card bg-white rounded-lg shadow border border-gray-200">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase">Subject</th>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase">Sender</th>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase">Date Sent</th>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase">Status</th>
                                <th className="px-4 py-3 text-right text-xs font-medium uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {tickets.map((ticket) => (
                                <tr key={ticket.id}>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{ticket.subject}</td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{ticket.sender}</td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{ticket.date}</td>
                                    <td className="px-4 py-3 whitespace-nowrap"><span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${ticket.status === 'New' ? 'bg-blue-100 text-blue-800' : ticket.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'}`}>{ticket.status}</span></td>
                                    <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                                        <button onClick={() => openModal(ticket)} className="text-blue-600 hover:text-blue-900">View</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {isModalOpen && selectedTicket && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center">
                    <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
                        <h2 className="text-xl font-bold mb-4">Ticket Details</h2>
                        <div className="space-y-4 text-sm border-t border-b py-4">
                            <p><strong>Sender:</strong> <span id="ticket-user">{selectedTicket.sender}</span></p>
                            <p><strong>Subject:</strong> <span id="ticket-subject">{selectedTicket.subject}</span></p>
                            <div>
                                <p className="font-medium">Content:</p>
                                <div id="ticket-description" className="mt-1 p-2 bg-gray-50 rounded-md border text-gray-600">{selectedTicket.description}</div>
                            </div>
                        </div>
                        <div className="mt-4">
                            <label className="block text-sm font-medium">Reply</label>
                            <textarea rows={4} className="mt-1 w-full border rounded-md p-2" placeholder="Enter your reply..."></textarea>
                        </div>
                        <div className="flex justify-between items-center mt-4">
                            <div>
                                <label className="text-sm font-medium">Update Status:</label>
                                <select className="text-sm border-gray-300 rounded-md p-1 bg-white">
                                    <option>Pending</option>
                                    <option>Closed</option>
                                </select>
                            </div>
                            <div className="space-x-2">
                                <button onClick={closeModal} className="text-sm bg-gray-300 px-4 py-2 rounded-md">Close</button>
                                <button type="submit" onClick={handleReplySubmit} className="text-sm bg-blue-600 text-white px-4 py-2 rounded-md">Send Reply</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default SupportTicketsPage;