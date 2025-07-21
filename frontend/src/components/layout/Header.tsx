'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useRouter } from 'next/navigation';

export default function Header() {
  const { user, logout } = useAuthStore();
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [menuRef]);

  return (
    <div className="header flex items-center justify-between h-16 px-4 shrink-0 sm:px-6 lg:px-8">
      <div>{/* Placeholder */}</div>
      <div className="flex items-center gap-x-4">
        <button
          type="button"
          className="p-1 text-gray-400 rounded-full hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          data-testid="notifications-button"
        >
          <span className="sr-only">View notifications</span>
          <svg className="w-6 h-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
          </svg>
        </button>

        <div className="relative" ref={menuRef}>
          <div>
            <button
              type="button"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="flex items-center p-1.5 text-sm bg-white rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              data-testid="user-menu-button"
              aria-expanded={isMenuOpen}
              aria-haspopup="true"
            >
              <span className="sr-only">Open user menu</span>
              <span className="inline-block w-8 h-8 overflow-hidden bg-gray-100 rounded-full">
                <svg className="w-full h-full text-gray-300" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 20.993V24H0v-2.993A1 1 0 001 19.503V7.497A1 1 0 000 6.503V3.007A1 1 0 001 2.007v-1.5a1 1 0 00-1-1h22a1 1 0 00-1 1v1.5a1 1 0 001 1v3.49a1 1 0 00-1 .993v12.006a1 1 0 001 1.493z" />
                </svg>
              </span>
              <span className="hidden lg:flex lg:items-center">
                <svg className="w-5 h-5 ml-2 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.25 4.25a.75.75 0 01-1.06 0L5.23 8.27a.75.75 0 01.02-1.06z" clipRule="evenodd" />
                </svg>
              </span>
            </button>
          </div>

          {isMenuOpen && (
            <div className="absolute right-0 z-10 w-48 mt-2 origin-top-right bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none" role="menu">
              <div className="py-1" role="none">
                <div className="px-4 py-2">
                  <p className="text-sm font-medium text-gray-900" data-testid="user-name">{user?.name}</p>
                  <p className="text-sm text-gray-500 truncate" data-testid="user-email">{user?.email}</p>
                </div>
                <div className="border-t border-gray-100"></div>
                <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" role="menuitem" data-testid="profile-link">Your Profile</a>
                <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" role="menuitem" data-testid="settings-link">Settings</a>
                <div className="border-t border-gray-100"></div>
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  role="menuitem"
                  data-testid="logout-button"
                >
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}