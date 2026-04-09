'use client';

import * as React from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { AdminSidebar } from '@/components/layout/AdminSidebar';
import { AdminHeader } from '@/components/layout/AdminHeader';

const ADMIN_ROLES = new Set(['admin', 'manager']);

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const canAccessAdmin = !!user && ADMIN_ROLES.has(user.role);

  React.useEffect(() => {
    if (loading) {
      return;
    }

    if (pathname === '/admin/login') {
      if (canAccessAdmin) {
        router.replace('/admin/dashboard');
      }
      return;
    }

    if (!canAccessAdmin) {
      router.replace('/admin/login');
    }
  }, [canAccessAdmin, loading, pathname, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
      </div>
    );
  }

  // If on login page, don't show the dashboard shell
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  // Otherwise, render full Dashboard Shell
  if (!canAccessAdmin) return null;

  return (
    <div className="flex h-screen w-full bg-gray-50 dark:bg-gray-900 overflow-hidden">
      <AdminSidebar />
      <div className="flex flex-col flex-1 min-w-0">
        <AdminHeader />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
