'use client';

import { useState } from 'react';
import { FaQuestionCircle, FaBook, FaTicketAlt } from 'react-icons/fa';

const SupportPage = () => {
    const handleTicketSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Handle ticket submission logic
        alert('Support ticket submitted!');
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
                <div className="card bg-white rounded-lg shadow p-6 border border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <FaQuestionCircle className="text-blue-500 mr-3" />
                        Frequently Asked Questions (FAQs)
                    </h2>
                    <div className="space-y-4">
                        <details className="group">
                            <summary className="flex items-center justify-between cursor-pointer text-gray-800">
                                <span className="font-medium">How do I configure SSO with Okta?</span>
                                <i className="fas fa-chevron-down group-open:rotate-180 transition-transform"></i>
                            </summary>
                            <p className="text-gray-600 mt-2 pl-4 border-l-2">
                                To configure SSO, navigate to the "SSO Integration" page, select Okta, and follow the detailed instructions provided. You will need to copy the SCIM Base URL and API Token from our system and paste them into your Okta application.
                            </p>
                        </details>
                        <details className="group">
                            <summary className="flex items-center justify-between cursor-pointer text-gray-800">
                                <span className="font-medium">Can I invite multiple users at once?</span>
                                <i className="fas fa-chevron-down group-open:rotate-180 transition-transform"></i>
                            </summary>
                            <p className="text-gray-600 mt-2 pl-4 border-l-2">
                                Yes, on the "User Management" page, you can use the "Bulk Invite" feature by uploading a CSV file containing a list of user emails and their corresponding roles.
                            </p>
                        </details>
                    </div>
                </div>
                
                <div className="card bg-white rounded-lg shadow p-6 border border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <FaBook className="text-green-500 mr-3" />
                        Documentation
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <a href="#" className="block p-4 bg-gray-50 hover:bg-gray-100 rounded-lg">
                            <p className="font-semibold text-gray-800">Webhook Integration</p>
                            <p className="text-sm text-gray-600">Detailed guide on events and HMAC authentication.</p>
                        </a>
                        <a href="#" className="block p-4 bg-gray-50 hover:bg-gray-100 rounded-lg">
                            <p className="font-semibold text-gray-800">Video Tutorials</p>
                            <p className="text-sm text-gray-600">Watch our visual step-by-step guides.</p>
                        </a>
                    </div>
                </div>
            </div>

            <div className="card bg-white rounded-lg shadow p-6 border border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <FaTicketAlt className="text-red-500 mr-3" />
                    Submit a Support Ticket
                </h2>
                <form onSubmit={handleTicketSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Subject</label>
                        <input type="text" placeholder="e.g., SIEM integration error" className="mt-1 block w-full border rounded-md p-2" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Detailed Description</label>
                        <textarea rows={5} placeholder="Please describe the issue you are facing..." className="mt-1 block w-full border rounded-md p-2"></textarea>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Attach File</label>
                        <input type="file" className="mt-1 block w-full text-sm" />
                    </div>
                    <button type="submit" className="w-full bg-blue-600 text-white font-semibold py-2 rounded-md hover:bg-blue-700">Submit Ticket</button>
                </form>
            </div>
        </div>
    );
};

export default SupportPage;