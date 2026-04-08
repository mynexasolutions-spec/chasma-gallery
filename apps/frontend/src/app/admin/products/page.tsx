'use client';

import * as React from 'react';
import { useState, useEffect, useRef, useCallback } from 'react';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import {
  Plus, Pencil, Trash2, Search, ChevronLeft, ChevronRight,
  ImageIcon, Upload, X, Star, Package, Eye
} from 'lucide-react';

// ── Types ──────────────────────────────────────────────────────────
interface ProductRow {
  id: string; name: string; slug: string; sku: string; type: string;
  price: number; sale_price: number | null; stock_quantity: number;
  stock_status: string; is_featured: boolean; is_active: boolean;
  category_name: string | null; brand_name: string | null;
  image_url: string | null;
}

interface CategoryOption { id: string; name: string; }
interface BrandOption { id: string; name: string; }

const STOCK_STATUS: Record<string, { color: string; label: string }> = {
  in_stock:     { color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400', label: 'In Stock' },
  out_of_stock: { color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400', label: 'Out of Stock' },
  backorder:    { color: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400', label: 'Backorder' },
};

const EMPTY = {
  name: '', slug: '', sku: '', type: 'simple', description: '', short_description: '',
  price: '', sale_price: '', stock_quantity: 0, stock_status: 'in_stock',
  manage_stock: true, category_id: '', brand_id: '', is_featured: false, is_active: true,
};

const fmt = (n: number) => `₹${Number(n).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
const generateSlug = (name: string) => name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

// ── Image Manager ──────────────────────────────────────────────────
function ImageManager({ productId, onClose }: { productId: string; onClose: () => void }) {
  const [images, setImages] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const fetchImages = useCallback(() => {
    api.get(`/products/${productId}/images`).then(r => setImages(r.data.data)).catch(() => {});
  }, [productId]);

  useEffect(() => { fetchImages(); }, [fetchImages]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;
    setUploading(true);
    const fd = new FormData();
    Array.from(files).forEach(f => fd.append('images', f));
    try {
      await api.post(`/products/${productId}/images`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      fetchImages();
    } catch { }
    setUploading(false);
  };

  const setPrimary = async (imageId: string) => {
    await api.put(`/products/${productId}/images/${imageId}/primary`);
    fetchImages();
  };

  const removeImage = async (imageId: string) => {
    if (!confirm('Delete this image?')) return;
    await api.delete(`/products/${productId}/images/${imageId}`);
    fetchImages();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div className="w-full max-w-2xl rounded-xl bg-white p-6 shadow-xl dark:bg-gray-900 max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">Product Images</h2>
          <button onClick={onClose} className="rounded p-1 text-gray-400 hover:text-gray-600"><X className="h-5 w-5" /></button>
        </div>

        <div className="mb-4">
          <input type="file" ref={fileRef} className="hidden" accept="image/*" multiple onChange={handleUpload} />
          <button onClick={() => fileRef.current?.click()} disabled={uploading}
            className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:bg-indigo-400">
            <Upload className="h-4 w-4" /> {uploading ? 'Uploading...' : 'Upload Images'}
          </button>
        </div>

        {images.length === 0 ? (
          <p className="text-center text-sm text-gray-500 py-8">No images yet</p>
        ) : (
          <div className="grid grid-cols-3 gap-3">
            {images.map((img: any) => (
              <div key={img.id} className={`relative group rounded-lg overflow-hidden border-2 ${img.is_primary ? 'border-indigo-500' : 'border-gray-200 dark:border-gray-700'}`}>
                <img src={img.file_url} alt={img.alt_text || ''} className="w-full h-32 object-cover" />
                {img.is_primary && <span className="absolute top-1 left-1 rounded bg-indigo-600 px-1.5 py-0.5 text-[10px] font-bold text-white">PRIMARY</span>}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  {!img.is_primary && (
                    <button onClick={() => setPrimary(img.id)} className="rounded bg-white/90 px-2 py-1 text-xs font-medium text-gray-900 hover:bg-white">
                      <Star className="h-3 w-3 inline mr-1" />Set Primary
                    </button>
                  )}
                  <button onClick={() => removeImage(img.id)} className="rounded bg-red-600 px-2 py-1 text-xs font-medium text-white hover:bg-red-700">
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────
export default function ProductsPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [catFilter, setCatFilter] = useState('');
  const [brandFilter, setBrandFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, pages: 1 });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Modal
  const [modal, setModal] = useState<'create' | 'edit' | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [brands, setBrands] = useState<BrandOption[]>([]);

  // Image manager
  const [imageManagerId, setImageManagerId] = useState<string | null>(null);

  const fetchProducts = useCallback(() => {
    setLoading(true);
    api.get('/products', { params: { page, limit: 20, search, stock_status: statusFilter || undefined, category_id: catFilter || undefined, brand_id: brandFilter || undefined } })
      .then(res => { setProducts(res.data.data); setPagination(res.data.pagination); })
      .catch(() => setError('Failed to load products'))
      .finally(() => setLoading(false));
  }, [page, statusFilter, catFilter, brandFilter]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);
  useEffect(() => { if (success) { const t = setTimeout(() => setSuccess(''), 3000); return () => clearTimeout(t); } }, [success]);

  useEffect(() => {
    api.get('/categories').then(r => setCategories(r.data.categories)).catch(() => {});
    api.get('/brands').then(r => setBrands(r.data.brands)).catch(() => {});
  }, []);

  const handleSearch = (e: React.FormEvent) => { e.preventDefault(); setPage(1); fetchProducts(); };

  const openCreate = () => { setModal('create'); setEditingId(null); setForm(EMPTY); };
  const openEdit = (p: ProductRow) => {
    setModal('edit'); setEditingId(p.id);
    api.get(`/products/${p.id}`).then(res => {
      const d = res.data.data;
      setForm({
        name: d.name, slug: d.slug, sku: d.sku || '', type: d.type || 'simple',
        description: d.description || '', short_description: d.short_description || '',
        price: d.price, sale_price: d.sale_price || '', stock_quantity: d.stock_quantity,
        stock_status: d.stock_status, manage_stock: d.manage_stock ?? true,
        category_id: d.category_id || '', brand_id: d.brand_id || '',
        is_featured: d.is_featured, is_active: d.is_active,
      });
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true); setError('');
    try {
      const payload = {
        ...form,
        price: Number(form.price) || 0,
        sale_price: form.sale_price ? Number(form.sale_price) : null,
        stock_quantity: Number(form.stock_quantity) || 0,
        category_id: form.category_id || null,
        brand_id: form.brand_id || null,
      };
      if (modal === 'edit' && editingId) {
        await api.put(`/products/${editingId}`, payload);
        setSuccess('Product updated');
      } else {
        await api.post('/products', payload);
        setSuccess('Product created');
      }
      setModal(null); fetchProducts();
    } catch (err: any) {
      const data = err.response?.data;
      if (data?.errors) {
        setError(data.errors.map((e: any) => `${e.field}: ${e.message}`).join(', '));
      } else {
        setError(data?.message || 'Failed to save product');
      }
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this product?')) return;
    try { await api.delete(`/products/${id}`); setSuccess('Product deleted'); fetchProducts(); }
    catch (err: any) { setError(err.response?.data?.message || 'Failed to delete product'); }
  };

  const inputClass = "w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Products</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{pagination.total} total</p>
        </div>
        {isAdmin && (
          <button onClick={openCreate} className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition-colors">
            <Plus className="h-4 w-4" /> Add Product
          </button>
        )}
      </div>

      {error && <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-300">{error}</div>}
      {success && <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800 dark:border-green-900/50 dark:bg-green-900/20 dark:text-green-300">{success}</div>}

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <form onSubmit={handleSearch} className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search products..."
            className="w-full rounded-lg border border-gray-200 bg-white py-2 pl-10 pr-4 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white" />
        </form>
        <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
          className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white">
          <option value="">All Stock</option>
          {Object.entries(STOCK_STATUS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
        <select value={catFilter} onChange={e => { setCatFilter(e.target.value); setPage(1); }}
          className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white">
          <option value="">All Categories</option>
          {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <select value={brandFilter} onChange={e => { setBrandFilter(e.target.value); setPage(1); }}
          className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white">
          <option value="">All Brands</option>
          {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
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
                  <th className="w-14 px-6 py-3 text-left text-xs font-medium text-gray-500">Image</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Product</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">SKU</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Price</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Stock</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Category</th>
                  {isAdmin && <th className="px-6 py-3 text-right text-xs font-medium text-gray-500">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                {products.length === 0 ? (
                  <tr><td colSpan={isAdmin ? 8 : 7} className="px-6 py-12 text-center text-sm text-gray-500">No products found</td></tr>
                ) : products.map(p => (
                  <tr key={p.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors">
                    <td className="px-6 py-3">
                      {p.image_url
                        ? <img src={p.image_url} alt="" className="h-10 w-10 rounded-md object-cover" />
                        : <div className="flex h-10 w-10 items-center justify-center rounded-md bg-gray-100 dark:bg-gray-800"><Package className="h-4 w-4 text-gray-400" /></div>
                      }
                    </td>
                    <td className="px-6 py-3">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">{p.name}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        {p.is_featured && <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">FEATURED</span>}
                        {!p.is_active && <span className="rounded bg-gray-100 px-1.5 py-0.5 text-[10px] font-bold text-gray-500 dark:bg-gray-800">INACTIVE</span>}
                      </div>
                    </td>
                    <td className="px-6 py-3"><code className="text-xs text-gray-500">{p.sku || '—'}</code></td>
                    <td className="px-6 py-3">
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{fmt(p.price)}</span>
                      {p.sale_price && <span className="ml-1 text-xs text-green-600 dark:text-green-400">{fmt(p.sale_price)}</span>}
                    </td>
                    <td className="px-6 py-3 text-sm text-gray-600 dark:text-gray-400">{p.stock_quantity}</td>
                    <td className="px-6 py-3">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${STOCK_STATUS[p.stock_status]?.color || 'bg-gray-100 text-gray-800'}`}>
                        {STOCK_STATUS[p.stock_status]?.label || p.stock_status}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-sm text-gray-500">{p.category_name || '—'}</td>
                    {isAdmin && (
                      <td className="px-6 py-3 text-right space-x-1">
                        <button onClick={() => setImageManagerId(p.id)} title="Images" className="rounded p-1 text-gray-400 hover:text-cyan-600 transition-colors"><Eye className="h-4 w-4" /></button>
                        <button onClick={() => openEdit(p)} title="Edit" className="rounded p-1 text-gray-400 hover:text-indigo-600 transition-colors"><Pencil className="h-4 w-4" /></button>
                        <button onClick={() => handleDelete(p.id)} title="Delete" className="rounded p-1 text-gray-400 hover:text-red-600 transition-colors"><Trash2 className="h-4 w-4" /></button>
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

      {/* Image Manager Modal */}
      {imageManagerId && <ImageManager productId={imageManagerId} onClose={() => setImageManagerId(null)} />}

      {/* Create / Edit Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setModal(null)}>
          <div className="w-full max-w-2xl rounded-xl bg-white p-6 shadow-xl dark:bg-gray-900 max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">{modal === 'edit' ? 'Edit Product' : 'New Product'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name *</label>
                  <input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value, slug: modal === 'create' ? generateSlug(e.target.value) : form.slug })} className={inputClass} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Slug *</label>
                  <input required value={form.slug} onChange={e => setForm({ ...form, slug: e.target.value })} className={inputClass} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">SKU</label>
                  <input value={form.sku} onChange={e => setForm({ ...form, sku: e.target.value })} className={inputClass} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Type</label>
                  <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} className={inputClass}>
                    <option value="simple">Simple</option><option value="variable">Variable</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Price *</label>
                  <input type="number" step="0.01" required value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} className={inputClass} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Sale Price</label>
                  <input type="number" step="0.01" value={form.sale_price} onChange={e => setForm({ ...form, sale_price: e.target.value })} className={inputClass} />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Stock Qty</label>
                  <input type="number" value={form.stock_quantity} onChange={e => setForm({ ...form, stock_quantity: parseInt(e.target.value) || 0 })} className={inputClass} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Stock Status</label>
                  <select value={form.stock_status} onChange={e => setForm({ ...form, stock_status: e.target.value })} className={inputClass}>
                    {Object.entries(STOCK_STATUS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
                  <select value={form.category_id} onChange={e => setForm({ ...form, category_id: e.target.value })} className={inputClass}>
                    <option value="">None</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Brand</label>
                <select value={form.brand_id} onChange={e => setForm({ ...form, brand_id: e.target.value })} className={inputClass}>
                  <option value="">None</option>
                  {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Short Description</label>
                <textarea rows={2} value={form.short_description} onChange={e => setForm({ ...form, short_description: e.target.value })} className={inputClass} />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                <textarea rows={4} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className={inputClass} />
              </div>

              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                  <input type="checkbox" checked={form.is_featured} onChange={e => setForm({ ...form, is_featured: e.target.checked })}
                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" /> Featured
                </label>
                <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                  <input type="checkbox" checked={form.is_active} onChange={e => setForm({ ...form, is_active: e.target.checked })}
                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" /> Active
                </label>
                <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                  <input type="checkbox" checked={form.manage_stock} onChange={e => setForm({ ...form, manage_stock: e.target.checked })}
                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" /> Manage Stock
                </label>
              </div>

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
