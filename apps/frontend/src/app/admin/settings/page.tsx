'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Save, Loader2 } from 'lucide-react';

const SETTING_GROUPS = [
  {
    title: 'General',
    fields: [
      { key: 'store_name', label: 'Store Name', type: 'text' },
      { key: 'store_tagline', label: 'Tagline', type: 'text' },
      { key: 'currency', label: 'Currency Code', type: 'text', placeholder: 'USD' },
      { key: 'contact_email', label: 'Contact Email', type: 'email' },
      { key: 'contact_phone', label: 'Contact Phone', type: 'text' },
    ],
  },
  {
    title: 'Payment',
    fields: [
      { key: 'razorpay_key_id', label: 'Razorpay Key ID', type: 'text' },
      { key: 'razorpay_key_secret', label: 'Razorpay Key Secret', type: 'password' },
      { key: 'cod_enabled', label: 'Cash on Delivery', type: 'toggle' },
    ],
  },
  {
    title: 'Shipping',
    fields: [
      { key: 'free_shipping_threshold', label: 'Free Shipping Above (₹)', type: 'number' },
      { key: 'flat_shipping_rate', label: 'Flat Shipping Rate (₹)', type: 'number' },
    ],
  },
];

export default function SettingsPage() {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/settings')
      .then(r => setSettings(r.data.data || {}))
      .catch(() => setError('Failed to load settings'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { if (success) { const t = setTimeout(() => setSuccess(''), 3000); return () => clearTimeout(t); } }, [success]);

  const handleSave = async () => {
    setSaving(true); setError('');
    try {
      await api.put('/settings', { settings });
      setSuccess('Settings saved successfully');
    } catch { setError('Failed to save settings'); }
    setSaving(false);
  };

  const inputClass = "w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white";

  if (loading) return <div className="flex h-64 items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" /></div>;

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Settings</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Manage store configuration</p>
        </div>
        <button onClick={handleSave} disabled={saving}
          className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:bg-indigo-400 transition-colors">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      {error && <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-300">{error}</div>}
      {success && <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800 dark:border-green-900/50 dark:bg-green-900/20 dark:text-green-300">{success}</div>}

      {SETTING_GROUPS.map(group => (
        <div key={group.title} className="rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-950">
          <div className="border-b border-gray-100 px-6 py-4 dark:border-gray-800">
            <h2 className="text-base font-semibold text-gray-900 dark:text-white">{group.title}</h2>
          </div>
          <div className="p-6 space-y-4">
            {group.fields.map(field => (
              <div key={field.key} className="flex items-center gap-4">
                <label className="w-48 text-sm font-medium text-gray-700 dark:text-gray-300 shrink-0">{field.label}</label>
                {field.type === 'toggle' ? (
                  <button
                    onClick={() => setSettings({ ...settings, [field.key]: settings[field.key] === 'true' ? 'false' : 'true' })}
                    className={`relative inline-flex h-6 w-11 shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 ${
                      settings[field.key] === 'true' ? 'bg-indigo-600' : 'bg-gray-200 dark:bg-gray-700'
                    }`}>
                    <span className={`inline-block h-5 w-5 rounded-full bg-white shadow transform transition-transform duration-200 ${
                      settings[field.key] === 'true' ? 'translate-x-5' : 'translate-x-0'
                    }`} />
                  </button>
                ) : (
                  <input
                    type={field.type}
                    value={settings[field.key] || ''}
                    placeholder={field.placeholder || ''}
                    onChange={e => setSettings({ ...settings, [field.key]: e.target.value })}
                    className={inputClass}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
