'use client';

import * as React from 'react';
import { useState, useEffect } from 'react';
import api from '@/lib/api';
import Link from 'next/link';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';

interface OrderRow {
  id: string; order_number: string; status: string; payment_status: string; payment_method: string;
  subtotal: number; total_amount: number; created_at: string;
  first_name: string; last_name: string; email: string;
}

const ORDER_STATUS: Record<string, { color: string; label: string }> = {
  pending:    { color: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400', label: 'Pending' },
  processing: { color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400', label: 'Processing' },
  shipped:    { color: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400', label: 'Shipped' },
  delivered:  { color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400', label: 'Delivered' },
  cancelled:  { color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400', label: 'Cancelled' },
};

const PAYMENT_STATUS: Record<string, { color: string; label: string }> = {
  paid:     { color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400', label: 'Paid' },
  unpaid:   { color: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400', label: 'Unpaid' },
  refunded: { color: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300', label: 'Refunded' },
};

function Badge({ value, map }: { value: string; map: Record<string, { color: string; label: string }> }) {
  const e = map[value] || { color: 'bg-gray-100 text-gray-800', label: value };
  return <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${e.color}`}>{e.label}</span>;
}

const fmt = (n: number) => `₹${Number(n).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;

export default function OrdersPage() {
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, pages: 1 });

  const fetchOrders = () => {
    setLoading(true);
    api.get('/orders', { params: { page, limit: 20, search, status: statusFilter || undefined, payment_status: paymentFilter || undefined } })
      .then(res => { setOrders(res.data.data); setPagination(res.data.pagination); })
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchOrders(); }, [page, statusFilter, paymentFilter]);

  const handleSearch = (e: React.FormEvent) => { e.preventDefault(); setPage(1); fetchOrders(); };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Orders</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{pagination.total} total</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <form onSubmit={handleSearch} className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by order # or email..."
            className="w-full rounded-lg border border-gray-200 bg-white py-2 pl-10 pr-4 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white" />
        </form>
        <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
          className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white">
          <option value="">All Statuses</option>
          {Object.entries(ORDER_STATUS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
        <select value={paymentFilter} onChange={e => { setPaymentFilter(e.target.value); setPage(1); }}
          className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white">
          <option value="">All Payments</option>
          {Object.entries(PAYMENT_STATUS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-950">
        {loading ? (
          <div className="flex h-64 items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-800">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Order</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Customer</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Payment</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                {orders.length === 0 ? (
                  <tr><td colSpan={6} className="px-6 py-12 text-center text-sm text-gray-500">No orders found</td></tr>
                ) : orders.map(o => (
                  <tr key={o.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors">
                    <td className="px-6 py-3">
                      <Link href={`/orders/${o.id}`} className="text-sm font-semibold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400">#{o.order_number}</Link>
                    </td>
                    <td className="px-6 py-3">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{o.first_name} {o.last_name}</p>
                      <p className="text-xs text-gray-500">{o.email}</p>
                    </td>
                    <td className="px-6 py-3 text-sm font-medium text-gray-900 dark:text-white">{fmt(o.total_amount)}</td>
                    <td className="px-6 py-3"><Badge value={o.status} map={ORDER_STATUS} /></td>
                    <td className="px-6 py-3"><Badge value={o.payment_status} map={PAYMENT_STATUS} /></td>
                    <td className="px-6 py-3 text-sm text-gray-500">{new Date(o.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="flex items-center justify-between border-t border-gray-100 px-6 py-3 dark:border-gray-800">
            <p className="text-xs text-gray-500">Page {page} of {pagination.pages}</p>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className="rounded-md border border-gray-200 p-1.5 text-gray-400 hover:text-gray-600 disabled:opacity-50 dark:border-gray-700"><ChevronLeft className="h-4 w-4" /></button>
              <button onClick={() => setPage(p => Math.min(pagination.pages, p + 1))} disabled={page === pagination.pages}
                className="rounded-md border border-gray-200 p-1.5 text-gray-400 hover:text-gray-600 disabled:opacity-50 dark:border-gray-700"><ChevronRight className="h-4 w-4" /></button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
