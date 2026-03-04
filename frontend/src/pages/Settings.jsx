import { useState, useEffect } from 'react';
import api from '../services/api';
import { Spinner, PageHeader, Alert } from '../components/ui';

const FIELDS = [
  { key: 'store_name',               label: 'Store Name',                type: 'text'   },
  { key: 'store_email',              label: 'Store Email',               type: 'email'  },
  { key: 'currency',                 label: 'Currency',                  type: 'text'   },
  { key: 'tax_rate',                 label: 'Tax Rate (%)',              type: 'number' },
  { key: 'shipping_fee',             label: 'Shipping Fee ($)',          type: 'number' },
  { key: 'free_shipping_threshold',  label: 'Free Shipping Over ($)',    type: 'number' },
];

export default function Settings() {
  const [settings, setSettings] = useState({});
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [error, setError]       = useState('');
  const [success, setSuccess]   = useState('');

  useEffect(() => {
    api.get('/settings')
      .then(res => setSettings(res.data.data))
      .catch(() => setError('Failed to load settings'))
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put('/settings', { settings });
      setSuccess('Settings saved successfully');
    } catch {
      setError('Failed to save settings');
    } finally { setSaving(false); }
  };

  if (loading) return <Spinner />;

  return (
    <div>
      <PageHeader title="Settings" subtitle="Configure your store settings" />
      <Alert message={error}   type="danger"  onClose={() => setError('')} />
      <Alert message={success} type="success" onClose={() => setSuccess('')} />

      <div className="row justify-content-center">
        <div className="col-lg-7">
          <form onSubmit={handleSubmit}>
            <div className="card border-0 shadow-sm">
              <div className="card-header bg-white border-0 py-3">
                <h6 className="fw-bold mb-0"><i className="bi bi-gear me-2 text-primary"></i>Store Configuration</h6>
              </div>
              <div className="card-body">
                <div className="row g-3">
                  {FIELDS.map(f => (
                    <div key={f.key} className="col-md-6">
                      <label className="form-label small fw-semibold">{f.label}</label>
                      <input
                        type={f.type}
                        className="form-control form-control-sm"
                        value={settings[f.key] || ''}
                        onChange={e => setSettings({ ...settings, [f.key]: e.target.value })}
                      />
                    </div>
                  ))}
                </div>
              </div>
              <div className="card-footer bg-white border-0 text-end">
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? <span className="spinner-border spinner-border-sm me-2" /> : null}
                  <i className="bi bi-floppy me-1"></i> Save Settings
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
