'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { usePathname } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '@/stores/authStore';

const LockIcon = () => ( <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z" clipRule="evenodd" /></svg> );
const ChevronLeftIcon = () => ( <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" /></svg> );
const UserShieldIcon = () => ( <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg> );
const TachometerIcon = () => ( <svg className="w-5 h-5 text-center" fill="currentColor" viewBox="0 0 20 20"><path d="M10 12a2 2 0 100-4 2 2 0 000 4z" /><path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" /></svg> );

export default function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  
  const pathname = usePathname();
  const { t } = useTranslation();
  const { user, logout } = useAuthStore();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [userMenuRef]);

  return (
    <div id="sidebar" className={`sidebar bg-white w-64 h-full flex flex-col border-r border-gray-200 shadow-sm ${isCollapsed ? 'collapsed' : ''}`}>
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center">
          <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center text-white font-bold"><LockIcon /></div>
          <span className="logo-text ml-2 text-xl font-semibold text-gray-900">IAM SaaS</span>
        </div>
        <button onClick={() => setIsCollapsed(!isCollapsed)} className="text-gray-500 hover:text-gray-700"><ChevronLeftIcon /></button>
      </div>

      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center">
          <div className="w-8 h-8 bg-blue-100 rounded-md flex items-center justify-center text-blue-500"><UserShieldIcon /></div>
          <span className="sidebar-text ml-2 font-medium text-gray-900">{user?.name || 'Super Admin'}</span>
        </div>
      </div>

      <nav id="main-nav" className="flex-1 overflow-y-auto p-2 space-y-2">
        <a href="#" className="nav-item flex items-center px-2 py-2 text-sm font-medium rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-50">
          <TachometerIcon />
          <span className="sidebar-text ml-3">{t('overview')}</span>
        </a>
      </nav>
      <div className="p-4 border-t border-gray-200 relative" ref={userMenuRef}>
        <button
          onClick={() => setUserMenuOpen(!userMenuOpen)}
          className="flex items-center w-full"
          data-testid="sidebar-user-menu-button"
        >
          <img className="w-8 h-8 rounded-full" src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=258&h=258&q=80" alt="User profile"/>
          <div className="ml-3 sidebar-text text-left">
            <p className="text-sm font-medium text-gray-700">{user?.name || 'Super Admin'}</p>
            <p className="text-xs text-gray-500">System Admin</p>
          </div>
        </button>
        {userMenuOpen && (
          <div className="absolute bottom-full mb-2 w-[calc(100%-2rem)] bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5">
            <div className="py-1">
              <button
                onClick={handleLogout}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                data-testid="sidebar-logout-button"
              >
                {t('logout')}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}