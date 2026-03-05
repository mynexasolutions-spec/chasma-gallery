import { useState, useEffect } from 'react';
import api from '../services/api';
import { Spinner, PageHeader, Alert } from '../components/ui';

// ── Payment Gateway Definitions ──────────────────────────────────────────────
const GATEWAYS = [
    {
        id: 'razorpay',
        name: 'Razorpay',
        icon: 'bi-credit-card-2-front',
        color: '#2563eb',
        description: 'Accept payments via UPI, Cards, Netbanking & Wallets in India.',
        enableKey: 'razorpay_enabled',
        fields: [
            { key: 'razorpay_key_id', label: 'Key ID', type: 'text', placeholder: 'rzp_test_xxxxxxxx' },
            { key: 'razorpay_key_secret', label: 'Key Secret', type: 'password', placeholder: 'Enter your Razorpay Key Secret' },
        ],
    },
    {
        id: 'stripe',
        name: 'Stripe',
        icon: 'bi-stripe',
        color: '#6366f1',
        description: 'Global payments with Cards, Apple Pay, Google Pay & more.',
        enableKey: 'stripe_enabled',
        fields: [
            { key: 'stripe_publishable_key', label: 'Publishable Key', type: 'text', placeholder: 'pk_test_xxxxxxxx' },
            { key: 'stripe_secret_key', label: 'Secret Key', type: 'password', placeholder: 'Enter your Stripe Secret Key' },
        ],
    },
    {
        id: 'paypal',
        name: 'PayPal',
        icon: 'bi-paypal',
        color: '#0070ba',
        description: 'Accept PayPal, Venmo and Credit/Debit card payments worldwide.',
        enableKey: 'paypal_enabled',
        fields: [
            { key: 'paypal_client_id', label: 'Client ID', type: 'text', placeholder: 'Enter your PayPal Client ID' },
            { key: 'paypal_client_secret', label: 'Client Secret', type: 'password', placeholder: 'Enter your PayPal Client Secret' },
        ],
    },
];

export default function Payments() {
    const [settings, setSettings] = useState({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [activeGateway, setActiveGateway] = useState('razorpay');

    useEffect(() => {
        api.get('/settings')
            .then(res => setSettings(res.data.data))
            .catch(() => setError('Failed to load payment settings'))
            .finally(() => setLoading(false));
    }, []);

    const handleToggle = (enableKey) => {
        const current = settings[enableKey];
        setSettings({ ...settings, [enableKey]: current === 'true' ? 'false' : 'true' });
    };

    const handleSave = async () => {
        setSaving(true);
        setError('');
        setSuccess('');
        try {
            // Only send payment-related keys
            const payload = {};
            for (const gw of GATEWAYS) {
                payload[gw.enableKey] = settings[gw.enableKey] || 'false';
                for (const f of gw.fields) {
                    payload[f.key] = settings[f.key] || '';
                }
            }
            await api.put('/settings', { settings: payload });
            setSuccess('Payment settings saved successfully');
        } catch {
            setError('Failed to save payment settings');
        } finally { setSaving(false); }
    };

    if (loading) return <Spinner />;

    const currentGw = GATEWAYS.find(g => g.id === activeGateway);
    const isEnabled = settings[currentGw.enableKey] === 'true';

    return (
        <div>
            <PageHeader title="Payment Methods" subtitle="Manage your payment gateways and API credentials" />
            <Alert message={error} type="danger" onClose={() => setError('')} />
            <Alert message={success} type="success" onClose={() => setSuccess('')} />

            <div className="row g-4">
                {/* ── Gateway Selector (Left) ─────────────────────────────── */}
                <div className="col-lg-4">
                    <div className="card border-0 shadow-sm">
                        <div className="card-header bg-white border-0 py-3">
                            <h6 className="fw-bold mb-0">
                                <i className="bi bi-wallet2 me-2 text-primary"></i>Available Gateways
                            </h6>
                        </div>
                        <div className="card-body p-2">
                            {GATEWAYS.map(gw => {
                                const gwEnabled = settings[gw.enableKey] === 'true';
                                const isActive = activeGateway === gw.id;
                                return (
                                    <button
                                        key={gw.id}
                                        onClick={() => setActiveGateway(gw.id)}
                                        className={`btn w-100 text-start d-flex align-items-center gap-3 p-3 mb-1 rounded-3 border-0 position-relative ${isActive ? 'bg-primary bg-opacity-10' : 'bg-white'}`}
                                        style={{ transition: 'all 0.2s ease' }}
                                    >
                                        <div
                                            className="d-flex align-items-center justify-content-center rounded-3 flex-shrink-0"
                                            style={{ width: 44, height: 44, background: gw.color + '15', color: gw.color }}
                                        >
                                            <i className={`bi ${gw.icon} fs-5`}></i>
                                        </div>
                                        <div className="flex-grow-1">
                                            <div className="fw-semibold">{gw.name}</div>
                                            <div className="text-muted" style={{ fontSize: '0.75rem' }}>{gw.description.slice(0, 45)}…</div>
                                        </div>
                                        <span
                                            className={`badge rounded-pill ${gwEnabled ? 'bg-success' : 'bg-secondary bg-opacity-25 text-muted'}`}
                                            style={{ fontSize: '0.65rem' }}
                                        >
                                            {gwEnabled ? 'Active' : 'Off'}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* ── Gateway Config (Right) ──────────────────────────────── */}
                <div className="col-lg-8">
                    <div className="card border-0 shadow-sm">
                        <div className="card-header bg-white border-0 py-3 d-flex align-items-center justify-content-between">
                            <div className="d-flex align-items-center gap-2">
                                <div
                                    className="d-flex align-items-center justify-content-center rounded-3"
                                    style={{ width: 36, height: 36, background: currentGw.color + '15', color: currentGw.color }}
                                >
                                    <i className={`bi ${currentGw.icon} fs-5`}></i>
                                </div>
                                <div>
                                    <h6 className="fw-bold mb-0">{currentGw.name} Configuration</h6>
                                    <small className="text-muted">{currentGw.description}</small>
                                </div>
                            </div>
                            {/* Toggle Switch */}
                            <div className="form-check form-switch">
                                <input
                                    className="form-check-input"
                                    type="checkbox"
                                    role="switch"
                                    id={`toggle-${currentGw.id}`}
                                    checked={isEnabled}
                                    onChange={() => handleToggle(currentGw.enableKey)}
                                    style={{ width: '2.5em', height: '1.3em', cursor: 'pointer' }}
                                />
                                <label className="form-check-label small fw-semibold ms-1" htmlFor={`toggle-${currentGw.id}`}>
                                    {isEnabled ? 'Enabled' : 'Disabled'}
                                </label>
                            </div>
                        </div>

                        <div className="card-body">
                            {!isEnabled && (
                                <div className="alert alert-light border text-center py-4 mb-4">
                                    <i className="bi bi-toggle-off fs-2 text-muted d-block mb-2"></i>
                                    <p className="mb-1 fw-semibold">This gateway is currently disabled</p>
                                    <small className="text-muted">Toggle the switch above to enable it and configure API keys.</small>
                                </div>
                            )}

                            <div style={{ opacity: isEnabled ? 1 : 0.4, pointerEvents: isEnabled ? 'auto' : 'none' }}>
                                <div className="row g-3">
                                    {currentGw.fields.map(f => (
                                        <div key={f.key} className="col-12">
                                            <label className="form-label small fw-semibold">{f.label}</label>
                                            <div className="input-group">
                                                <span className="input-group-text bg-light border-end-0">
                                                    <i className="bi bi-key text-muted"></i>
                                                </span>
                                                <input
                                                    type={f.type}
                                                    className="form-control border-start-0"
                                                    value={settings[f.key] || ''}
                                                    onChange={e => setSettings({ ...settings, [f.key]: e.target.value })}
                                                    placeholder={f.placeholder}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {currentGw.id === 'razorpay' && (
                                    <div className="alert alert-info border-0 bg-primary bg-opacity-10 mt-3 small">
                                        <i className="bi bi-info-circle me-1"></i>
                                        Auto-capture is enabled. Payments are captured instantly without manual intervention from your Razorpay dashboard.
                                    </div>
                                )}
                                {currentGw.id === 'stripe' && (
                                    <div className="alert alert-warning border-0 bg-warning bg-opacity-10 mt-3 small">
                                        <i className="bi bi-exclamation-triangle me-1"></i>
                                        Stripe integration is coming soon. You can save your keys now for future use.
                                    </div>
                                )}
                                {currentGw.id === 'paypal' && (
                                    <div className="alert alert-warning border-0 bg-warning bg-opacity-10 mt-3 small">
                                        <i className="bi bi-exclamation-triangle me-1"></i>
                                        PayPal integration is coming soon. You can save your keys now for future use.
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="card-footer bg-white border-0 d-flex justify-content-end gap-2 py-3">
                            <button
                                className="btn btn-primary px-4"
                                onClick={handleSave}
                                disabled={saving}
                            >
                                {saving ? <span className="spinner-border spinner-border-sm me-2" /> : null}
                                <i className="bi bi-floppy me-1"></i> Save All Settings
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
