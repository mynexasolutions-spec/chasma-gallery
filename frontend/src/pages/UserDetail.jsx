import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { Spinner, StatusBadge, PageHeader, Alert } from '../components/ui';

const ROLE  = { admin: { color: 'danger', label: 'Admin' }, manager: { color: 'primary', label: 'Manager' }, customer: { color: 'secondary', label: 'Customer' } };
const STATUS_MAP = { active: { color: 'success', label: 'Active' }, blocked: { color: 'danger', label: 'Blocked' } };
const ORDER_STATUS = {
  pending: { color: 'warning', label: 'Pending' }, processing: { color: 'info', label: 'Processing' },
  shipped: { color: 'primary', label: 'Shipped' }, delivered: { color: 'success', label: 'Delivered' },
  cancelled: { color: 'danger', label: 'Cancelled' }, refunded: { color: 'secondary', label: 'Refunded' },
};

export default function UserDetail() {
  const { id } = useParams();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');
  const [success, setSuccess]   = useState('');

  useEffect(() => {
    api.get(`/users/${id}`)
      .then(res => setUserData(res.data.data))
      .catch(() => setError('Failed to load user'))
      .finally(() => setLoading(false));
  }, [id]);

  const toggleStatus = async () => {
    const newStatus = userData.status === 'active' ? 'blocked' : 'active';
    try {
      await api.patch(`/users/${id}/status`, { status: newStatus });
      setUserData(prev => ({ ...prev, status: newStatus }));
      setSuccess(`User ${newStatus === 'blocked' ? 'blocked' : 'unblocked'}`);
    } catch { setError('Failed to update status'); }
  };

  if (loading) return <Spinner />;
  if (!userData) return (
    <div className="text-center py-5">
      <h5>User not found</h5>
      <Link to="/admin/users" className="btn btn-primary mt-2">Back to Users</Link>
    </div>
  );

  const u = userData;

  return (
    <div>
      <PageHeader
        title={`${u.first_name} ${u.last_name}`}
        subtitle={`Member since ${new Date(u.created_at).toLocaleDateString()}`}
        action={<Link to="/admin/users" className="btn btn-outline-secondary btn-sm"><i className="bi bi-arrow-left me-1"></i>Back</Link>}
      />

      <Alert type="danger" message={error} onClose={() => setError('')} />
      <Alert type="success" message={success} onClose={() => setSuccess('')} />

      {/* User Info Row */}
      <div className="row g-3 mb-4">
        <div className="col-md-4">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body text-center">
              <div className="bg-primary bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center fw-bold text-primary fs-3 mb-3"
                   style={{ width: 72, height: 72 }}>
                {u.first_name[0]}{u.last_name[0]}
              </div>
              <h5 className="fw-bold mb-1">{u.first_name} {u.last_name}</h5>
              <div className="text-muted small mb-2">{u.email}</div>
              <div className="d-flex justify-content-center gap-2 mb-3">
                <StatusBadge value={u.role} map={ROLE} />
                <StatusBadge value={u.status} map={STATUS_MAP} />
              </div>
              <button
                className={`btn btn-sm ${u.status === 'active' ? 'btn-outline-warning' : 'btn-outline-success'}`}
                onClick={toggleStatus}
              >
                {u.status === 'active' ? 'Block User' : 'Unblock User'}
              </button>
            </div>
          </div>
        </div>

        <div className="col-md-8">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-header bg-white fw-semibold">
              <i className="bi bi-geo-alt me-2"></i>Addresses
            </div>
            <div className="card-body">
              {u.addresses && u.addresses.length > 0 ? (
                <div className="row g-3">
                  {u.addresses.map(addr => (
                    <div key={addr.id} className="col-md-6">
                      <div className="border rounded p-3">
                        <div className="d-flex justify-content-between mb-2">
                          <span className="badge bg-light text-dark">{addr.type || 'Address'}</span>
                        </div>
                        <div className="small">
                          {addr.address_line1 && <div>{addr.address_line1}</div>}
                          {addr.address_line2 && <div>{addr.address_line2}</div>}
                          <div>
                            {[addr.city, addr.state, addr.postal_code].filter(Boolean).join(', ')}
                          </div>
                          {addr.country && <div className="text-muted">{addr.country}</div>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-muted py-4">
                  <i className="bi bi-geo fs-3 d-block mb-2"></i>
                  No addresses on file
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="card border-0 shadow-sm">
        <div className="card-header bg-white d-flex justify-content-between align-items-center">
          <span className="fw-semibold"><i className="bi bi-receipt me-2"></i>Recent Orders</span>
          <span className="text-muted small">{u.recent_orders?.length || 0} orders</span>
        </div>
        <div className="card-body p-0">
          {u.recent_orders && u.recent_orders.length > 0 ? (
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead className="table-light">
                  <tr>
                    <th className="border-0 small">Order</th>
                    <th className="border-0 small">Status</th>
                    <th className="border-0 small">Total</th>
                    <th className="border-0 small">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {u.recent_orders.map(o => (
                    <tr key={o.id}>
                      <td>
                        <Link to={`/orders/${o.id}`} className="fw-semibold text-decoration-none small">
                          #{o.order_number}
                        </Link>
                      </td>
                      <td><StatusBadge value={o.status} map={ORDER_STATUS} /></td>
                      <td className="small fw-semibold">${Number(o.total_amount).toFixed(2)}</td>
                      <td className="small text-muted">{new Date(o.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center text-muted py-4">No orders yet</div>
          )}
        </div>
      </div>
    </div>
  );
}
