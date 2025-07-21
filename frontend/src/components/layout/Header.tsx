'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { useUIStore, type Language } from '@/stores/uiStore';
import { useTranslation } from '@/lib/i18n';

const BarsIcon = () => ( <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" /></svg> );
const MoonIcon = () => ( <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"></path></svg> );
const SunIcon = () => ( <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm-.707 7.072l.707-.707a1 1 0 10-1.414-1.414l-.707.707a1 1 0 001.414 1.414zM3 11a1 1 0 100-2H2a1 1 0 100 2h1z" clipRule="evenodd"></path></svg> );
const BellIcon = () => ( <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M10 2a6 6 0 00-6 6v3.586l-1.707 1.707A1 1 0 003 15h14a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z"></path></svg> );
const QuestionCircleIcon = () => ( <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" /></svg> );
const ExclamationTriangleIcon = () => ( <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.21 3.03-1.742 3.03H4.42c-1.532 0-2.492-1.696-1.742-3.03l5.58-9.92zM10 13a1 1 0 110-2 1 1 0 010 2zm-1-8a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clipRule="evenodd" /></svg> );
const UserPlusIcon = () => ( <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 11a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1v-1z"></path></svg> );

export default function Header() {
  const { theme, language, toggleTheme, setLanguage } = useUIStore();
  const { user, logout } = useAuthStore();
  const t = useTranslation();
  const router = useRouter();

  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

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
    <header className="bg-white shadow-sm z-10">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center">
          <button id="mobile-menu-btn" className="mobile-menu-btn mr-2 text-gray-500 hover:text-gray-700 md:hidden">
            <BarsIcon />
          </button>
          <h1 id="header-title" className="text-lg font-semibold text-gray-900">{t.dashboard}</h1>
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
            {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
          </button>
          <div className="relative">
            <button id="notifications-toggle" onClick={() => setNotificationsOpen(!notificationsOpen)} className="text-gray-500 hover:text-gray-700">
              <BellIcon />
              <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-500 border-2 border-white dark:border-gray-800"></span>
            </button>
            {notificationsOpen && (
              <div id="notifications-popup" className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl overflow-hidden z-20 border border-gray-200">
                <div className="py-2 px-4 border-b border-gray-200">
                  <h3 className="font-semibold text-gray-900">Thông báo</h3>
                </div>
                <div className="divide-y divide-gray-200 max-h-80 overflow-y-auto">
                  <a href="#" className="flex items-start px-4 py-3 hover:bg-gray-100 transition-colors">
                    <div className="w-10 h-10 bg-red-100 text-red-500 rounded-full flex-shrink-0 flex items-center justify-center"><ExclamationTriangleIcon /></div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-900">Gói dịch vụ sắp hết hạn</p>
                      <p className="text-xs text-gray-500">Gói Premium của Acme Corp sẽ hết hạn trong 3 ngày.</p>
                      <p className="text-xs text-gray-400 mt-1">5 phút trước</p>
                    </div>
                  </a>
                  <a href="#" className="flex items-start px-4 py-3 hover:bg-gray-100 transition-colors">
                    <div className="w-10 h-10 bg-green-100 text-green-500 rounded-full flex-shrink-0 flex items-center justify-center"><UserPlusIcon /></div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-900">Người dùng mới đăng ký</p>
                      <p className="text-xs text-gray-500">Người dùng jane.doe@beta.inc vừa đăng ký.</p>
                      <p className="text-xs text-gray-400 mt-1">1 giờ trước</p>
                    </div>
                  </a>
                </div>
                <div className="py-2 px-4 border-t border-gray-200 text-center">
                  <a href="#" className="text-sm text-blue-500 hover:underline">Xem tất cả thông báo</a>
                </div>
              </div>
            )}
          </div>
          <div className="relative">
            <a href="#" className="text-gray-500 hover:text-gray-700">
              <QuestionCircleIcon />
            </a>
          </div>
           <div className="relative" ref={userMenuRef}>
            <button
                data-testid="user-menu-button"
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center"
            >
                <img className="w-8 h-8 rounded-full" src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" alt="User profile"/>
            </button>
            {userMenuOpen && (
                 <div className="absolute right-0 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                    <div className="px-4 py-3 border-b">
                        <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                        <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                    </div>
                    <div className="py-1">
                        <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">{t.yourProfile}</a>
                    </div>
                    <div className="py-1 border-t">
                        <button
                            data-testid="logout-button"
                            onClick={handleLogout}
                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                            {t.logout}
                        </button>
                    </div>
                 </div>
            )}
           </div>
        </div>
      </div>
    </header>
  );
}