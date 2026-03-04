import { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Spinner, Alert, PageHeader } from '../components/ui';

export default function Attributes() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [attributes, setAttributes] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState('');
  const [success, setSuccess]       = useState('');

  // Attribute modal
  const [showAttrModal, setShowAttrModal] = useState(false);
  const [editingAttr, setEditingAttr]     = useState(null);
  const [attrForm, setAttrForm]           = useState({ name: '', slug: '' });
  const [saving, setSaving]               = useState(false);

  // Values panel
  const [selectedAttr, setSelectedAttr]   = useState(null);
  const [values, setValues]               = useState([]);
  const [loadingValues, setLoadingValues] = useState(false);
  const [newValue, setNewValue]           = useState('');
  const [editingValue, setEditingValue]   = useState(null);
  const [editValueText, setEditValueText] = useState('');

  const generateSlug = (name) => name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

  const fetchAttributes = () => {
    api.get('/attributes')
      .then(res => setAttributes(res.data.data))
      .catch(() => setError('Failed to load attributes'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchAttributes(); }, []);

  const fetchValues = (attrId) => {
    setLoadingValues(true);
    api.get(`/attributes/${attrId}/values`)
      .then(res => setValues(res.data.data))
      .catch(() => setError('Failed to load values'))
      .finally(() => setLoadingValues(false));
  };

  const selectAttribute = (attr) => {
    setSelectedAttr(attr);
    setNewValue('');
    setEditingValue(null);
    fetchValues(attr.id);
  };

  // ── Attribute CRUD ──────────────────────────────────────────────────────────
  const openCreateAttr = () => {
    setEditingAttr(null);
    setAttrForm({ name: '', slug: '' });
    setShowAttrModal(true);
  };

  const openEditAttr = (attr) => {
    setEditingAttr(attr);
    setAttrForm({ name: attr.name, slug: attr.slug });
    setShowAttrModal(true);
  };

  const handleAttrSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      if (editingAttr) {
        await api.put(`/attributes/${editingAttr.id}`, attrForm);
        setSuccess('Attribute updated');
      } else {
        await api.post('/attributes', attrForm);
        setSuccess('Attribute created');
      }
      setShowAttrModal(false);
      fetchAttributes();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save attribute');
    }
    setSaving(false);
  };

  const deleteAttr = async (id) => {
    if (!confirm('Delete this attribute and all its values?')) return;
    try {
      await api.delete(`/attributes/${id}`);
      setSuccess('Attribute deleted');
      if (selectedAttr?.id === id) { setSelectedAttr(null); setValues([]); }
      fetchAttributes();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete attribute');
    }
  };

  // ── Value CRUD ──────────────────────────────────────────────────────────────
  const addValue = async (e) => {
    e.preventDefault();
    if (!newValue.trim()) return;
    try {
      await api.post(`/attributes/${selectedAttr.id}/values`, { value: newValue.trim() });
      setNewValue('');
      setSuccess('Value added');
      fetchValues(selectedAttr.id);
      fetchAttributes();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add value');
    }
  };

  const startEditValue = (v) => {
    setEditingValue(v.id);
    setEditValueText(v.value);
  };

  const saveEditValue = async (valueId) => {
    if (!editValueText.trim()) return;
    try {
      await api.put(`/attributes/${selectedAttr.id}/values/${valueId}`, { value: editValueText.trim() });
      setEditingValue(null);
      setSuccess('Value updated');
      fetchValues(selectedAttr.id);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update value');
    }
  };

  const deleteValue = async (valueId) => {
    if (!confirm('Delete this value?')) return;
    try {
      await api.delete(`/attributes/${selectedAttr.id}/values/${valueId}`);
      setSuccess('Value deleted');
      fetchValues(selectedAttr.id);
      fetchAttributes();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete value');
    }
  };

  if (loading) return <Spinner />;

  return (
    <div>
      <PageHeader
        title="Attributes"
        subtitle="Manage product attributes (Size, Color, etc.)"
        action={isAdmin && (
          <button className="btn btn-primary btn-sm" onClick={openCreateAttr}>
            <i className="bi bi-plus-lg me-1"></i>Add Attribute
          </button>
        )}
      />

      <Alert type="danger" message={error} onClose={() => setError('')} />
      <Alert type="success" message={success} onClose={() => setSuccess('')} />

      <div className="row g-4">
        {/* Attributes List */}
        <div className="col-md-5">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-white fw-semibold">
              <i className="bi bi-list-ul me-2"></i>Attributes
            </div>
            <div className="list-group list-group-flush">
              {attributes.length === 0 ? (
                <div className="list-group-item text-center text-muted py-4">No attributes yet</div>
              ) : attributes.map(attr => (
                <div
                  key={attr.id}
                  className={`list-group-item list-group-item-action d-flex justify-content-between align-items-center ${selectedAttr?.id === attr.id ? 'active' : ''}`}
                  style={{ cursor: 'pointer' }}
                  onClick={() => selectAttribute(attr)}
                >
                  <div>
                    <div className="fw-semibold">{attr.name}</div>
                    <div className={`small ${selectedAttr?.id === attr.id ? 'text-white-50' : 'text-muted'}`}>
                      {attr.slug} &middot; {attr.value_count} values
                    </div>
                  </div>
                  {isAdmin && (
                    <div className="d-flex gap-1" onClick={e => e.stopPropagation()}>
                      <button className={`btn btn-sm ${selectedAttr?.id === attr.id ? 'btn-light' : 'btn-outline-primary'}`}
                        onClick={() => openEditAttr(attr)}>
                        <i className="bi bi-pencil"></i>
                      </button>
                      <button className={`btn btn-sm ${selectedAttr?.id === attr.id ? 'btn-light text-danger' : 'btn-outline-danger'}`}
                        onClick={() => deleteAttr(attr.id)}>
                        <i className="bi bi-trash"></i>
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Values Panel */}
        <div className="col-md-7">
          {selectedAttr ? (
            <div className="card border-0 shadow-sm">
              <div className="card-header bg-white d-flex justify-content-between align-items-center">
                <span className="fw-semibold">
                  <i className="bi bi-tag me-2"></i>Values for "{selectedAttr.name}"
                </span>
              </div>
              <div className="card-body">
                {/* Add Value Form */}
                {isAdmin && (
                  <form onSubmit={addValue} className="d-flex gap-2 mb-3">
                    <input
                      className="form-control form-control-sm"
                      placeholder="Add a new value..."
                      value={newValue}
                      onChange={e => setNewValue(e.target.value)}
                    />
                    <button type="submit" className="btn btn-primary btn-sm" disabled={!newValue.trim()}>
                      <i className="bi bi-plus-lg"></i>
                    </button>
                  </form>
                )}

                {loadingValues ? <Spinner /> : (
                  <div>
                    {values.length === 0 ? (
                      <div className="text-center text-muted py-4">No values yet. Add one above.</div>
                    ) : (
                      <div className="d-flex flex-wrap gap-2">
                        {values.map(v => (
                          <div key={v.id} className="d-inline-flex align-items-center gap-1 border rounded-pill px-3 py-1 bg-light">
                            {editingValue === v.id ? (
                              <>
                                <input
                                  className="form-control form-control-sm border-0 bg-transparent p-0"
                                  style={{ width: 80 }}
                                  value={editValueText}
                                  onChange={e => setEditValueText(e.target.value)}
                                  onKeyDown={e => e.key === 'Enter' && saveEditValue(v.id)}
                                  autoFocus
                                />
                                <button className="btn btn-sm p-0 text-success" onClick={() => saveEditValue(v.id)}>
                                  <i className="bi bi-check-lg"></i>
                                </button>
                                <button className="btn btn-sm p-0 text-secondary" onClick={() => setEditingValue(null)}>
                                  <i className="bi bi-x-lg"></i>
                                </button>
                              </>
                            ) : (
                              <>
                                <span className="small fw-medium">{v.value}</span>
                                {isAdmin && (
                                  <>
                                    <button className="btn btn-sm p-0 text-primary ms-1" onClick={() => startEditValue(v)}>
                                      <i className="bi bi-pencil" style={{ fontSize: 11 }}></i>
                                    </button>
                                    <button className="btn btn-sm p-0 text-danger" onClick={() => deleteValue(v.id)}>
                                      <i className="bi bi-x-lg" style={{ fontSize: 11 }}></i>
                                    </button>
                                  </>
                                )}
                              </>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="card border-0 shadow-sm">
              <div className="card-body text-center text-muted py-5">
                <i className="bi bi-arrow-left-circle fs-1 d-block mb-2"></i>
                Select an attribute to manage its values
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Attribute Modal */}
      {showAttrModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <form onSubmit={handleAttrSubmit}>
                <div className="modal-header">
                  <h5 className="modal-title">{editingAttr ? 'Edit Attribute' : 'New Attribute'}</h5>
                  <button type="button" className="btn-close" onClick={() => setShowAttrModal(false)}></button>
                </div>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label fw-semibold small">Name *</label>
                    <input className="form-control" required value={attrForm.name}
                      onChange={e => setAttrForm({
                        ...attrForm,
                        name: e.target.value,
                        slug: editingAttr ? attrForm.slug : generateSlug(e.target.value)
                      })} />
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-semibold small">Slug *</label>
                    <input className="form-control" required value={attrForm.slug}
                      onChange={e => setAttrForm({ ...attrForm, slug: e.target.value })} />
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowAttrModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary" disabled={saving}>
                    {saving ? <span className="spinner-border spinner-border-sm me-1"></span> : null}
                    {editingAttr ? 'Update' : 'Create'}
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
