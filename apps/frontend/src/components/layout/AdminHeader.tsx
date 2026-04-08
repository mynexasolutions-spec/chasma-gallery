'use client';

import * as React from 'react';
import { useAuth } from '@/context/AuthContext';
import { ThemeToggle } from './ThemeToggle';
import { LogOut, User as UserIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function AdminHeader() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  return (
    <header className="flex h-16 flex-shrink-0 items-center justify-between border-b border-gray-200 bg-white px-6 dark:border-gray-800 dark:bg-gray-950">
      <div className="flex items-center gap-4">
        {/* Mobile menu button could go here */}
      </div>

      <div className="flex items-center gap-4">
        <ThemeToggle />
        
        <div className="flex items-center gap-3 pl-4 border-l border-gray-200 dark:border-gray-800">
          <div className="flex flex-col text-right">
            <span className="text-sm font-medium text-gray-900 dark:text-white">{user?.first_name ? `${user.first_name} ${user.last_name || ''}` : 'Admin User'}</span>
            <span className="text-xs text-gray-500 dark:text-gray-400">{user?.role || 'admin'}</span>
          </div>
          <div className="h-9 w-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300">
            <UserIcon className="h-5 w-5" />
          </div>
          <button 
            onClick={handleLogout}
            className="ml-2 text-gray-500 hover:text-red-600 transition-colors dark:text-gray-400 dark:hover:text-red-400"
            title="Log out"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </div>
    </header>
  );
}
