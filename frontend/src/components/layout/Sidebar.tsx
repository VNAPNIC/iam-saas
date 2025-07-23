'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { usePathname } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '@/stores/authStore';
import { sidebarMenu } from './sidebarMenu'; // Import the menu structure
import { FaLock, FaChevronLeft, FaUserShield } from 'react-icons/fa'; // Import specific icons

export default function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  
  const pathname = usePathname();
  const { t } = useTranslation();
  const { user, logout } = useAuthStore();
  const router = useRouter();
  const params = useParams();
  const tenantKey = params.tenantKey as string;

  const handleLogout = () => {
    logout();
    router.push(`/${tenantKey}/login`);
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
          <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center text-white font-bold">
            <FaLock />
          </div>
          <span className="logo-text ml-2 text-xl font-semibold text-gray-900">IAM SaaS</span>
        </div>
        <button id="toggle-sidebar" onClick={() => setIsCollapsed(!isCollapsed)} className="text-gray-500 hover:text-gray-700">
          <FaChevronLeft />
        </button>
      </div>

      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center">
          <div className="w-8 h-8 bg-blue-100 rounded-md flex items-center justify-center text-blue-500">
            <FaUserShield />
          </div>
          <span className="sidebar-text ml-2 font-medium text-gray-900">{user?.name || 'Super Admin'}</span>
        </div>
      </div>

      <nav id="main-nav" className="flex-1 overflow-y-auto">
        {sidebarMenu.map((section, sectionIndex) => (
          <div key={sectionIndex} className="p-2">
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-2 mb-2 sidebar-text">
              {t(section.titleKey)}
            </div>
            {section.items.map((item, itemIndex) => {
              const Icon = item.icon;
              const isActive = pathname === `/${tenantKey}${item.href}`;
              return (
                <Link
                  key={itemIndex}
                  href={`/${tenantKey}${item.href}`}
                  className={`nav-item flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                    isActive ? 'text-blue-700 bg-blue-50' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                  data-page={item.dataPage}
                >
                  <Icon className="w-5 text-center" />
                  <span className="sidebar-text ml-3">{t(item.labelKey)}</span>
                </Link>
              );
            })}
          </div>
        ))}
      </nav>
      <div className="p-4 border-t border-gray-200">
        <Link href={`/${tenantKey}/dashboard/profile`} className="flex items-center" data-page="profile">
          <img className="w-8 h-8 rounded-full"
            src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
            alt="Super Admin profile"/>
          <div className="ml-3 sidebar-text">
            <p className="text-sm font-medium text-gray-700">{user?.name || 'Super Admin'}</p>
            <p className="text-xs text-gray-500">System Admin</p>
          </div>
        </Link>
        {/* User menu dropdown - simplified for now, can be re-added if needed */}
        <button
          onClick={handleLogout}
          className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 mt-2"
          data-testid="sidebar-logout-button"
        >
          {t('logout')}
        </button>
      </div>
    </div>
  );
}