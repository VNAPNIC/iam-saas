'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Bell, User, Settings, LogOut } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';

const Header = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { user, logout } = useAuthStore();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <header className="flex items-center justify-between h-16 px-6 bg-white border-b border-gray-200">
      {/* Search Bar */}
      <div className="flex items-center">
        <Search className="w-5 h-5 text-gray-500" />
        <input
          type="text"
          placeholder="Search..."
          className="px-3 py-2 ml-2 text-sm border-none rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      {/* Right side icons and user menu */}
      <div className="flex items-center">
        <button className="p-2 rounded-full hover:bg-gray-100">
          <Bell className="w-6 h-6 text-gray-600" />
        </button>
        <div className="relative ml-4">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center p-2 rounded-full hover:bg-gray-100"
            data-testid="user-menu-button" // SỬA LỖI: Thêm test ID
          >
            <User className="w-6 h-6 text-gray-600" />
          </button>
          {dropdownOpen && (
            <div className="absolute right-0 w-48 mt-2 origin-top-right bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5">
              <div className="py-1">
                <div className="px-4 py-2">
                  <p className="text-sm font-medium text-gray-900">{user?.fullName}</p>
                  <p className="text-sm text-gray-500 truncate">{user?.email}</p>
                </div>
                <div className="border-t border-gray-100"></div>
                <a href="/dashboard/profile" className="flex items-center w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-100">
                  <User className="w-4 h-4 mr-2" />
                  Profile
                </a>
                <a href="/dashboard/settings" className="flex items-center w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-100">
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </a>
                <div className="border-t border-gray-100"></div>
                <button
                  onClick={handleLogout}
                  className="flex items-center w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-100"
                  data-testid="logout-button" // SỬA LỖI: Thêm test ID
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
