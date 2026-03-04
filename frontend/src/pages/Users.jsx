import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { Spinner, StatusBadge, Pagination, PageHeader, Alert } from '../components/ui';
import { useAuth } from '../context/AuthContext';

const ROLE = {
  admin:    { color: 'danger',    label: 'Admin'    },
  manager:  { color: 'primary',   label: 'Manager'  },
  customer: { color: 'secondary', label: 'Customer' },
};
const USER_STATUS = {
  active:  { color: 'success', label: 'Active'  },
  blocked: { color: 'danger',  label: 'Blocked' },
};

const EMPTY = { first_name: '', last_name: '', email: '', password: '', role: 'customer' };

export default function Users() {
  const { user: currentUser } = useAuth();
  const isAdmin = currentUser?.role === 'admin';
  const [users, setUsers]         = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState('');
  const [roleFilter, setRole]     = useState('');
  const [page, setPage]           = useState(1);
  const [error, setError]         = useState('');
  const [success, setSuccess]     = useState('');

  // Modal
  const [modal, setModal]     = useState(null);
  const [form, setForm]       = useState(EMPTY);
  const [saving, setSaving]   = useState(false);

  const fetchUsers = useCallback(() => {
    setLoading(true);
    api.get('/users', { params: { page, limit: 15, search, role: roleFilter } })
      .then(res => { setUsers(res.data.data); setPagination(res.data.pagination); })
      .catch(() => setError('Failed to load users'))
      .finally(() => setLoading(false));
  }, [page, search, roleFilter]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const openCreate = () => { setForm(EMPTY); setModal('create'); };
  const openEdit = (u) => {
    setForm({ first_name: u.first_name, last_name: u.last_name, email: u.email, password: '', role: u.role, id: u.id });
    setModal('edit');
  };
  const closeModal = () => setModal(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      if (modal === 'create') {
        await api.post('/users', form);
        setSuccess('User created successfully');
      } else {
        await api.put(`/users/${form.id}`, form);
        setSuccess('User updated successfully');
      }
      closeModal();
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save user');
    }
    setSaving(false);
  };

  const toggleStatus = async (user) => {
    const newStatus = user.status === 'active' ? 'blocked' : 'active';
    if (!confirm(`${newStatus === 'blocked' ? 'Block' : 'Unblock'} ${user.first_name}?`)) return;
    try {
      await api.patch(`/users/${user.id}/status`, { status: newStatus });
      setSuccess(`User ${newStatus === 'blocked' ? 'blocked' : 'unblocked'}`);
      fetchUsers();
    } catch { setError('Failed to update user status'); }
  };

  const handleDelete = async (u) => {
    if (!confirm(`Delete "${u.first_name} ${u.last_name}"? This cannot be undone.`)) return;
    try {
      await api.delete(`/users/${u.id}`);
      setSuccess('User deleted');
      fetchUsers();
    } catch (err) { setError(err.response?.data?.message || 'Failed to delete user'); }
  };

  return (
    <div>
      <PageHeader
        title="Users"
        subtitle="Manage customers and staff accounts"
        action={isAdmin && (
          <button className="btn btn-primary" onClick={openCreate}>
            <i className="bi bi-plus-lg me-1"></i> Add User
          </button>
        )}
      />
      <Alert message={error}   type="danger"  onClose={() => setError('')} />
      <Alert message={success} type="success" onClose={() => setSuccess('')} />

      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body py-2">
          <div className="row g-2">
            <div className="col-md-5">
              <input className="form-control form-control-sm" placeholder="Search name or email..."
                value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
            </div>
            <div className="col-md-3">
              <select className="form-select form-select-sm" value={roleFilter}
                onChange={e => { setRole(e.target.value); setPage(1); }}>
                <option value="">All Roles</option>
                <option value="admin">Admin</option>
                <option value="manager">Manager</option>
                <option value="customer">Customer</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="card border-0 shadow-sm">
        <div className="card-body p-0">
          {loading ? <Spinner /> : (
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead className="table-light">
                  <tr>
                    <th className="border-0 small">User</th>
                    <th className="border-0 small">Email</th>
                    <th className="border-0 small">Role</th>
                    <th className="border-0 small">Status</th>
                    <th className="border-0 small">Joined</th>
                    <th className="border-0 small">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u.id}>
                      <td>
                        <div className="d-flex align-items-center gap-2">
                          <div className="bg-primary bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center fw-bold text-primary small"
                               style={{ width: 32, height: 32 }}>
                            {u.first_name[0]}{u.last_name[0]}
                          </div>
                          <Link to={`/admin/users/${u.id}`} className="small fw-semibold text-decoration-none">{u.first_name} {u.last_name}</Link>
                        </div>
                      </td>
                      <td className="small text-muted">{u.email}</td>
                      <td><StatusBadge value={u.role} map={ROLE} /></td>
                      <td><StatusBadge value={u.status} map={USER_STATUS} /></td>
                      <td className="small text-muted">{new Date(u.created_at).toLocaleDateString()}</td>
                      <td>
                        <div className="d-flex gap-1">
                          {isAdmin && (
                            <button className="btn btn-sm btn-outline-primary" onClick={() => openEdit(u)} title="Edit">
                              <i className="bi bi-pencil"></i>
                            </button>
                          )}
                          <button
                            className={`btn btn-sm ${u.status === 'active' ? 'btn-outline-warning' : 'btn-outline-success'}`}
                            onClick={() => toggleStatus(u)}
                          >
                            {u.status === 'active' ? 'Block' : 'Unblock'}
                          </button>
                          {isAdmin && u.id !== currentUser.id && (
                            <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(u)} title="Delete">
                              <i className="bi bi-trash"></i>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {users.length === 0 && (
                    <tr><td colSpan="6" className="text-center text-muted py-5">No users found</td></tr>
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

      {/* Create/Edit Modal */}
      {modal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <form onSubmit={handleSubmit}>
                <div className="modal-header">
                  <h5 className="modal-title">{modal === 'create' ? 'Add User' : 'Edit User'}</h5>
                  <button type="button" className="btn-close" onClick={closeModal}></button>
                </div>
                <div className="modal-body">
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold">First Name *</label>
                      <input className="form-control" required value={form.first_name}
                        onChange={e => setForm({ ...form, first_name: e.target.value })} />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold">Last Name *</label>
                      <input className="form-control" required value={form.last_name}
                        onChange={e => setForm({ ...form, last_name: e.target.value })} />
                    </div>
                    <div className="col-12">
                      <label className="form-label small fw-semibold">Email *</label>
                      <input type="email" className="form-control" required value={form.email}
                        onChange={e => setForm({ ...form, email: e.target.value })} />
                    </div>
                    {modal === 'create' && (
                      <div className="col-12">
                        <label className="form-label small fw-semibold">Password *</label>
                        <input type="password" className="form-control" required value={form.password}
                          onChange={e => setForm({ ...form, password: e.target.value })} />
                      </div>
                    )}
                    <div className="col-12">
                      <label className="form-label small fw-semibold">Role</label>
                      <select className="form-select" value={form.role}
                        onChange={e => setForm({ ...form, role: e.target.value })}>
                        <option value="customer">Customer</option>
                        <option value="manager">Manager</option>
                        <option value="admin">Admin</option>
                      </select>
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={closeModal}>Cancel</button>
                  <button type="submit" className="btn btn-primary" disabled={saving}>
                    {saving ? <span className="spinner-border spinner-border-sm me-1"></span> : null}
                    {modal === 'create' ? 'Create User' : 'Save Changes'}
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
