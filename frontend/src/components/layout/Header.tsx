'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { useUIStore, type Language } from '@/stores/uiStore';
import { useTranslation } from 'react-i18next';
import { FaBars, FaMoon, FaSun, FaBell, FaQuestionCircle, FaExclamationTriangle, FaUserPlus } from 'react-icons/fa';

export default function Header() {
  const { theme, language, toggleTheme, setLanguage } = useUIStore();
  const { t } = useTranslation();
  const params = useParams();
  const tenantKey = params.tenantKey as string;

  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const notificationsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setNotificationsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [notificationsRef]);


  return (
    <header className="bg-white shadow-sm z-10">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center">
          <button id="mobile-menu-btn" className="mobile-menu-btn mr-2 text-gray-500 hover:text-gray-700 md:hidden">
            <FaBars />
          </button>
          <h1 id="header-title" className="text-lg font-semibold text-gray-900">{t('dashboard')}</h1>
        </div>
        <div className="flex items-center space-x-4">
          <select
            id="language-selector"
            value={language}
            onChange={(e) => setLanguage(e.target.value as Language)}
            className="text-sm border border-gray-300 rounded-md px-3 py-2 bg-white"
          >
            <option value="en">English</option>
            <option value="vn">Tiếng Việt</option>
          </select>
          <button id="dark-mode-toggle" onClick={toggleTheme} className="text-gray-500 hover:text-gray-700">
            {theme === 'dark' ? <FaSun /> : <FaMoon />}
          </button>
          <div className="relative" ref={notificationsRef}>
            <button id="notifications-toggle" onClick={() => setNotificationsOpen(!notificationsOpen)} className="text-gray-500 hover:text-gray-700">
              <FaBell />
              <span
                  className="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-500 border-2 border-white dark:border-gray-800"></span>
            </button>
            {notificationsOpen && (
              <div id="notifications-popup"
                   className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl overflow-hidden z-20 border border-gray-200">
                <div className="py-2 px-4 border-b border-gray-200">
                  <h3 className="font-semibold text-gray-900">Thông báo</h3>
                </div>
                <div className="divide-y divide-gray-200 max-h-80 overflow-y-auto">
                  <a href={`/${tenantKey}/dashboard/subscriptions`} data-page="subscriptions"
                     className="flex items-start px-4 py-3 hover:bg-gray-100 transition-colors">
                    <div
                        className="w-10 h-10 bg-red-100 text-red-500 rounded-full flex-shrink-0 flex items-center justify-center">
                      <FaExclamationTriangle />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-900">Gói dịch vụ sắp hết hạn</p>
                      <p className="text-xs text-gray-500">Gói Premium của Acme Corp sẽ hết hạn trong 3 ngày.</p>
                      <p className="text-xs text-gray-400 mt-1">5 phút trước</p>
                    </div>
                  </a>
                  <a href={`/${tenantKey}/dashboard/users`} data-page="users"
                     className="flex items-start px-4 py-3 hover:bg-gray-100 transition-colors">
                    <div
                        className="w-10 h-10 bg-green-100 text-green-500 rounded-full flex-shrink-0 flex items-center justify-center">
                      <FaUserPlus />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-900">Người dùng mới đăng ký</p>
                      <p className="text-xs text-gray-500">Người dùng jane.doe@beta.inc vừa đăng ký.</p>
                      <p className="text-xs text-gray-400 mt-1">1 giờ trước</p>
                    </div>
                  </a>
                </div>
                <div className="py-2 px-4 border-t border-gray-200 dark:border-gray-200 text-center">
                  <a href={`/${tenantKey}/dashboard/alerts`} data-page="alerts"
                     className="text-sm text-blue-500 hover:underline dark:text-blue-400">Xem tất cả thông báo</a>
                </div>
              </div>
            )}
          </div>
          <div className="relative">
            <button className="text-gray-500 hover:text-gray-700">
              <a href={`/${tenantKey}/dashboard/support`} data-page="support">
                <FaQuestionCircle />
              </a>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}