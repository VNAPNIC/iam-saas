'use client';

import { useState, useEffect } from 'react';
import { FaWindows, FaApple, FaAndroid } from 'react-icons/fa';
import { sessionService } from '@/services/sessionService';
import { Session } from '@/types/session';

const SessionManagementPage = () => {
    const [sessions, setSessions] = useState<Session[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchSessions = async () => {
            try {
                setIsLoading(true);
                const response = await sessionService.listSessions();
                setSessions(response.data);
            } catch (err) {
                setError('Failed to fetch sessions.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchSessions();
    }, []);

    const handleRevokeSession = async (sessionId: string) => {
        // Handle session revocation logic
        console.log('Revoking session:', sessionId);
    };

    if (isLoading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>{error}</div>;
    }

    return (
        <>
            <div className="card bg-white rounded-lg shadow p-4 border border-gray-200 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Search User</label>
                        <input type="text" id="user-search" placeholder="Email or user ID..." className="w-full text-sm border border-gray-300 rounded-md px-3 py-2" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">IP Address</label>
                        <input type="text" id="ip-search" placeholder="e.g., 192.168.1.1" className="w-full text-sm border border-gray-300 rounded-md px-3 py-2" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Operating System</label>
                        <select id="os-filter" className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 bg-white">
                            <option value="">All</option>
                            <option value="Windows">Windows</option>
                            <option value="macOS">macOS</option>
                            <option value="Linux">Linux</option>
                            <option value="iOS">iOS</option>
                            <option value="Android">Android</option>
                        </select>
                    </div>
                    <div className="flex items-end">
                        <button className="w-full text-sm bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">Filter</button>
                    </div>
                </div>
            </div>

            <div className="card bg-white rounded-lg shadow border border-gray-200">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Device & Browser</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">IP Address</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Logged In At</th>
                                <th className="px-4 py-3 text-right text-xs font-medium uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {sessions.map((session) => (
                                <tr key={session.id}>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{session.userEmail}</td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                        {session.os === 'Windows' && <FaWindows className="mr-2 inline-block" />}
                                        {session.os === 'macOS' && <FaApple className="mr-2 inline-block" />}
                                        {session.os === 'Linux' && <FaWindows className="mr-2 inline-block" />}
                                        {session.os === 'iOS' && <FaApple className="mr-2 inline-block" />}
                                        {session.os === 'Android' && <FaAndroid className="mr-2 inline-block" />}
                                        {session.os} {session.browser}
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{session.ipAddress}</td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{session.loggedInAt}</td>
                                    <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                                        <button onClick={() => handleRevokeSession(session.id)} className="text-red-600 hover:text-red-800">Revoke</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
};

export default SessionManagementPage;