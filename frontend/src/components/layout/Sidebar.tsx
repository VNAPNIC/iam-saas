import React from 'react';
import Link from 'next/link';
import { Home, Users, Shield, Settings, LifeBuoy, LogOut } from 'lucide-react';

const Sidebar = () => {
  return (
    <aside className="hidden w-64 bg-gray-800 text-gray-200 lg:block">
      <div className="p-4">
        <h1 className="text-2xl font-bold text-white">IAM SaaS</h1>
      </div>
      <nav className="mt-4">
        <ul>
          {/* Menu Group */}
          <li className="px-4 py-2 text-xs font-semibold tracking-wider text-gray-400 uppercase">Menu</li>
          <li>
            <Link href="/dashboard" className="flex items-center px-4 py-2 hover:bg-gray-700">
              <Home className="w-5 h-5" />
              <span className="ml-3">Overview</span>
            </Link>
          </li>
          <li>
            <Link href="/dashboard/users" className="flex items-center px-4 py-2 hover:bg-gray-700">
              <Users className="w-5 h-5" />
              <span className="ml-3">Users</span>
            </Link>
          </li>
          <li>
            <Link href="/dashboard/roles" className="flex items-center px-4 py-2 hover:bg-gray-700">
              <Shield className="w-5 h-5" />
              <span className="ml-3">Roles & Permissions</span>
            </Link>
          </li>

          {/* Settings Group */}
          <li className="px-4 py-2 mt-4 text-xs font-semibold tracking-wider text-gray-400 uppercase">Management</li>
          <li>
            <Link href="/dashboard/settings" className="flex items-center px-4 py-2 hover:bg-gray-700">
              <Settings className="w-5 h-5" />
              <span className="ml-3">Tenant Settings</span>
            </Link>
          </li>
          <li>
            <Link href="/dashboard/support" className="flex items-center px-4 py-2 hover:bg-gray-700">
              <LifeBuoy className="w-5 h-5" />
              <span className="ml-3">Support</span>
            </Link>
          </li>
        </ul>
      </nav>
      <div className="absolute bottom-0 w-full p-4">
        <button className="flex items-center w-full px-4 py-2 text-left hover:bg-gray-700 rounded">
          <LogOut className="w-5 h-5" />
          <span className="ml-3">Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;