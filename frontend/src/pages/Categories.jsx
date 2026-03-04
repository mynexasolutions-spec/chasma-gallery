import { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Spinner, Alert, PageHeader } from '../components/ui';

const empty = { name: '', slug: '', description: '', parent_id: '' };

export default function Categories() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [categories, setCategories] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState('');
  const [success, setSuccess]       = useState('');
  const [showModal, setShowModal]   = useState(false);
  const [editing, setEditing]       = useState(null);
  const [form, setForm]             = useState(empty);
  const [saving, setSaving]         = useState(false);
  const [imageFile, setImageFile]   = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const fileRef = useRef();

  const fetchCategories = () => {
    api.get('/categories')
      .then(res => setCategories(res.data.categories))
      .catch(() => setError('Failed to load categories'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchCategories(); }, []);

  const openCreate = () => {
    setEditing(null); setForm(empty); setImageFile(null); setImagePreview(''); setShowModal(true);
  };
  const openEdit = (cat) => {
    setEditing(cat);
    setForm({ name: cat.name, slug: cat.slug, description: cat.description || '', parent_id: cat.parent_id || '' });
    setImageFile(null);
    setImagePreview(cat.image_url || '');
    setShowModal(true);
  };

  const generateSlug = (name) => name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
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
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save category');
    }
    setSaving(false);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this category?')) return;
    try {
      await api.delete(`/categories/${id}`);
      setSuccess('Category deleted');
      fetchCategories();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete category');
    }
  };

  if (loading) return <Spinner />;

  return (
    <div>
      <PageHeader
        title="Categories"
        subtitle={`${categories.length} total`}
        action={isAdmin && (
          <button className="btn btn-primary btn-sm" onClick={openCreate}>
            <i className="bi bi-plus-lg me-1"></i>Add Category
          </button>
        )}
      />

      <Alert type="danger" message={error} onClose={() => setError('')} />
      <Alert type="success" message={success} onClose={() => setSuccess('')} />

      <div className="card border-0 shadow-sm">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th style={{ width: 56 }}>Image</th>
                <th>Name</th>
                <th>Slug</th>
                <th>Parent</th>
                <th>Products</th>
                <th>Description</th>
                {isAdmin && <th className="text-end">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {categories.length === 0 ? (
                <tr><td colSpan={isAdmin ? 7 : 6} className="text-center py-4 text-muted">No categories found</td></tr>
              ) : categories.map(cat => (
                <tr key={cat.id}>
                  <td>
                    {cat.image_url
                      ? <img src={cat.image_url} alt="" style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 6 }} />
                      : <div style={{ width: 40, height: 40, borderRadius: 6, background: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <i className="bi bi-image text-muted"></i>
                        </div>}
                  </td>
                  <td className="fw-semibold">{cat.name}</td>
                  <td><code className="text-muted">{cat.slug}</code></td>
                  <td>{cat.parent_name || '—'}</td>
                  <td><span className="badge bg-secondary">{cat.product_count}</span></td>
                  <td className="text-muted small" style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{cat.description || '—'}</td>
                  {isAdmin && (
                    <td className="text-end">
                      <button className="btn btn-sm btn-outline-primary me-1" onClick={() => openEdit(cat)}>
                        <i className="bi bi-pencil"></i>
                      </button>
                      <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(cat.id)}>
                        <i className="bi bi-trash"></i>
                      </button>
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
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <form onSubmit={handleSubmit}>
                <div className="modal-header">
                  <h5 className="modal-title">{editing ? 'Edit Category' : 'New Category'}</h5>
                  <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
                </div>
                <div className="modal-body">
                  {/* Image upload */}
                  <div className="mb-3">
                    <label className="form-label fw-semibold small">Category Image</label>
                    <div className="d-flex align-items-center gap-3">
                      {imagePreview ? (
                        <img src={imagePreview} alt="Preview" style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 8, border: '1px solid #dee2e6' }} />
                      ) : (
                        <div style={{ width: 80, height: 80, borderRadius: 8, background: '#f8f9fa', border: '2px dashed #dee2e6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <i className="bi bi-image fs-4 text-muted"></i>
                        </div>
                      )}
                      <div>
                        <input type="file" ref={fileRef} className="d-none" accept="image/*" onChange={handleImageChange} />
                        <button type="button" className="btn btn-sm btn-outline-primary" onClick={() => fileRef.current.click()}>
                          <i className="bi bi-upload me-1"></i>{imagePreview ? 'Change' : 'Upload'}
                        </button>
                        {imagePreview && (
                          <button type="button" className="btn btn-sm btn-outline-danger ms-1"
                            onClick={() => { setImageFile(null); setImagePreview(''); if(fileRef.current) fileRef.current.value=''; }}>
                            <i className="bi bi-x-lg"></i>
                          </button>
                        )}
                        <div className="form-text">Max 5 MB. JPG, PNG, WebP.</div>
                      </div>
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-semibold small">Name *</label>
                    <input className="form-control" required value={form.name}
                      onChange={e => setForm({ ...form, name: e.target.value, slug: editing ? form.slug : generateSlug(e.target.value) })} />
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-semibold small">Slug *</label>
                    <input className="form-control" required value={form.slug}
                      onChange={e => setForm({ ...form, slug: e.target.value })} />
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-semibold small">Parent Category</label>
                    <select className="form-select" value={form.parent_id}
                      onChange={e => setForm({ ...form, parent_id: e.target.value })}>
                      <option value="">None (Top-level)</option>
                      {categories.filter(c => c.id !== editing?.id).map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-semibold small">Description</label>
                    <textarea className="form-control" rows={3} value={form.description}
                      onChange={e => setForm({ ...form, description: e.target.value })} />
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary" disabled={saving}>
                    {saving ? <span className="spinner-border spinner-border-sm me-1"></span> : null}
                    {editing ? 'Update' : 'Create'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
