import { useState, useEffect } from 'react';
import api from '../services/api';
import { Spinner, PageHeader, Alert } from '../components/ui';

const EMPTY = { code: '', type: 'percentage', value: '', usage_limit: '', expires_at: '', is_active: true };

export default function Coupons() {
  const [coupons, setCoupons]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');
  const [success, setSuccess]   = useState('');
  const [modal, setModal]       = useState(null);
  const [form, setForm]         = useState(EMPTY);
  const [saving, setSaving]     = useState(false);

  const fetch = () => {
    setLoading(true);
    api.get('/coupons')
      .then(res => setCoupons(res.data.data))
      .catch(() => setError('Failed to load coupons'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetch(); }, []);

  const openCreate = () => { setForm(EMPTY); setModal('create'); };
  const openEdit   = (c) => {
    setForm({ ...c, expires_at: c.expires_at ? c.expires_at.slice(0, 16) : '', usage_limit: c.usage_limit || '' });
    setModal('edit');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (modal === 'create') await api.post('/coupons', form);
      else await api.put(`/coupons/${form.id}`, form);
      setSuccess(`Coupon ${modal === 'create' ? 'created' : 'updated'}`);
      setModal(null);
      fetch();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save coupon');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id, code) => {
    if (!confirm(`Delete coupon "${code}"?`)) return;
    try {
      await api.delete(`/coupons/${id}`);
      setSuccess('Coupon deleted');
      fetch();
    } catch { setError('Failed to delete coupon'); }
  };

  return (
    <div>
      <PageHeader title="Coupons" subtitle="Manage discount codes"
        action={<button className="btn btn-primary" onClick={openCreate}><i className="bi bi-plus-lg me-1"></i>Add Coupon</button>} />

      <Alert message={error}   type="danger"  onClose={() => setError('')} />
      <Alert message={success} type="success" onClose={() => setSuccess('')} />

      <div className="card border-0 shadow-sm">
        <div className="card-body p-0">
          {loading ? <Spinner /> : (
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead className="table-light">
                  <tr>
                    <th className="border-0 small">Code</th>
                    <th className="border-0 small">Type</th>
                    <th className="border-0 small">Value</th>
                    <th className="border-0 small">Used / Limit</th>
                    <th className="border-0 small">Expires</th>
                    <th className="border-0 small">Status</th>
                    <th className="border-0 small">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {coupons.map(c => (
                    <tr key={c.id}>
                      <td><code className="small">{c.code}</code></td>
                      <td><span className="badge bg-light text-dark">{c.type}</span></td>
                      <td className="small fw-semibold">
                        {c.type === 'percentage' ? `${c.value}%` : `$${c.value}`}
                      </td>
                      <td className="small text-muted">
                        {c.usage_count} / {c.usage_limit || '∞'}
                      </td>
                      <td className="small text-muted">
                        {c.expires_at ? new Date(c.expires_at).toLocaleDateString() : '—'}
                      </td>
                      <td>
                        <span className={`badge bg-${c.is_active ? 'success' : 'secondary'}`}>
                          {c.is_active ? 'Active' : 'Inactive'}
                        </span>
                        {c.expires_at && new Date(c.expires_at) < new Date() && (
                          <span className="badge bg-danger ms-1">Expired</span>
                        )}
                      </td>
                      <td>
                        <button className="btn btn-sm btn-outline-secondary me-1" onClick={() => openEdit(c)}>
                          <i className="bi bi-pencil"></i>
                        </button>
                        <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(c.id, c.code)}>
                          <i className="bi bi-trash"></i>
                        </button>
                      </td>
                    </tr>
                  ))}
                  {coupons.length === 0 && (
                    <tr><td colSpan="7" className="text-center text-muted py-5">No coupons found</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {modal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">{modal === 'create' ? 'Add Coupon' : 'Edit Coupon'}</h5>
                <button className="btn-close" onClick={() => setModal(null)} />
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="row g-3">
                    <div className="col-12">
                      <label className="form-label small fw-semibold">Code *</label>
                      <input className="form-control form-control-sm" required
                        style={{ textTransform: 'uppercase' }}
                        value={form.code} onChange={e => setForm({ ...form, code: e.target.value })} />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold">Type</label>
                      <select className="form-select form-select-sm" value={form.type}
                        onChange={e => setForm({ ...form, type: e.target.value })}>
                        <option value="percentage">Percentage (%)</option>
                        <option value="fixed">Fixed ($)</option>
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold">Value *</label>
                      <input type="number" step="0.01" className="form-control form-control-sm" required
                        value={form.value} onChange={e => setForm({ ...form, value: e.target.value })} />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold">Usage Limit</label>
                      <input type="number" className="form-control form-control-sm" placeholder="Unlimited"
                        value={form.usage_limit} onChange={e => setForm({ ...form, usage_limit: e.target.value })} />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold">Expires At</label>
                      <input type="datetime-local" className="form-control form-control-sm"
                        value={form.expires_at} onChange={e => setForm({ ...form, expires_at: e.target.value })} />
                    </div>
                    <div className="col-12">
                      <div className="form-check">
                        <input type="checkbox" className="form-check-input" id="coupon_active"
                          checked={form.is_active} onChange={e => setForm({ ...form, is_active: e.target.checked })} />
                        <label className="form-check-label small" htmlFor="coupon_active">Active</label>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary btn-sm" onClick={() => setModal(null)}>Cancel</button>
                  <button type="submit" className="btn btn-primary btn-sm" disabled={saving}>
                    {saving ? <span className="spinner-border spinner-border-sm me-1" /> : null}
                    Save
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
