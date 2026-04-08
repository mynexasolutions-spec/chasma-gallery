'use client';

import * as React from 'react';
import { useState, useEffect, useRef } from 'react';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { Plus, Pencil, Trash2, ImageIcon, Upload, X } from 'lucide-react';

interface BrandRow {
  id: string; name: string; slug: string; logo_url: string | null; product_count: number;
}

const empty = { name: '', slug: '' };

export default function BrandsPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [brands, setBrands] = useState<BrandRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<BrandRow | null>(null);
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const fetchBrands = () => {
    api.get('/brands')
      .then(res => setBrands(res.data.brands))
      .catch(() => setError('Failed to load brands'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchBrands(); }, []);
  useEffect(() => { if (success) { const t = setTimeout(() => setSuccess(''), 3000); return () => clearTimeout(t); } }, [success]);

  const openCreate = () => { setEditing(null); setForm(empty); setLogoFile(null); setLogoPreview(''); setShowModal(true); };
  const openEdit = (b: BrandRow) => {
    setEditing(b); setForm({ name: b.name, slug: b.slug }); setLogoFile(null); setLogoPreview(b.logo_url || ''); setShowModal(true);
  };

  const generateSlug = (name: string) => name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true); setError('');
    try {
      const fd = new FormData();
      fd.append('name', form.name);
      fd.append('slug', form.slug);
      if (logoFile) fd.append('logo', logoFile);

      if (editing) {
        await api.put(`/brands/${editing.id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        setSuccess('Brand updated');
      } else {
        await api.post('/brands', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        setSuccess('Brand created');
      }
      setShowModal(false);
      fetchBrands();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save brand');
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this brand?')) return;
    try { await api.delete(`/brands/${id}`); setSuccess('Brand deleted'); fetchBrands(); }
    catch (err: any) { setError(err.response?.data?.message || 'Failed to delete brand'); }
  };

  if (loading) {
    return <div className="flex h-96 items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Brands</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{brands.length} total</p>
        </div>
        {isAdmin && (
          <button onClick={openCreate} className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition-colors">
            <Plus className="h-4 w-4" /> Add Brand
          </button>
        )}
      </div>

      {error && <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-300">{error}</div>}
      {success && <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800 dark:border-green-900/50 dark:bg-green-900/20 dark:text-green-300">{success}</div>}

      {/* Card Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {brands.length === 0 ? (
          <p className="col-span-full text-center text-sm text-gray-500 py-12">No brands found</p>
        ) : brands.map(b => (
          <div key={b.id} className="group rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md dark:border-gray-800 dark:bg-gray-950">
            <div className="flex items-center gap-4">
              {b.logo_url
                ? <img src={b.logo_url} alt={b.name} className="h-12 w-12 rounded-lg object-cover" />
                : <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800"><ImageIcon className="h-5 w-5 text-gray-400" /></div>
              }
              <div className="min-w-0 flex-1">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white truncate">{b.name}</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">{b.product_count} products</p>
              </div>
            </div>
            {isAdmin && (
              <div className="mt-4 flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => openEdit(b)} className="rounded p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors"><Pencil className="h-4 w-4" /></button>
                <button onClick={() => handleDelete(b.id)} className="rounded p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"><Trash2 className="h-4 w-4" /></button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowModal(false)}>
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl dark:bg-gray-900" onClick={e => e.stopPropagation()}>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">{editing ? 'Edit Brand' : 'New Brand'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex items-center gap-4">
                {logoPreview
                  ? <img src={logoPreview} alt="Preview" className="h-16 w-16 rounded-lg object-cover border border-gray-200 dark:border-gray-700" />
                  : <div className="flex h-16 w-16 items-center justify-center rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700"><ImageIcon className="h-5 w-5 text-gray-400" /></div>
                }
                <div>
                  <input type="file" ref={fileRef} className="hidden" accept="image/*" onChange={e => { const f = e.target.files?.[0]; if (f) { setLogoFile(f); setLogoPreview(URL.createObjectURL(f)); } }} />
                  <button type="button" onClick={() => fileRef.current?.click()} className="inline-flex items-center gap-1 rounded-md bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300">
                    <Upload className="h-3 w-3" /> {logoPreview ? 'Change' : 'Upload Logo'}
                  </button>
                  {logoPreview && (
                    <button type="button" onClick={() => { setLogoFile(null); setLogoPreview(''); }} className="ml-2 inline-flex items-center rounded-md bg-red-100 px-2 py-1.5 text-xs text-red-700 dark:bg-red-900/30 dark:text-red-400"><X className="h-3 w-3" /></button>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name *</label>
                <input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value, slug: editing ? form.slug : generateSlug(e.target.value) })}
                  className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Slug *</label>
                <input required value={form.slug} onChange={e => setForm({ ...form, slug: e.target.value })}
                  className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white" />
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
