import { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Spinner, Alert, PageHeader } from '../components/ui';

const empty = { name: '', slug: '' };

export default function Brands() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [brands, setBrands]       = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState('');
  const [success, setSuccess]     = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing]     = useState(null);
  const [form, setForm]           = useState(empty);
  const [saving, setSaving]       = useState(false);
  const [logoFile, setLogoFile]   = useState(null);
  const [logoPreview, setLogoPreview] = useState('');
  const fileRef = useRef();

  const fetchBrands = () => {
    api.get('/brands')
      .then(res => setBrands(res.data.brands))
      .catch(() => setError('Failed to load brands'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchBrands(); }, []);

  const openCreate = () => {
    setEditing(null); setForm(empty); setLogoFile(null); setLogoPreview(''); setShowModal(true);
  };
  const openEdit = (b) => {
    setEditing(b);
    setForm({ name: b.name, slug: b.slug });
    setLogoFile(null);
    setLogoPreview(b.logo_url || '');
    setShowModal(true);
  };

  const generateSlug = (name) => name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
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
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save brand');
    }
    setSaving(false);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this brand?')) return;
    try {
      await api.delete(`/brands/${id}`);
      setSuccess('Brand deleted');
      fetchBrands();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete brand');
    }
  };

  if (loading) return <Spinner />;

  return (
    <div>
      <PageHeader
        title="Brands"
        subtitle={`${brands.length} total`}
        action={isAdmin && (
          <button className="btn btn-primary btn-sm" onClick={openCreate}>
            <i className="bi bi-plus-lg me-1"></i>Add Brand
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
                <th style={{ width: 56 }}>Logo</th>
                <th>Name</th>
                <th>Slug</th>
                <th>Products</th>
                <th>Created</th>
                {isAdmin && <th className="text-end">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {brands.length === 0 ? (
                <tr><td colSpan={isAdmin ? 6 : 5} className="text-center py-4 text-muted">No brands found</td></tr>
              ) : brands.map(b => (
                <tr key={b.id}>
                  <td>
                    {b.logo_url
                      ? <img src={b.logo_url} alt="" style={{ width: 40, height: 40, objectFit: 'contain', borderRadius: 6, background: '#f8f9fa', padding: 2 }} />
                      : <div style={{ width: 40, height: 40, borderRadius: 6, background: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <i className="bi bi-building text-muted"></i>
                        </div>}
                  </td>
                  <td className="fw-semibold">{b.name}</td>
                  <td><code className="text-muted">{b.slug}</code></td>
                  <td><span className="badge bg-secondary">{b.product_count}</span></td>
                  <td className="text-muted small">{new Date(b.created_at).toLocaleDateString()}</td>
                  {isAdmin && (
                    <td className="text-end">
                      <button className="btn btn-sm btn-outline-primary me-1" onClick={() => openEdit(b)}>
                        <i className="bi bi-pencil"></i>
                      </button>
                      <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(b.id)}>
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
                  <h5 className="modal-title">{editing ? 'Edit Brand' : 'New Brand'}</h5>
                  <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
                </div>
                <div className="modal-body">
                  {/* Logo upload */}
                  <div className="mb-3">
                    <label className="form-label fw-semibold small">Brand Logo</label>
                    <div className="d-flex align-items-center gap-3">
                      {logoPreview ? (
                        <img src={logoPreview} alt="Preview" style={{ width: 80, height: 80, objectFit: 'contain', borderRadius: 8, border: '1px solid #dee2e6', background: '#f8f9fa', padding: 4 }} />
                      ) : (
                        <div style={{ width: 80, height: 80, borderRadius: 8, background: '#f8f9fa', border: '2px dashed #dee2e6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <i className="bi bi-building fs-4 text-muted"></i>
                        </div>
                      )}
                      <div>
                        <input type="file" ref={fileRef} className="d-none" accept="image/*" onChange={handleLogoChange} />
                        <button type="button" className="btn btn-sm btn-outline-primary" onClick={() => fileRef.current.click()}>
                          <i className="bi bi-upload me-1"></i>{logoPreview ? 'Change' : 'Upload'}
                        </button>
                        {logoPreview && (
                          <button type="button" className="btn btn-sm btn-outline-danger ms-1"
                            onClick={() => { setLogoFile(null); setLogoPreview(''); if(fileRef.current) fileRef.current.value=''; }}>
                            <i className="bi bi-x-lg"></i>
                          </button>
                        )}
                        <div className="form-text">Max 5 MB. JPG, PNG, WebP, SVG.</div>
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
