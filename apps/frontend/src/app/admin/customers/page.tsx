'use client';

import * as React from 'react';
import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { Search, Plus, Pencil, Trash2, Shield, ShieldOff, ChevronLeft, ChevronRight } from 'lucide-react';

interface UserRow {
  id: string; first_name: string; last_name: string; email: string;
  role: string; status: string; created_at: string;
}

const ROLE_BADGE: Record<string, string> = {
  admin: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
  manager: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  customer: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
};

const STATUS_BADGE: Record<string, string> = {
  active: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  blocked: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
};

const empty = { first_name: '', last_name: '', email: '', password: '', role: 'customer' };

export default function CustomersPage() {
  const { user: me } = useAuth();
  const isAdmin = me?.role === 'admin';
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, pages: 1 });
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<UserRow | null>(null);
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);

  const fetchUsers = () => {
    setLoading(true);
    api.get('/users', { params: { page, limit: 20, search, role: roleFilter || undefined, status: statusFilter || undefined } })
      .then(res => { setUsers(res.data.data); setPagination(res.data.pagination); })
      .catch(() => setError('Failed to load users'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchUsers(); }, [page, roleFilter, statusFilter]);
  useEffect(() => { if (success) { const t = setTimeout(() => setSuccess(''), 3000); return () => clearTimeout(t); } }, [success]);

  const handleSearch = (e: React.FormEvent) => { e.preventDefault(); setPage(1); fetchUsers(); };

  const openCreate = () => { setEditing(null); setForm(empty); setShowModal(true); };
  const openEdit = (u: UserRow) => {
    setEditing(u); setForm({ first_name: u.first_name, last_name: u.last_name, email: u.email, password: '', role: u.role }); setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true); setError('');
    try {
      if (editing) {
        await api.put(`/users/${editing.id}`, { first_name: form.first_name, last_name: form.last_name, email: form.email, role: form.role });
        setSuccess('User updated');
      } else {
        await api.post('/users', form);
        setSuccess('User created');
      }
      setShowModal(false); fetchUsers();
    } catch (err: any) { setError(err.response?.data?.message || 'Failed to save user'); }
    setSaving(false);
  };

  const toggleStatus = async (u: UserRow) => {
    const newStatus = u.status === 'active' ? 'blocked' : 'active';
    try {
      await api.patch(`/users/${u.id}/status`, { status: newStatus });
      setSuccess(`User ${newStatus === 'active' ? 'activated' : 'blocked'}`);
      fetchUsers();
    } catch (err: any) { setError(err.response?.data?.message || 'Failed to update status'); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this user permanently?')) return;
    try { await api.delete(`/users/${id}`); setSuccess('User deleted'); fetchUsers(); }
    catch (err: any) { setError(err.response?.data?.message || 'Failed to delete user'); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Users</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{pagination.total} total</p>
        </div>
        {isAdmin && (
          <button onClick={openCreate} className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition-colors">
            <Plus className="h-4 w-4" /> Add User
          </button>
        )}
      </div>

      {error && <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-300">{error}</div>}
      {success && <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800 dark:border-green-900/50 dark:bg-green-900/20 dark:text-green-300">{success}</div>}

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <form onSubmit={handleSearch} className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or email..."
            className="w-full rounded-lg border border-gray-200 bg-white py-2 pl-10 pr-4 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white" />
        </form>
        <select value={roleFilter} onChange={e => { setRoleFilter(e.target.value); setPage(1); }}
          className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white">
          <option value="">All Roles</option>
          <option value="admin">Admin</option><option value="manager">Manager</option><option value="customer">Customer</option>
        </select>
        <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
          className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white">
          <option value="">All Statuses</option>
          <option value="active">Active</option><option value="blocked">Blocked</option>
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Joined</th>
                  {isAdmin && <th className="px-6 py-3 text-right text-xs font-medium text-gray-500">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                {users.length === 0 ? (
                  <tr><td colSpan={isAdmin ? 5 : 4} className="px-6 py-12 text-center text-sm text-gray-500">No users found</td></tr>
                ) : users.map(u => (
                  <tr key={u.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors">
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400">
                          {u.first_name[0]}{u.last_name[0]}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{u.first_name} {u.last_name}</p>
                          <p className="text-xs text-gray-500">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-3"><span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${ROLE_BADGE[u.role] || ROLE_BADGE.customer}`}>{u.role}</span></td>
                    <td className="px-6 py-3"><span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_BADGE[u.status] || STATUS_BADGE.active}`}>{u.status}</span></td>
                    <td className="px-6 py-3 text-sm text-gray-500">{new Date(u.created_at).toLocaleDateString()}</td>
                    {isAdmin && (
                      <td className="px-6 py-3 text-right">
                        <button onClick={() => toggleStatus(u)} title={u.status === 'active' ? 'Block' : 'Activate'}
                          className={`rounded p-1 mr-1 transition-colors ${u.status === 'active' ? 'text-gray-400 hover:text-amber-600' : 'text-gray-400 hover:text-green-600'}`}>
                          {u.status === 'active' ? <ShieldOff className="h-4 w-4" /> : <Shield className="h-4 w-4" />}
                        </button>
                        <button onClick={() => openEdit(u)} className="rounded p-1 text-gray-400 hover:text-indigo-600 transition-colors mr-1"><Pencil className="h-4 w-4" /></button>
                        <button onClick={() => handleDelete(u.id)} className="rounded p-1 text-gray-400 hover:text-red-600 transition-colors"><Trash2 className="h-4 w-4" /></button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

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

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowModal(false)}>
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl dark:bg-gray-900" onClick={e => e.stopPropagation()}>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">{editing ? 'Edit User' : 'New User'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">First Name *</label>
                  <input required value={form.first_name} onChange={e => setForm({ ...form, first_name: e.target.value })}
                    className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Last Name *</label>
                  <input required value={form.last_name} onChange={e => setForm({ ...form, last_name: e.target.value })}
                    className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email *</label>
                <input type="email" required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                  className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white" />
              </div>
              {!editing && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Password *</label>
                  <input type="password" required value={form.password} onChange={e => setForm({ ...form, password: e.target.value })}
                    className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white" />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Role</label>
                <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}
                  className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white">
                  <option value="customer">Customer</option><option value="manager">Manager</option><option value="admin">Admin</option>
                </select>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="rounded-md px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800">Cancel</button>
                <button type="submit" disabled={saving} className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:bg-indigo-400">
                  {saving ? 'Saving...' : editing ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
