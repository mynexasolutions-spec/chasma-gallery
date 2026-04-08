'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, Package, ShoppingCart, Users, Settings, 
  Tag, Award, Ticket, Star, Layers
} from 'lucide-react';

const MENU_ITEMS = [
  { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
  { name: 'Products', href: '/admin/products', icon: Package },
  { name: 'Orders', href: '/admin/orders', icon: ShoppingCart },
  { name: 'Customers', href: '/admin/customers', icon: Users },
  { name: 'Categories', href: '/admin/categories', icon: Tag },
  { name: 'Brands', href: '/admin/brands', icon: Award },
  { name: 'Attributes', href: '/admin/attributes', icon: Layers },
  { name: 'Coupons', href: '/admin/coupons', icon: Ticket },
  { name: 'Reviews', href: '/admin/reviews', icon: Star },
  { name: 'Settings', href: '/admin/settings', icon: Settings },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 flex-shrink-0 border-r border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950 flex flex-col h-full">
      <div className="flex h-16 items-center px-6 border-b border-gray-200 dark:border-gray-800">
        <span className="font-bold text-xl tracking-tight text-gray-900 dark:text-white">StoreAdmin</span>
      </div>
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {MENU_ITEMS.map((item) => {
          const isActive = pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                isActive 
                  ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400' 
                  : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white'
              }`}
            >
              <Icon className={`h-5 w-5 ${isActive ? 'text-indigo-700 dark:text-indigo-400' : 'text-gray-400 dark:text-gray-500'}`} />
              {item.name}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
