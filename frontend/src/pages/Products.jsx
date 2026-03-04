import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { Spinner, StatusBadge, Pagination, PageHeader, Alert } from '../components/ui';
import { useAuth } from '../context/AuthContext';

const STOCK_STATUS = {
  in_stock:     { color: 'success',   label: 'In Stock'     },
  out_of_stock: { color: 'danger',    label: 'Out of Stock' },
  backorder:    { color: 'warning',   label: 'Backorder'    },
};

const EMPTY = {
  name: '', slug: '', sku: '', type: 'simple', description: '', short_description: '',
  price: '', sale_price: '', stock_quantity: 0, stock_status: 'in_stock',
  manage_stock: true, category_id: '', brand_id: '', is_featured: false, is_active: true,
};

export default function Products() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  /* ── extra state for images & variations ─────────────────────────────── */
  const [tab, setTab]                   = useState('general');
  const [images, setImages]             = useState([]);
  const [uploading, setUploading]       = useState(false);
  const [imageFiles, setImageFiles]     = useState(null);
  const [variations, setVariations]     = useState([]);
  const [allAttributes, setAllAttributes] = useState([]);
  const [varForm, setVarForm]           = useState(null);
  const [varSaving, setVarSaving]       = useState(false);

  const [products, setProducts]     = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState('');
  const [statusFilter, setStatus]   = useState('');
  const [page, setPage]             = useState(1);
  const [error, setError]           = useState('');
  const [success, setSuccess]       = useState('');
  const [catFilter, setCatFilter]   = useState('');
  const [brandFilter, setBrandFilter] = useState('');

  // Modal state
  const [modal, setModal]           = useState(null);
  const [form, setForm]             = useState(EMPTY);
  const [saving, setSaving]         = useState(false);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands]         = useState([]);

  /* ── data fetching ───────────────────────────────────────────────────── */
  const fetchProducts = useCallback(() => {
    setLoading(true);
    const params = { page, limit: 15, search, status: statusFilter };
    if (catFilter) params.category_id = catFilter;
    if (brandFilter) params.brand_id = brandFilter;
    api.get('/products', { params })
      .then(res => { setProducts(res.data.data); setPagination(res.data.pagination); })
      .catch(() => setError('Failed to load products'))
      .finally(() => setLoading(false));
  }, [page, search, statusFilter, catFilter, brandFilter]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  useEffect(() => {
    api.get('/categories').then(r => setCategories(r.data.categories || r.data.data || [])).catch(() => {});
    api.get('/brands').then(r => setBrands(r.data.brands || r.data.data || [])).catch(() => {});
  }, []);

  const fetchImages     = id => api.get(`/products/${id}/images`).then(r => setImages(r.data.data)).catch(() => setImages([]));
  const fetchVariations = id => api.get(`/products/${id}/variations`).then(r => setVariations(r.data.data)).catch(() => setVariations([]));
  const fetchAttributes = () =>
    api.get('/attributes').then(async res => {
      const list = res.data.data || [];
      const full = await Promise.all(list.map(async a => {
        try { const r = await api.get(`/attributes/${a.id}`); return { ...a, values: r.data.data.values || [] }; }
        catch { return { ...a, values: [] }; }
      }));
      setAllAttributes(full);
    }).catch(() => setAllAttributes([]));

  /* ── modal helpers ───────────────────────────────────────────────────── */
  const openCreate = () => { setForm(EMPTY); setTab('general'); setImages([]); setVariations([]); setVarForm(null); setModal('create'); };
  const openEdit   = (p) => {
    setForm({ ...p, sale_price: p.sale_price || '', brand_id: p.brand_id || '', category_id: p.category_id || '' });
    setTab('general'); setModal('edit');
    fetchImages(p.id); fetchVariations(p.id); fetchAttributes();
  };
  const closeModal = () => { setModal(null); setVarForm(null); };

  /* ── product CRUD ────────────────────────────────────────────────────── */
  const handleSubmit = async (e) => {
    e.preventDefault(); setSaving(true); setError('');
    try {
      if (modal === 'create') {
        const res = await api.post('/products', form);
        setSuccess('Product created — you can now add images & variations');
        const np = res.data.data;
        setForm({ ...np, sale_price: np.sale_price || '', brand_id: np.brand_id || '', category_id: np.category_id || '' });
        setModal('edit'); fetchImages(np.id); fetchVariations(np.id); fetchAttributes();
      } else {
        await api.put(`/products/${form.id}`, form);
        setSuccess('Product updated');
      }
      fetchProducts();
    } catch (err) { setError(err.response?.data?.message || 'Failed to save product'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id, name) => {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    try { await api.delete(`/products/${id}`); setSuccess('Product deleted'); fetchProducts(); }
    catch { setError('Failed to delete product'); }
  };

  /* ── image handlers ──────────────────────────────────────────────────── */
  const handleImageUpload = async () => {
    if (!imageFiles || imageFiles.length === 0) return;
    setUploading(true);
    try {
      const fd = new FormData();
      for (const f of imageFiles) fd.append('images', f);
      await api.post(`/products/${form.id}/images`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setSuccess('Images uploaded'); fetchImages(form.id);
      setImageFiles(null);
      const inp = document.getElementById('prod-img-input'); if (inp) inp.value = '';
    } catch (err) { setError(err.response?.data?.message || 'Upload failed'); }
    finally { setUploading(false); }
  };
  const handleSetPrimary = async (imgId) => {
    try { await api.put(`/products/${form.id}/images/${imgId}/primary`); fetchImages(form.id); }
    catch { setError('Failed to set primary'); }
  };
  const handleDeleteImage = async (imgId) => {
    if (!confirm('Delete this image?')) return;
    try { await api.delete(`/products/${form.id}/images/${imgId}`); fetchImages(form.id); }
    catch { setError('Failed to delete image'); }
  };

  /* ── variation handlers ──────────────────────────────────────────────── */
  const openVarCreate = () => setVarForm({ sku:'', price:'', sale_price:'', stock_quantity:0, attribute_value_ids:[] });
  const openVarEdit = v => setVarForm({
    id: v.id, sku: v.sku, price: v.price, sale_price: v.sale_price || '',
    stock_quantity: v.stock_quantity,
    attribute_value_ids: v.attributes.map(a => a.attribute_value_id),
  });
  const handleVarSubmit = async e => {
    e.preventDefault(); setVarSaving(true);
    try {
      if (varForm.id) await api.put(`/products/${form.id}/variations/${varForm.id}`, varForm);
      else await api.post(`/products/${form.id}/variations`, varForm);
      setSuccess(varForm.id ? 'Variation updated' : 'Variation created');
      fetchVariations(form.id); setVarForm(null);
    } catch (err) { setError(err.response?.data?.message || 'Failed to save variation'); }
    finally { setVarSaving(false); }
  };
  const handleVarDelete = async varId => {
    if (!confirm('Delete this variation?')) return;
    try { await api.delete(`/products/${form.id}/variations/${varId}`); fetchVariations(form.id); }
    catch { setError('Failed to delete variation'); }
  };
  const toggleAttrValue = avId =>
    setVarForm(prev => ({
      ...prev,
      attribute_value_ids: prev.attribute_value_ids.includes(avId)
        ? prev.attribute_value_ids.filter(x => x !== avId)
        : [...prev.attribute_value_ids, avId],
    }));

  return (
    <div>
      <PageHeader
        title="Products"
        subtitle="Manage your product catalogue"
        action={isAdmin && (
          <button className="btn btn-primary" onClick={openCreate}>
            <i className="bi bi-plus-lg me-1"></i> Add Product
          </button>
        )}
      />

      <Alert message={error}   type="danger"  onClose={() => setError('')} />
      <Alert message={success} type="success" onClose={() => setSuccess('')} />

      {/* Filters */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body py-2">
          <div className="row g-2 align-items-center">
            <div className="col-md-3">
              <input
                className="form-control form-control-sm"
                placeholder="Search by name or SKU..."
                value={search}
                onChange={e => { setSearch(e.target.value); setPage(1); }}
              />
            </div>
            <div className="col-md-2">
              <select className="form-select form-select-sm" value={statusFilter}
                onChange={e => { setStatus(e.target.value); setPage(1); }}>
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            <div className="col-md-2">
              <select className="form-select form-select-sm" value={catFilter}
                onChange={e => { setCatFilter(e.target.value); setPage(1); }}>
                <option value="">All Categories</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className="col-md-2">
              <select className="form-select form-select-sm" value={brandFilter}
                onChange={e => { setBrandFilter(e.target.value); setPage(1); }}>
                <option value="">All Brands</option>
                {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            </div>
            <div className="col-md-1 ms-auto text-end">
              {pagination && (
                <span className="text-muted small">{pagination.total}</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card border-0 shadow-sm">
        <div className="card-body p-0">
          {loading ? <Spinner /> : (
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead className="table-light">
                  <tr>
                    <th className="border-0 small">Product</th>
                    <th className="border-0 small">SKU</th>
                    <th className="border-0 small">Price</th>
                    <th className="border-0 small">Stock</th>
                    <th className="border-0 small">Category</th>
                    <th className="border-0 small">Status</th>
                    {isAdmin && <th className="border-0 small">Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {products.map(p => (
                    <tr key={p.id}>
                      <td>
                        <div className="small fw-semibold">{p.name}</div>
                        <div className="text-muted" style={{ fontSize: 12 }}>{p.type}</div>
                      </td>
                      <td className="small text-muted">{p.sku}</td>
                      <td className="small">
                        {p.sale_price
                          ? <><span className="text-success fw-bold">${p.sale_price}</span> <del className="text-muted">${p.price}</del></>
                          : <span className="fw-semibold">${p.price}</span>}
                      </td>
                      <td>
                        <StatusBadge value={p.stock_status} map={STOCK_STATUS} />
                        <div className="text-muted" style={{ fontSize: 11 }}>{p.stock_quantity} units</div>
                      </td>
                      <td className="small text-muted">{p.category_name || '—'}</td>
                      <td>
                        <span className={`badge bg-${p.is_active ? 'success' : 'secondary'}`}>
                          {p.is_active ? 'Active' : 'Inactive'}
                        </span>
                        {p.is_featured && <span className="badge bg-warning ms-1">Featured</span>}
                      </td>
                      {isAdmin && (
                        <td>
                          <button className="btn btn-sm btn-outline-secondary me-1" onClick={() => openEdit(p)}>
                            <i className="bi bi-pencil"></i>
                          </button>
                          <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(p.id, p.name)}>
                            <i className="bi bi-trash"></i>
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                  {products.length === 0 && (
                    <tr><td colSpan="7" className="text-center text-muted py-5">No products found</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
        <div className="card-footer bg-white border-0">
          <Pagination pagination={pagination} onChange={setPage} />
        </div>
      </div>

      {/* ═══════════════ CREATE / EDIT MODAL ═══════════════════════════ */}
      {modal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-xl modal-dialog-scrollable">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">{modal === 'create' ? 'Add Product' : `Edit: ${form.name}`}</h5>
                <button className="btn-close" onClick={closeModal} />
              </div>

              {/* Tabs (only in edit mode) */}
              {modal === 'edit' && (
                <ul className="nav nav-tabs px-3 pt-2">
                  {[
                    ['general',    'bi-info-circle', 'General'],
                    ['images',     'bi-images',      'Images',     images.length],
                    ['variations', 'bi-diagram-3',   'Variations', variations.length],
                  ].map(([key, icon, label, count]) => (
                    <li key={key} className="nav-item">
                      <button className={`nav-link ${tab === key ? 'active' : ''}`} onClick={() => setTab(key)}>
                        <i className={`bi ${icon} me-1`}></i>{label}
                        {count > 0 && <span className="badge bg-primary ms-1">{count}</span>}
                      </button>
                    </li>
                  ))}
                </ul>
              )}

              {/* ── General Tab ────────────────────────────────────────── */}
              {tab === 'general' && (
                <form onSubmit={handleSubmit}>
                  <div className="modal-body">
                    <div className="row g-3">
                      <div className="col-md-8">
                        <label className="form-label small fw-semibold">Name *</label>
                        <input className="form-control form-control-sm" required
                          value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
                      </div>
                      <div className="col-md-4">
                        <label className="form-label small fw-semibold">Type</label>
                        <select className="form-select form-select-sm" value={form.type}
                          onChange={e => setForm({ ...form, type: e.target.value })}>
                          <option value="simple">Simple</option>
                          <option value="variable">Variable</option>
                          <option value="digital">Digital</option>
                        </select>
                      </div>
                      <div className="col-md-6">
                        <label className="form-label small fw-semibold">Slug *</label>
                        <input className="form-control form-control-sm" required
                          value={form.slug} onChange={e => setForm({ ...form, slug: e.target.value })} />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label small fw-semibold">SKU *</label>
                        <input className="form-control form-control-sm" required
                          value={form.sku} onChange={e => setForm({ ...form, sku: e.target.value })} />
                      </div>
                      <div className="col-md-4">
                        <label className="form-label small fw-semibold">Price *</label>
                        <input type="number" step="0.01" className="form-control form-control-sm" required
                          value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} />
                      </div>
                      <div className="col-md-4">
                        <label className="form-label small fw-semibold">Sale Price</label>
                        <input type="number" step="0.01" className="form-control form-control-sm"
                          value={form.sale_price} onChange={e => setForm({ ...form, sale_price: e.target.value })} />
                      </div>
                      <div className="col-md-4">
                        <label className="form-label small fw-semibold">Stock Qty</label>
                        <input type="number" className="form-control form-control-sm"
                          value={form.stock_quantity} onChange={e => setForm({ ...form, stock_quantity: e.target.value })} />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label small fw-semibold">Stock Status</label>
                        <select className="form-select form-select-sm" value={form.stock_status}
                          onChange={e => setForm({ ...form, stock_status: e.target.value })}>
                          <option value="in_stock">In Stock</option>
                          <option value="out_of_stock">Out of Stock</option>
                          <option value="backorder">Backorder</option>
                        </select>
                      </div>
                      <div className="col-md-6">
                        <label className="form-label small fw-semibold">Category</label>
                        <select className="form-select form-select-sm" value={form.category_id}
                          onChange={e => setForm({ ...form, category_id: e.target.value })}>
                          <option value="">No category</option>
                          {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                      </div>
                      <div className="col-md-6">
                        <label className="form-label small fw-semibold">Brand</label>
                        <select className="form-select form-select-sm" value={form.brand_id}
                          onChange={e => setForm({ ...form, brand_id: e.target.value })}>
                          <option value="">No brand</option>
                          {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                        </select>
                      </div>
                      <div className="col-12">
                        <label className="form-label small fw-semibold">Short Description</label>
                        <textarea className="form-control form-control-sm" rows={2}
                          value={form.short_description} onChange={e => setForm({ ...form, short_description: e.target.value })} />
                      </div>
                      <div className="col-12">
                        <label className="form-label small fw-semibold">Description</label>
                        <textarea className="form-control form-control-sm" rows={3}
                          value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
                      </div>
                      <div className="col-md-4">
                        <div className="form-check">
                          <input type="checkbox" className="form-check-input" id="is_active"
                            checked={form.is_active} onChange={e => setForm({ ...form, is_active: e.target.checked })} />
                          <label className="form-check-label small" htmlFor="is_active">Active</label>
                        </div>
                      </div>
                      <div className="col-md-4">
                        <div className="form-check">
                          <input type="checkbox" className="form-check-input" id="is_featured"
                            checked={form.is_featured} onChange={e => setForm({ ...form, is_featured: e.target.checked })} />
                          <label className="form-check-label small" htmlFor="is_featured">Featured</label>
                        </div>
                      </div>
                      <div className="col-md-4">
                        <div className="form-check">
                          <input type="checkbox" className="form-check-input" id="manage_stock"
                            checked={form.manage_stock} onChange={e => setForm({ ...form, manage_stock: e.target.checked })} />
                          <label className="form-check-label small" htmlFor="manage_stock">Manage Stock</label>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button type="button" className="btn btn-secondary btn-sm" onClick={closeModal}>Cancel</button>
                    <button type="submit" className="btn btn-primary btn-sm" disabled={saving}>
                      {saving && <span className="spinner-border spinner-border-sm me-1" />}
                      {modal === 'create' ? 'Create Product' : 'Save Changes'}
                    </button>
                  </div>
                </form>
              )}

              {/* ── Images Tab ─────────────────────────────────────────── */}
              {tab === 'images' && modal === 'edit' && (
                <div>
                  <div className="modal-body">
                    {/* Upload area */}
                    <div className="border rounded p-3 mb-4 bg-light">
                      <div className="d-flex align-items-center gap-3 flex-wrap">
                        <div className="flex-grow-1">
                          <input type="file" id="prod-img-input" className="form-control form-control-sm"
                            accept="image/*" multiple onChange={e => setImageFiles(e.target.files)} />
                          <div className="form-text">Max 5 MB per file. JPG, PNG, WebP.</div>
                        </div>
                        <button className="btn btn-primary btn-sm" onClick={handleImageUpload}
                          disabled={uploading || !imageFiles || imageFiles.length === 0}>
                          {uploading
                            ? <><span className="spinner-border spinner-border-sm me-1" />Uploading…</>
                            : <><i className="bi bi-cloud-upload me-1"></i>Upload</>}
                        </button>
                      </div>
                    </div>

                    {images.length === 0 ? (
                      <div className="text-center text-muted py-5">
                        <i className="bi bi-image fs-1 d-block mb-2 opacity-25"></i>
                        No images yet. Upload some above.
                      </div>
                    ) : (
                      <div className="row g-3">
                        {images.map(img => (
                          <div key={img.id} className="col-6 col-md-4 col-lg-3">
                            <div className={`card h-100 ${img.is_primary ? 'border-primary border-2' : ''}`}>
                              <img src={img.file_url} alt={img.alt_text || img.file_name}
                                className="card-img-top" style={{ height: 140, objectFit: 'cover' }} />
                              <div className="card-body p-2 text-center">
                                {img.is_primary && <span className="badge bg-primary mb-1 d-block">Primary</span>}
                                <div className="btn-group btn-group-sm">
                                  {!img.is_primary && (
                                    <button className="btn btn-outline-primary" title="Set as primary"
                                      onClick={() => handleSetPrimary(img.id)}>
                                      <i className="bi bi-star"></i>
                                    </button>
                                  )}
                                  <button className="btn btn-outline-danger" title="Delete"
                                    onClick={() => handleDeleteImage(img.id)}>
                                    <i className="bi bi-trash"></i>
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="modal-footer">
                    <button className="btn btn-secondary btn-sm" onClick={closeModal}>Close</button>
                  </div>
                </div>
              )}

              {/* ── Variations Tab ─────────────────────────────────────── */}
              {tab === 'variations' && modal === 'edit' && (
                <div>
                  <div className="modal-body">
                    {/* Variation inline form */}
                    {varForm ? (
                      <div className="border rounded p-3 mb-4 bg-light">
                        <h6 className="fw-semibold mb-3">{varForm.id ? 'Edit Variation' : 'Add Variation'}</h6>
                        <form onSubmit={handleVarSubmit}>
                          <div className="row g-3 mb-3">
                            <div className="col-md-3">
                              <label className="form-label small fw-semibold">SKU *</label>
                              <input className="form-control form-control-sm" required
                                value={varForm.sku} onChange={e => setVarForm({ ...varForm, sku: e.target.value })} />
                            </div>
                            <div className="col-md-3">
                              <label className="form-label small fw-semibold">Price *</label>
                              <input type="number" step="0.01" className="form-control form-control-sm" required
                                value={varForm.price} onChange={e => setVarForm({ ...varForm, price: e.target.value })} />
                            </div>
                            <div className="col-md-3">
                              <label className="form-label small fw-semibold">Sale Price</label>
                              <input type="number" step="0.01" className="form-control form-control-sm"
                                value={varForm.sale_price} onChange={e => setVarForm({ ...varForm, sale_price: e.target.value })} />
                            </div>
                            <div className="col-md-3">
                              <label className="form-label small fw-semibold">Stock Qty</label>
                              <input type="number" className="form-control form-control-sm"
                                value={varForm.stock_quantity}
                                onChange={e => setVarForm({ ...varForm, stock_quantity: parseInt(e.target.value) || 0 })} />
                            </div>
                          </div>

                          {/* Attribute value chips */}
                          {allAttributes.length > 0 ? (
                            <div className="mb-3">
                              <label className="form-label small fw-semibold">Select Attribute Values</label>
                              <div className="row g-3">
                                {allAttributes.map(attr => (
                                  <div key={attr.id} className="col-md-6">
                                    <div className="border rounded p-2">
                                      <div className="small fw-semibold text-muted mb-2">{attr.name}</div>
                                      <div className="d-flex flex-wrap gap-1">
                                        {attr.values.length === 0 ? (
                                          <span className="text-muted small fst-italic">No values defined</span>
                                        ) : attr.values.map(v => {
                                          const sel = varForm.attribute_value_ids.includes(v.id);
                                          return (
                                            <button key={v.id} type="button"
                                              className={`btn btn-sm ${sel ? 'btn-primary' : 'btn-outline-secondary'}`}
                                              onClick={() => toggleAttrValue(v.id)}>
                                              {v.value}{sel && <i className="bi bi-check ms-1"></i>}
                                            </button>
                                          );
                                        })}
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ) : (
                            <div className="alert alert-info small mb-3">
                              <i className="bi bi-info-circle me-1"></i>
                              No attributes found. Create them on the <strong>Attributes</strong> page first.
                            </div>
                          )}

                          <div className="d-flex gap-2">
                            <button type="submit" className="btn btn-primary btn-sm" disabled={varSaving}>
                              {varSaving && <span className="spinner-border spinner-border-sm me-1" />}
                              {varForm.id ? 'Update Variation' : 'Add Variation'}
                            </button>
                            <button type="button" className="btn btn-outline-secondary btn-sm"
                              onClick={() => setVarForm(null)}>Cancel</button>
                          </div>
                        </form>
                      </div>
                    ) : (
                      <button className="btn btn-outline-primary btn-sm mb-3" onClick={openVarCreate}>
                        <i className="bi bi-plus-lg me-1"></i>Add Variation
                      </button>
                    )}

                    {/* Variations table */}
                    {variations.length === 0 && !varForm ? (
                      <div className="text-center text-muted py-5">
                        <i className="bi bi-diagram-3 fs-1 d-block mb-2 opacity-25"></i>
                        No variations yet. Add one above.
                      </div>
                    ) : variations.length > 0 && (
                      <div className="table-responsive">
                        <table className="table table-sm table-hover mb-0">
                          <thead className="table-light">
                            <tr>
                              <th className="border-0 small">SKU</th>
                              <th className="border-0 small">Price</th>
                              <th className="border-0 small">Stock</th>
                              <th className="border-0 small">Attributes</th>
                              <th className="border-0 small">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {variations.map(v => (
                              <tr key={v.id}>
                                <td className="small fw-semibold">{v.sku}</td>
                                <td className="small">
                                  {v.sale_price
                                    ? <><span className="text-success">${v.sale_price}</span>{' '}<del className="text-muted">${v.price}</del></>
                                    : `$${v.price}`}
                                </td>
                                <td className="small">{v.stock_quantity}</td>
                                <td>
                                  {v.attributes && v.attributes.length > 0
                                    ? v.attributes.map(a => (
                                        <span key={a.vav_id} className="badge bg-secondary me-1">
                                          {a.attribute_name}: {a.value}
                                        </span>
                                      ))
                                    : <span className="text-muted small">—</span>}
                                </td>
                                <td>
                                  <button className="btn btn-sm btn-outline-secondary me-1" onClick={() => openVarEdit(v)} title="Edit">
                                    <i className="bi bi-pencil"></i>
                                  </button>
                                  <button className="btn btn-sm btn-outline-danger" onClick={() => handleVarDelete(v.id)} title="Delete">
                                    <i className="bi bi-trash"></i>
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                  <div className="modal-footer">
                    <button className="btn btn-secondary btn-sm" onClick={closeModal}>Close</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
