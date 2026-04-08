'use client';

import * as React from 'react';
import { useState, useEffect } from 'react';
import api from '@/lib/api';
import Link from 'next/link';
import {
  DollarSign,
  ShoppingCart,
  Users,
  Package,
  Clock,
  AlertTriangle,
  TrendingUp,
  BarChart3,
} from 'lucide-react';

// ── Status badge helper ────────────────────────────────────────────
const ORDER_STATUS: Record<string, { color: string; label: string }> = {
  pending:    { color: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',       label: 'Pending' },
  processing: { color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',           label: 'Processing' },
  shipped:    { color: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400',    label: 'Shipped' },
  delivered:  { color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',       label: 'Delivered' },
  cancelled:  { color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',               label: 'Cancelled' },
};

const PAYMENT_STATUS: Record<string, { color: string; label: string }> = {
  paid:     { color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400', label: 'Paid' },
  unpaid:   { color: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400', label: 'Unpaid' },
  refunded: { color: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',        label: 'Refunded' },
};

const CHART_COLORS = ['#6366f1', '#8b5cf6', '#a855f7', '#ec4899', '#ef4444', '#f97316', '#eab308', '#22c55e', '#14b8a6', '#06b6d4'];

function StatusBadge({ value, map }: { value: string; map: Record<string, { color: string; label: string }> }) {
  const entry = map[value] || { color: 'bg-gray-100 text-gray-800', label: value };
  return <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${entry.color}`}>{entry.label}</span>;
}

const fmt = (n: number | string) => `₹${Number(n).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;

// ── Types ──────────────────────────────────────────────────────────
interface Stats {
  total_customers: number;
  total_orders: number;
  total_revenue: number;
  active_products: number;
  pending_orders: number;
  low_stock: number;
}

interface RecentOrder {
  id: string;
  order_number: string;
  total_amount: number;
  status: string;
  payment_status: string;
  created_at: string;
  first_name: string;
  last_name: string;
  email: string;
}

interface TopProduct {
  id: string;
  name: string;
  price: number;
  stock_quantity: number;
  total_orders: number;
  revenue: number;
}

interface RevenueDay { date: string; revenue: number; orders: number; }
interface CategorySale { category: string; order_count: number; revenue: number; }
interface TopCustomer { id: string; first_name: string; last_name: string; email: string; order_count: number; total_spent: number; }

// ── Component ──────────────────────────────────────────────────────
export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [revenueData, setRevenueData] = useState<RevenueDay[]>([]);
  const [categoryData, setCategoryData] = useState<CategorySale[]>([]);
  const [topCustomers, setTopCustomers] = useState<TopCustomer[]>([]);
  const [chartDays, setChartDays] = useState(30);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/stats/overview')
      .then(res => {
        setStats(res.data.data.stats);
        setRecentOrders(res.data.data.recent_orders);
        setTopProducts(res.data.data.top_products);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    api.get('/stats/revenue-chart', { params: { days: chartDays } })
      .then(res => setRevenueData(res.data.data))
      .catch(() => {});
  }, [chartDays]);

  useEffect(() => {
    api.get('/stats/sales-by-category').then(res => setCategoryData(res.data.data)).catch(() => {});
    api.get('/stats/top-customers').then(res => setTopCustomers(res.data.data)).catch(() => {});
  }, []);

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
      </div>
    );
  }

  if (!stats) return null;

  const maxRevenue = Math.max(...revenueData.map(d => d.revenue), 1);
  const maxCatRevenue = Math.max(...categoryData.map(d => d.revenue), 1);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Welcome back! Here&apos;s what&apos;s happening.</p>
      </div>

      {/* ── Stat Cards ──────────────────────────────────────────────── */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: 'Total Revenue', value: fmt(stats.total_revenue), icon: DollarSign, accent: 'text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400' },
          { label: 'Total Orders',  value: stats.total_orders,       icon: ShoppingCart, accent: 'text-indigo-600 bg-indigo-100 dark:bg-indigo-900/30 dark:text-indigo-400', sub: `${stats.pending_orders} pending` },
          { label: 'Customers',     value: stats.total_customers,    icon: Users, accent: 'text-cyan-600 bg-cyan-100 dark:bg-cyan-900/30 dark:text-cyan-400' },
          { label: 'Active Products', value: stats.active_products,  icon: Package, accent: 'text-amber-600 bg-amber-100 dark:bg-amber-900/30 dark:text-amber-400', sub: `${stats.low_stock} low stock` },
        ].map(s => (
          <div key={s.label} className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-950">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">{s.label}</span>
              <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${s.accent}`}>
                <s.icon className="h-5 w-5" />
              </div>
            </div>
            <p className="mt-3 text-2xl font-bold text-gray-900 dark:text-white">{s.value}</p>
            {s.sub && <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{s.sub}</p>}
          </div>
        ))}
      </div>

      {/* ── Revenue Chart ───────────────────────────────────────────── */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-950">
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4 dark:border-gray-800">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-white">
            <TrendingUp className="h-4 w-4 text-green-500" /> Revenue Overview
          </h3>
          <div className="flex gap-1">
            {[7, 14, 30].map(d => (
              <button key={d} onClick={() => setChartDays(d)}
                className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
                  chartDays === d
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700'
                }`}>
                {d}d
              </button>
            ))}
          </div>
        </div>
        <div className="p-6">
          {revenueData.length === 0 ? (
            <div className="flex h-48 items-center justify-center text-sm text-gray-500">No revenue data for this period</div>
          ) : (
            <div className="overflow-x-auto">
              <div className="flex items-end gap-1" style={{ height: 200, minWidth: revenueData.length * 32 }}>
                {revenueData.map((d, i) => {
                  const h = Math.max((d.revenue / maxRevenue) * 180, 4);
                  return (
                    <div key={i} className="flex flex-1 flex-col items-center" style={{ minWidth: 28 }}>
                      <span className="mb-1 text-center text-[9px] text-gray-400">{fmt(d.revenue)}</span>
                      <div
                        className="w-full max-w-[32px] rounded-t bg-gradient-to-t from-green-600 to-green-400 transition-all duration-300"
                        style={{ height: h }}
                        title={`${new Date(d.date).toLocaleDateString()}: ${fmt(d.revenue)} (${d.orders} orders)`}
                      />
                      <span className="mt-1 text-center text-[9px] text-gray-400">
                        {new Date(d.date).toLocaleDateString('en', { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Category Sales + Top Customers ──────────────────────────── */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Sales by Category */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-950">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-white mb-4">
            <BarChart3 className="h-4 w-4 text-indigo-500" /> Sales by Category
          </h3>
          {categoryData.length === 0 ? (
            <p className="text-center text-sm text-gray-500 py-8">No category data</p>
          ) : categoryData.map((c, i) => (
            <div key={i} className="mb-4">
              <div className="flex justify-between text-sm mb-1">
                <span className="font-medium text-gray-900 dark:text-white">{c.category}</span>
                <span className="text-gray-500 dark:text-gray-400">{fmt(c.revenue)} ({c.order_count} orders)</span>
              </div>
              <div className="h-2 w-full rounded-full bg-gray-100 dark:bg-gray-800">
                <div
                  className="h-2 rounded-full transition-all duration-500"
                  style={{
                    width: `${maxCatRevenue > 0 ? (c.revenue / maxCatRevenue) * 100 : 0}%`,
                    backgroundColor: CHART_COLORS[i % CHART_COLORS.length],
                  }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Top Customers */}
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-950">
          <div className="border-b border-gray-100 px-6 py-4 dark:border-gray-800">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-white">
              <Users className="h-4 w-4 text-rose-500" /> Top Customers
            </h3>
          </div>
          {topCustomers.length === 0 ? (
            <p className="text-center text-sm text-gray-500 py-8">No customer data</p>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              {topCustomers.map(c => (
                <div key={c.id} className="flex items-center gap-3 px-6 py-3">
                  <div className="h-8 w-8 flex-shrink-0 rounded-full bg-rose-100 flex items-center justify-center text-xs font-bold text-rose-700 dark:bg-rose-900/30 dark:text-rose-400">
                    {c.first_name[0]}{c.last_name[0]}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{c.first_name} {c.last_name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{c.email}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-green-600 dark:text-green-400">{fmt(c.total_spent)}</p>
                    <p className="text-xs text-gray-500">{c.order_count} orders</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Recent Orders + Top Products ─────────────────────────────── */}
      <div className="grid gap-4 lg:grid-cols-7">
        {/* Recent Orders */}
        <div className="lg:col-span-4 rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-950">
          <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4 dark:border-gray-800">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Recent Orders</h3>
            <Link href="/orders" className="text-xs font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400">View All →</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-800">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Order</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Customer</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Payment</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                {recentOrders.map(o => (
                  <tr key={o.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors">
                    <td className="px-6 py-3 text-sm font-semibold text-indigo-600 dark:text-indigo-400">#{o.order_number}</td>
                    <td className="px-6 py-3 text-sm text-gray-600 dark:text-gray-400">{o.first_name} {o.last_name}</td>
                    <td className="px-6 py-3 text-sm font-medium text-gray-900 dark:text-white">{fmt(o.total_amount)}</td>
                    <td className="px-6 py-3"><StatusBadge value={o.status} map={ORDER_STATUS} /></td>
                    <td className="px-6 py-3"><StatusBadge value={o.payment_status} map={PAYMENT_STATUS} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Products */}
        <div className="lg:col-span-3 rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-950">
          <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4 dark:border-gray-800">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Top Products by Revenue</h3>
            <Link href="/products" className="text-xs font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400">View All →</Link>
          </div>
          <div className="p-6 space-y-4">
            {topProducts.map((p, idx) => (
              <div key={p.id} className="flex items-center gap-3">
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-indigo-100 text-sm font-bold text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400">
                  {idx + 1}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{p.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{p.total_orders} orders</p>
                </div>
                <span className="text-sm font-bold text-green-600 dark:text-green-400">{fmt(p.revenue)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Alerts ─────────────────────────────────────────────────── */}
      {(stats.pending_orders > 0 || stats.low_stock > 0) && (
        <div className="grid gap-4 md:grid-cols-2">
          {stats.pending_orders > 0 && (
            <div className="flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-900/50 dark:bg-amber-900/20">
              <Clock className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0" />
              <span className="text-sm text-amber-800 dark:text-amber-300">
                <strong>{stats.pending_orders}</strong> order(s) awaiting processing.
              </span>
              <Link href="/orders" className="ml-auto rounded-md bg-amber-600 px-3 py-1 text-xs font-medium text-white hover:bg-amber-700">Review</Link>
            </div>
          )}
          {stats.low_stock > 0 && (
            <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-900/50 dark:bg-red-900/20">
              <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0" />
              <span className="text-sm text-red-800 dark:text-red-300">
                <strong>{stats.low_stock}</strong> product(s) low on stock.
              </span>
              <Link href="/products" className="ml-auto rounded-md bg-red-600 px-3 py-1 text-xs font-medium text-white hover:bg-red-700">Review</Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
