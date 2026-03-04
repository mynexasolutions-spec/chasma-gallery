import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { Spinner, StatusBadge, Pagination, PageHeader, Alert } from '../components/ui';

const ORDER_STATUS = {
  pending:    { color: 'warning',   label: 'Pending'    },
  processing: { color: 'info',      label: 'Processing' },
  shipped:    { color: 'primary',   label: 'Shipped'    },
  delivered:  { color: 'success',   label: 'Delivered'  },
  cancelled:  { color: 'danger',    label: 'Cancelled'  },
  refunded:   { color: 'secondary', label: 'Refunded'   },
};
const PAYMENT_STATUS = {
  paid:     { color: 'success',   label: 'Paid'     },
  unpaid:   { color: 'warning',   label: 'Unpaid'   },
  refunded: { color: 'secondary', label: 'Refunded' },
};

export default function Orders() {
  const [orders, setOrders]       = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState('');
  const [statusFilter, setStatus] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('');
  const [page, setPage]           = useState(1);
  const [error, setError]         = useState('');
  const [success, setSuccess]     = useState('');
  const [updatingId, setUpdatingId] = useState(null);

  const fetchOrders = useCallback(() => {
    setLoading(true);
    const params = { page, limit: 15, search, status: statusFilter };
    if (paymentFilter) params.payment_status = paymentFilter;
    api.get('/orders', { params })
      .then(res => { setOrders(res.data.data); setPagination(res.data.pagination); })
      .catch(() => setError('Failed to load orders'))
      .finally(() => setLoading(false));
  }, [page, search, statusFilter, paymentFilter]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const updateStatus = async (id, status) => {
    setUpdatingId(id);
    try {
      await api.patch(`/orders/${id}/status`, { status });
      setSuccess('Order status updated');
      fetchOrders();
    } catch {
      setError('Failed to update status');
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div>
      <PageHeader title="Orders" subtitle="View and manage customer orders" />
      <Alert message={error}   type="danger"  onClose={() => setError('')} />
      <Alert message={success} type="success" onClose={() => setSuccess('')} />

      {/* Filters */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body py-2">
          <div className="row g-2">
            <div className="col-md-4">
              <input className="form-control form-control-sm" placeholder="Search order # or email..."
                value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
            </div>
            <div className="col-md-3">
              <select className="form-select form-select-sm" value={statusFilter}
                onChange={e => { setStatus(e.target.value); setPage(1); }}>
                <option value="">All Statuses</option>
                {Object.entries(ORDER_STATUS).map(([k, v]) => (
                  <option key={k} value={k}>{v.label}</option>
                ))}
              </select>
            </div>
            <div className="col-md-3">
              <select className="form-select form-select-sm" value={paymentFilter}
                onChange={e => { setPaymentFilter(e.target.value); setPage(1); }}>
                <option value="">All Payments</option>
                {Object.entries(PAYMENT_STATUS).map(([k, v]) => (
                  <option key={k} value={k}>{v.label}</option>
                ))}
              </select>
            </div>
            {pagination && (
              <div className="col-md-2 text-end">
                <span className="text-muted small">{pagination.total} orders</span>
              </div>
            )}
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
                    <th className="border-0 small">Order</th>
                    <th className="border-0 small">Customer</th>
                    <th className="border-0 small">Total</th>
                    <th className="border-0 small">Payment</th>
                    <th className="border-0 small">Status</th>
                    <th className="border-0 small">Date</th>
                    <th className="border-0 small">Update Status</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map(o => (
                    <tr key={o.id}>
                      <td>
                        <Link to={`/admin/orders/${o.id}`} className="fw-semibold text-decoration-none small">
                          #{o.order_number}
                        </Link>
                      </td>
                      <td>
                        <div className="small">{o.first_name} {o.last_name}</div>
                        <div className="text-muted" style={{ fontSize: 11 }}>{o.email}</div>
                      </td>
                      <td className="small fw-semibold">${Number(o.total_amount).toFixed(2)}</td>
                      <td><StatusBadge value={o.payment_status} map={PAYMENT_STATUS} /></td>
                      <td><StatusBadge value={o.status} map={ORDER_STATUS} /></td>
                      <td className="small text-muted">{new Date(o.created_at).toLocaleDateString()}</td>
                      <td>
                        <select
                          className="form-select form-select-sm"
                          style={{ width: 130 }}
                          value={o.status}
                          disabled={updatingId === o.id}
                          onChange={e => updateStatus(o.id, e.target.value)}
                        >
                          {Object.entries(ORDER_STATUS).map(([k, v]) => (
                            <option key={k} value={k}>{v.label}</option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  ))}
                  {orders.length === 0 && (
                    <tr><td colSpan="7" className="text-center text-muted py-5">No orders found</td></tr>
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
    </div>
  );
}
