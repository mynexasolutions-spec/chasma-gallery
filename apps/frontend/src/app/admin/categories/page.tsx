'use client';

import * as React from 'react';
import { useState, useEffect, useRef } from 'react';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { Plus, Pencil, Trash2, ImageIcon, Upload, X } from 'lucide-react';

interface CategoryRow {
  id: string; name: string; slug: string; description: string | null;
  parent_id: string | null; parent_name: string | null; image_url: string | null;
  product_count: number;
}

const empty = { name: '', slug: '', description: '', parent_id: '' };

export default function CategoriesPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [categories, setCategories] = useState<CategoryRow[]>([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState('');
  const [success, setSuccess]       = useState('');
  const [showModal, setShowModal]   = useState(false);
  const [editing, setEditing]       = useState<CategoryRow | null>(null);
  const [form, setForm]             = useState(empty);
  const [saving, setSaving]         = useState(false);
  const [imageFile, setImageFile]   = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const fetchCategories = () => {
    api.get('/categories')
      .then(res => setCategories(res.data.categories))
      .catch(() => setError('Failed to load categories'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchCategories(); }, []);

  // Auto-dismiss success
  useEffect(() => { if (success) { const t = setTimeout(() => setSuccess(''), 3000); return () => clearTimeout(t); } }, [success]);

  const openCreate = () => {
    setEditing(null); setForm(empty); setImageFile(null); setImagePreview(''); setShowModal(true);
  };
  const openEdit = (cat: CategoryRow) => {
    setEditing(cat);
    setForm({ name: cat.name, slug: cat.slug, description: cat.description || '', parent_id: cat.parent_id || '' });
    setImageFile(null);
    setImagePreview(cat.image_url || '');
    setShowModal(true);
  };

  const generateSlug = (name: string) => name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true); setError('');
    try {
      const fd = new FormData();
      fd.append('name', form.name);
      fd.append('slug', form.slug);
      fd.append('description', form.description);
      fd.append('parent_id', form.parent_id);
      if (imageFile) fd.append('image', imageFile);

      if (editing) {
        await api.put(`/categories/${editing.id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        setSuccess('Category updated');
      } else {
        await api.post('/categories', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        setSuccess('Category created');
      }
      setShowModal(false);
      fetchCategories();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save category');
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this category?')) return;
    try {
      await api.delete(`/categories/${id}`);
      setSuccess('Category deleted');
      fetchCategories();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete category');
    }
  };

  if (loading) {
    return <div className="flex h-96 items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Categories</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{categories.length} total</p>
        </div>
        {isAdmin && (
          <button onClick={openCreate} className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition-colors">
            <Plus className="h-4 w-4" /> Add Category
          </button>
        )}
      </div>

      {error && <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-300">{error}</div>}
      {success && <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800 dark:border-green-900/50 dark:bg-green-900/20 dark:text-green-300">{success}</div>}

      <div className="rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-950">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-800">
                <th className="w-14 px-6 py-3 text-left text-xs font-medium text-gray-500">Image</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Slug</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Parent</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Products</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Description</th>
                {isAdmin && <th className="px-6 py-3 text-right text-xs font-medium text-gray-500">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
              {categories.length === 0 ? (
                <tr><td colSpan={isAdmin ? 7 : 6} className="px-6 py-12 text-center text-sm text-gray-500">No categories found</td></tr>
              ) : categories.map(cat => (
                <tr key={cat.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors">
                  <td className="px-6 py-3">
                    {cat.image_url
                      ? <img src={cat.image_url} alt="" className="h-10 w-10 rounded-md object-cover" />
                      : <div className="flex h-10 w-10 items-center justify-center rounded-md bg-gray-100 dark:bg-gray-800"><ImageIcon className="h-4 w-4 text-gray-400" /></div>
                    }
                  </td>
                  <td className="px-6 py-3 text-sm font-semibold text-gray-900 dark:text-white">{cat.name}</td>
                  <td className="px-6 py-3"><code className="text-xs text-gray-500 dark:text-gray-400">{cat.slug}</code></td>
                  <td className="px-6 py-3 text-sm text-gray-500">{cat.parent_name || '—'}</td>
                  <td className="px-6 py-3"><span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800 dark:bg-gray-800 dark:text-gray-300">{cat.product_count}</span></td>
                  <td className="px-6 py-3 text-sm text-gray-500 max-w-[200px] truncate">{cat.description || '—'}</td>
                  {isAdmin && (
                    <td className="px-6 py-3 text-right">
                      <button onClick={() => openEdit(cat)} className="rounded p-1 text-gray-400 hover:text-indigo-600 transition-colors mr-1"><Pencil className="h-4 w-4" /></button>
                      <button onClick={() => handleDelete(cat.id)} className="rounded p-1 text-gray-400 hover:text-red-600 transition-colors"><Trash2 className="h-4 w-4" /></button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowModal(false)}>
          <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl dark:bg-gray-900" onClick={e => e.stopPropagation()}>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">{editing ? 'Edit Category' : 'New Category'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Image */}
              <div className="flex items-center gap-4">
                {imagePreview
                  ? <img src={imagePreview} alt="Preview" className="h-20 w-20 rounded-lg object-cover border border-gray-200 dark:border-gray-700" />
                  : <div className="flex h-20 w-20 items-center justify-center rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700"><ImageIcon className="h-6 w-6 text-gray-400" /></div>
                }
                <div>
                  <input type="file" ref={fileRef} className="hidden" accept="image/*" onChange={handleImageChange} />
                  <button type="button" onClick={() => fileRef.current?.click()} className="inline-flex items-center gap-1 rounded-md bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700">
                    <Upload className="h-3 w-3" /> {imagePreview ? 'Change' : 'Upload'}
                  </button>
                  {imagePreview && (
                    <button type="button" onClick={() => { setImageFile(null); setImagePreview(''); if (fileRef.current) fileRef.current.value = ''; }}
                      className="ml-2 inline-flex items-center rounded-md bg-red-100 px-2 py-1.5 text-xs text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400">
                      <X className="h-3 w-3" />
                    </button>
                  )}
                  <p className="mt-1 text-xs text-gray-400">Max 5 MB. JPG, PNG, WebP.</p>
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
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Parent Category</label>
                <select value={form.parent_id} onChange={e => setForm({ ...form, parent_id: e.target.value })}
                  className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white">
                  <option value="">None (Top-level)</option>
                  {categories.filter(c => c.id !== editing?.id).map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                <textarea rows={3} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
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
