'use client';

import { useState, useEffect, useCallback } from 'react';
import api from '@/lib/api';
import { Plus, Pencil, Trash2, Ticket, X } from 'lucide-react';

interface Coupon {
  id: string; code: string; type: string; value: number;
  usage_limit: number | null; usage_count: number;
  expires_at: string | null; is_active: boolean;
}

const EMPTY = { code: '', type: 'percentage', value: '', usage_limit: '', expires_at: '', is_active: true };

export default function CouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<'create' | 'edit' | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchCoupons = useCallback(() => {
    setLoading(true);
    api.get('/coupons')
      .then(r => setCoupons(r.data.data))
      .catch(() => setError('Failed to load coupons'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchCoupons(); }, [fetchCoupons]);
  useEffect(() => { if (success) { const t = setTimeout(() => setSuccess(''), 3000); return () => clearTimeout(t); } }, [success]);

  const openCreate = () => { setModal('create'); setEditingId(null); setForm(EMPTY); };
  const openEdit = (c: Coupon) => {
    setModal('edit'); setEditingId(c.id);
    setForm({
      code: c.code, type: c.type, value: String(c.value),
      usage_limit: c.usage_limit ? String(c.usage_limit) : '',
      expires_at: c.expires_at ? c.expires_at.slice(0, 10) : '',
      is_active: c.is_active,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true); setError('');
    try {
      const payload = {
        ...form, value: Number(form.value),
        usage_limit: form.usage_limit ? Number(form.usage_limit) : null,
        expires_at: form.expires_at || null,
      };
      if (modal === 'edit' && editingId) {
        await api.put(`/coupons/${editingId}`, payload);
        setSuccess('Coupon updated');
      } else {
        await api.post('/coupons', payload);
        setSuccess('Coupon created');
      }
      setModal(null); fetchCoupons();
    } catch (err: any) {
      const data = err.response?.data;
      setError(data?.errors ? data.errors.map((e: any) => `${e.field}: ${e.message}`).join(', ') : data?.message || 'Failed to save');
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this coupon?')) return;
    try { await api.delete(`/coupons/${id}`); setSuccess('Coupon deleted'); fetchCoupons(); }
    catch { setError('Failed to delete coupon'); }
  };

  const inputClass = "w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Coupons</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{coupons.length} total</p>
        </div>
        <button onClick={openCreate} className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition-colors">
          <Plus className="h-4 w-4" /> Add Coupon
        </button>
      </div>

      {error && <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-300">{error}</div>}
      {success && <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800 dark:border-green-900/50 dark:bg-green-900/20 dark:text-green-300">{success}</div>}

      <div className="rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-950">
        {loading ? (
          <div className="flex h-64 items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-800">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Code</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Discount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Usage</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Expires</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                {coupons.length === 0 ? (
                  <tr><td colSpan={6} className="px-6 py-12 text-center text-sm text-gray-500">No coupons yet</td></tr>
                ) : coupons.map(c => (
                  <tr key={c.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors">
                    <td className="px-6 py-3">
                      <div className="inline-flex items-center gap-2 rounded-md bg-gray-100 px-2.5 py-1 dark:bg-gray-800">
                        <Ticket className="h-3.5 w-3.5 text-indigo-500" />
                        <code className="text-sm font-bold text-gray-900 dark:text-white">{c.code}</code>
                      </div>
                    </td>
                    <td className="px-6 py-3 text-sm font-medium text-gray-900 dark:text-white">
                      {c.type === 'percentage' ? `${c.value}%` : `₹${c.value}`}
                    </td>
                    <td className="px-6 py-3 text-sm text-gray-500">
                      {c.usage_count}{c.usage_limit ? ` / ${c.usage_limit}` : ' / ∞'}
                    </td>
                    <td className="px-6 py-3 text-sm text-gray-500">
                      {c.expires_at ? new Date(c.expires_at).toLocaleDateString() : 'Never'}
                    </td>
                    <td className="px-6 py-3">
                      <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${c.is_active ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-100 text-gray-500 dark:bg-gray-800'}`}>
                        {c.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-right space-x-1">
                      <button onClick={() => openEdit(c)} className="rounded p-1 text-gray-400 hover:text-indigo-600 transition-colors"><Pencil className="h-4 w-4" /></button>
                      <button onClick={() => handleDelete(c.id)} className="rounded p-1 text-gray-400 hover:text-red-600 transition-colors"><Trash2 className="h-4 w-4" /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setModal(null)}>
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl dark:bg-gray-900" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">{modal === 'edit' ? 'Edit Coupon' : 'New Coupon'}</h2>
              <button onClick={() => setModal(null)} className="rounded p-1 text-gray-400 hover:text-gray-600"><X className="h-5 w-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Code *</label>
                <input required value={form.code} onChange={e => setForm({ ...form, code: e.target.value.toUpperCase() })} className={inputClass} placeholder="SAVE20" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Type *</label>
                  <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} className={inputClass}>
                    <option value="percentage">Percentage</option>
                    <option value="fixed">Fixed Amount</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Value *</label>
                  <input type="number" step="0.01" required value={form.value} onChange={e => setForm({ ...form, value: e.target.value })} className={inputClass} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Usage Limit</label>
                  <input type="number" value={form.usage_limit} onChange={e => setForm({ ...form, usage_limit: e.target.value })} className={inputClass} placeholder="Unlimited" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Expires</label>
                  <input type="date" value={form.expires_at} onChange={e => setForm({ ...form, expires_at: e.target.value })} className={inputClass} />
                </div>
              </div>
              <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                <input type="checkbox" checked={form.is_active} onChange={e => setForm({ ...form, is_active: e.target.checked })}
                  className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" /> Active
              </label>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setModal(null)} className="rounded-md px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800">Cancel</button>
                <button type="submit" disabled={saving} className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:bg-indigo-400">
                  {saving ? 'Saving...' : modal === 'edit' ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
