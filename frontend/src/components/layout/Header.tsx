'use client';

import { useTheme } from 'next-themes';
import { useUIStore } from '@/stores/uiStore';
import { useAuthStore } from '@/stores/authStore';
import Link from 'next/link';

export function Header({ tenantPath }: { tenantPath: string }) {
  const { theme, setTheme } = useTheme();
  const { language, setLanguage } = useUIStore();
  const { user } = useAuthStore();

  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm z-10">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center">
          <button id="mobile-menu-btn" className="mobile-menu-btn mr-2 text-gray-500 hover:text-gray-700 md:hidden">
            <i className="fas fa-bars"></i>
          </button>
          <h1 id="header-title" className="text-lg font-semibold text-gray-900 dark:text-gray-100">Dashboard</h1>
        </div>
        <div className="flex items-center space-x-4">
          <select 
            id="language-selector" 
            className="text-sm border border-gray-300 rounded-md px-3 py-2 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            value={language}
            onChange={(e) => setLanguage(e.target.value as 'en' | 'vi')}
          >
            <option value="en">English</option>
            <option value="vi">Tiếng Việt</option>
          </select>
          <button 
            id="dark-mode-toggle" 
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          >
            <i className={`fas ${theme === 'dark' ? 'fa-sun' : 'fa-moon'}`}></i>
          </button>
          <div className="relative">
            <button id="notifications-toggle" className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white">
              <i className="fas fa-bell"></i>
              {/* Notification dot */}
              <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-500 border-2 border-white dark:border-gray-800"></span>
            </button>
            {/* Notifications popup would be a separate component */}
          </div>
          <div className="relative">
             <Link href={`/${tenantPath}/support`} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white">
                <i className="fas fa-question-circle"></i>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
