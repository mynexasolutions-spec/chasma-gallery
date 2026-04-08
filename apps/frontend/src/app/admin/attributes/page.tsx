'use client';

import { useState, useEffect, useCallback } from 'react';
import api from '@/lib/api';
import { Plus, Pencil, Trash2, ChevronRight, X, Layers } from 'lucide-react';

interface Attribute { id: string; name: string; slug: string; value_count: number; }
interface AttributeValue { id: string; value: string; }

const generateSlug = (name: string) => name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

export default function AttributesPage() {
  const [attributes, setAttributes] = useState<Attribute[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Attribute modal
  const [attrModal, setAttrModal] = useState<'create' | 'edit' | null>(null);
  const [editingAttrId, setEditingAttrId] = useState<string | null>(null);
  const [attrForm, setAttrForm] = useState({ name: '', slug: '' });
  const [saving, setSaving] = useState(false);

  // Values panel
  const [selectedAttr, setSelectedAttr] = useState<Attribute | null>(null);
  const [values, setValues] = useState<AttributeValue[]>([]);
  const [valuesLoading, setValuesLoading] = useState(false);
  const [newValue, setNewValue] = useState('');
  const [editingValueId, setEditingValueId] = useState<string | null>(null);
  const [editValueText, setEditValueText] = useState('');

  const fetchAttributes = useCallback(() => {
    setLoading(true);
    api.get('/attributes')
      .then(r => setAttributes(r.data.data))
      .catch(() => setError('Failed to load attributes'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchAttributes(); }, [fetchAttributes]);
  useEffect(() => { if (success) { const t = setTimeout(() => setSuccess(''), 3000); return () => clearTimeout(t); } }, [success]);

  const fetchValues = (attr: Attribute) => {
    setSelectedAttr(attr);
    setValuesLoading(true);
    api.get(`/attributes/${attr.id}/values`)
      .then(r => setValues(r.data.data))
      .catch(() => setError('Failed to load values'))
      .finally(() => setValuesLoading(false));
  };

  // Attribute CRUD
  const openCreateAttr = () => { setAttrModal('create'); setEditingAttrId(null); setAttrForm({ name: '', slug: '' }); };
  const openEditAttr = (a: Attribute) => { setAttrModal('edit'); setEditingAttrId(a.id); setAttrForm({ name: a.name, slug: a.slug }); };

  const handleAttrSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true); setError('');
    try {
      if (attrModal === 'edit' && editingAttrId) {
        await api.put(`/attributes/${editingAttrId}`, attrForm);
        setSuccess('Attribute updated');
      } else {
        await api.post('/attributes', attrForm);
        setSuccess('Attribute created');
      }
      setAttrModal(null); fetchAttributes();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save');
    }
    setSaving(false);
  };

  const handleDeleteAttr = async (id: string) => {
    if (!confirm('Delete this attribute?')) return;
    try {
      await api.delete(`/attributes/${id}`);
      setSuccess('Attribute deleted');
      if (selectedAttr?.id === id) { setSelectedAttr(null); setValues([]); }
      fetchAttributes();
    } catch (err: any) { setError(err.response?.data?.message || 'Failed to delete'); }
  };

  // Value CRUD
  const handleAddValue = async () => {
    if (!newValue.trim() || !selectedAttr) return;
    try {
      await api.post(`/attributes/${selectedAttr.id}/values`, { value: newValue.trim() });
      setNewValue(''); fetchValues(selectedAttr); fetchAttributes();
      setSuccess('Value added');
    } catch (err: any) { setError(err.response?.data?.message || 'Failed to add value'); }
  };

  const handleUpdateValue = async (valueId: string) => {
    if (!editValueText.trim() || !selectedAttr) return;
    try {
      await api.put(`/attributes/${selectedAttr.id}/values/${valueId}`, { value: editValueText.trim() });
      setEditingValueId(null); fetchValues(selectedAttr);
      setSuccess('Value updated');
    } catch (err: any) { setError(err.response?.data?.message || 'Failed to update'); }
  };

  const handleDeleteValue = async (valueId: string) => {
    if (!selectedAttr) return;
    try {
      await api.delete(`/attributes/${selectedAttr.id}/values/${valueId}`);
      fetchValues(selectedAttr); fetchAttributes();
      setSuccess('Value deleted');
    } catch (err: any) { setError(err.response?.data?.message || 'Failed to delete'); }
  };

  const inputClass = "w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Attributes</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Manage product attributes like Color, Size, etc.</p>
        </div>
        <button onClick={openCreateAttr} className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition-colors">
          <Plus className="h-4 w-4" /> Add Attribute
        </button>
      </div>

      {error && <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-300">{error}</div>}
      {success && <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800 dark:border-green-900/50 dark:bg-green-900/20 dark:text-green-300">{success}</div>}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Attributes List */}
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-950">
          <div className="border-b border-gray-100 px-6 py-4 dark:border-gray-800">
            <h2 className="text-base font-semibold text-gray-900 dark:text-white">Attributes</h2>
          </div>
          {loading ? (
            <div className="flex h-40 items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" /></div>
          ) : attributes.length === 0 ? (
            <p className="p-6 text-center text-sm text-gray-500">No attributes yet</p>
          ) : (
            <div className="divide-y divide-gray-50 dark:divide-gray-800">
              {attributes.map(a => (
                <div key={a.id}
                  className={`flex items-center justify-between px-6 py-3 cursor-pointer transition-colors ${selectedAttr?.id === a.id ? 'bg-indigo-50 dark:bg-indigo-500/10' : 'hover:bg-gray-50 dark:hover:bg-gray-900/50'}`}
                  onClick={() => fetchValues(a)}>
                  <div className="flex items-center gap-3">
                    <Layers className={`h-4 w-4 ${selectedAttr?.id === a.id ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-400'}`} />
                    <div>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">{a.name}</p>
                      <p className="text-xs text-gray-500">{a.value_count} values</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={e => { e.stopPropagation(); openEditAttr(a); }} className="rounded p-1 text-gray-400 hover:text-indigo-600"><Pencil className="h-3.5 w-3.5" /></button>
                    <button onClick={e => { e.stopPropagation(); handleDeleteAttr(a.id); }} className="rounded p-1 text-gray-400 hover:text-red-600"><Trash2 className="h-3.5 w-3.5" /></button>
                    <ChevronRight className="h-4 w-4 text-gray-300" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Values Panel */}
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-950">
          <div className="border-b border-gray-100 px-6 py-4 dark:border-gray-800">
            <h2 className="text-base font-semibold text-gray-900 dark:text-white">
              {selectedAttr ? `${selectedAttr.name} Values` : 'Select an Attribute'}
            </h2>
          </div>
          {!selectedAttr ? (
            <p className="p-6 text-center text-sm text-gray-500">Click an attribute to manage its values</p>
          ) : valuesLoading ? (
            <div className="flex h-40 items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" /></div>
          ) : (
            <div className="p-6 space-y-3">
              {/* Add value */}
              <div className="flex gap-2">
                <input value={newValue} onChange={e => setNewValue(e.target.value)} placeholder="Add new value..."
                  onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAddValue())}
                  className={inputClass} />
                <button onClick={handleAddValue} className="shrink-0 rounded-md bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-700">
                  <Plus className="h-4 w-4" />
                </button>
              </div>

              {/* Value list */}
              {values.length === 0 ? (
                <p className="text-center text-sm text-gray-500 py-4">No values yet</p>
              ) : (
                <div className="space-y-1">
                  {values.map(v => (
                    <div key={v.id} className="flex items-center justify-between rounded-md bg-gray-50 px-3 py-2 dark:bg-gray-800">
                      {editingValueId === v.id ? (
                        <input value={editValueText} onChange={e => setEditValueText(e.target.value)}
                          onKeyDown={e => e.key === 'Enter' && handleUpdateValue(v.id)}
                          onBlur={() => handleUpdateValue(v.id)} autoFocus
                          className="flex-1 rounded border border-indigo-300 bg-white px-2 py-1 text-sm dark:bg-gray-800 dark:border-gray-600 dark:text-white" />
                      ) : (
                        <span className="text-sm text-gray-900 dark:text-white">{v.value}</span>
                      )}
                      <div className="flex gap-1 ml-2">
                        <button onClick={() => { setEditingValueId(v.id); setEditValueText(v.value); }} className="rounded p-1 text-gray-400 hover:text-indigo-600"><Pencil className="h-3 w-3" /></button>
                        <button onClick={() => handleDeleteValue(v.id)} className="rounded p-1 text-gray-400 hover:text-red-600"><Trash2 className="h-3 w-3" /></button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Attribute Create/Edit Modal */}
      {attrModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setAttrModal(null)}>
          <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-xl dark:bg-gray-900" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">{attrModal === 'edit' ? 'Edit Attribute' : 'New Attribute'}</h2>
              <button onClick={() => setAttrModal(null)} className="rounded p-1 text-gray-400 hover:text-gray-600"><X className="h-5 w-5" /></button>
            </div>
            <form onSubmit={handleAttrSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name *</label>
                <input required value={attrForm.name}
                  onChange={e => setAttrForm({ name: e.target.value, slug: attrModal === 'create' ? generateSlug(e.target.value) : attrForm.slug })}
                  className={inputClass} placeholder="e.g. Color" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Slug *</label>
                <input required value={attrForm.slug} onChange={e => setAttrForm({ ...attrForm, slug: e.target.value })} className={inputClass} />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setAttrModal(null)} className="rounded-md px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800">Cancel</button>
                <button type="submit" disabled={saving} className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:bg-indigo-400">
                  {saving ? 'Saving...' : attrModal === 'edit' ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
