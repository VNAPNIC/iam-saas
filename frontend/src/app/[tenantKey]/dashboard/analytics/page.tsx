'use client';

import { useState, useEffect } from 'react';
import { FaDownload } from 'react-icons/fa';

const AnalyticsPage = () => {
    return (
        <>
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
                <div className="flex space-x-2">
                    <button className="text-sm bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-50 flex items-center">
                        <FaDownload className="mr-2" /> Export Data
                    </button>
                </div>
            </div>

            <div className="card bg-white rounded-lg shadow p-4 border border-gray-200 mb-6">
                <div className="flex items-center space-x-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Time Range</label>
                        <select id="time-range" className="text-sm border border-gray-300 rounded-md px-3 py-2 bg-white">
                            <option value="day">Last 24 Hours</option>
                            <option value="week">Last 7 Days</option>
                            <option value="month">Last 30 Days</option>
                            <option value="custom">Custom</option>
                        </select>
                    </div>
                    <div id="custom-date-range" className="hidden flex space-x-2">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                            <input type="date" id="start-date" className="text-sm border border-gray-300 rounded-md px-3 py-2" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                            <input type="date" id="end-date" className="text-sm border border-gray-300 rounded-md px-3 py-2" />
                        </div>
                    </div>
                    <div className="flex items-end">
                        <button id="apply-filters" className="text-sm bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
                            Apply
                        </button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="card bg-white rounded-lg shadow p-4 border border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Active Users Over Time</h2>
                    <div className="chart-container">
                        <canvas id="active-users-chart"></canvas>
                    </div>
                </div>

                <div className="card bg-white rounded-lg shadow p-4 border border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">SSO Login Success Rate</h2>
                    <div className="chart-container">
                        <canvas id="sso-login-chart"></canvas>
                    </div>
                </div>

                <div className="card bg-white rounded-lg shadow p-4 border border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">MFA Actions</h2>
                    <div className="chart-container">
                        <canvas id="mfa-actions-chart"></canvas>
                    </div>
                </div>

                <div className="card bg-white rounded-lg shadow p-4 border border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Webhook Events</h2>
                    <div className="chart-container">
                        <canvas id="webhook-events-chart"></canvas>
                    </div>
                </div>
            </div>
        </>
    );
};

export default AnalyticsPage;