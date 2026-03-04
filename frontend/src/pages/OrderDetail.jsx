import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { Spinner, StatusBadge, PageHeader, Alert } from '../components/ui';

const ORDER_STATUS_MAP = {
  pending:    { color: 'warning',   label: 'Pending' },
  processing: { color: 'info',      label: 'Processing' },
  shipped:    { color: 'primary',   label: 'Shipped' },
  delivered:  { color: 'success',   label: 'Delivered' },
  cancelled:  { color: 'danger',    label: 'Cancelled' },
  refunded:   { color: 'secondary', label: 'Refunded' },
};

const PAYMENT_MAP = {
  paid:     { color: 'success',   label: 'Paid' },
  unpaid:   { color: 'warning',   label: 'Unpaid' },
  refunded: { color: 'secondary', label: 'Refunded' },
};

const PAYMENT_TXN_STATUS = {
  succeeded: { color: 'success', label: 'Succeeded' },
  pending:   { color: 'warning', label: 'Pending' },
  failed:    { color: 'danger',  label: 'Failed' },
  refunded:  { color: 'secondary', label: 'Refunded' },
};

export default function OrderDetail() {
  const { id } = useParams();
  const [order, setOrder]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus]   = useState('');
  const [paymentStatus, setPaymentStatus] = useState('');
  const [saving, setSaving]   = useState(false);
  const [error, setError]     = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    api.get(`/orders/${id}`)
      .then(res => {
        setOrder(res.data.data);
        setStatus(res.data.data.status);
        setPaymentStatus(res.data.data.payment_status);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  const handleStatusChange = async (newStatus) => {
    setSaving(true);
    try {
      await api.patch(`/orders/${id}/status`, { status: newStatus });
      setStatus(newStatus);
      setOrder(prev => ({ ...prev, status: newStatus }));
      setSuccess('Order status updated');
    } catch { setError('Failed to update status'); }
    setSaving(false);
  };

  const handlePaymentStatusChange = async (newPaymentStatus) => {
    setSaving(true);
    try {
      await api.patch(`/orders/${id}/payment-status`, { payment_status: newPaymentStatus });
      setPaymentStatus(newPaymentStatus);
      setOrder(prev => ({ ...prev, payment_status: newPaymentStatus }));
      setSuccess('Payment status updated');
    } catch { setError('Failed to update payment status'); }
    setSaving(false);
  };

  const renderAddress = (addr) => {
    if (!addr) return <span className="text-muted">Not provided</span>;
    if (typeof addr === 'string') {
      try { addr = JSON.parse(addr); } catch { return <span className="text-muted">{addr}</span>; }
    }
    return (
      <div className="small">
        {addr.name && <div className="fw-semibold">{addr.name}</div>}
        {addr.address_line1 && <div>{addr.address_line1}</div>}
        {addr.address_line2 && <div>{addr.address_line2}</div>}
        <div>{[addr.city, addr.state, addr.postal_code].filter(Boolean).join(', ')}</div>
        {addr.country && <div>{addr.country}</div>}
        {addr.phone && <div className="text-muted mt-1"><i className="bi bi-telephone me-1"></i>{addr.phone}</div>}
        {/* Fallback for simple JSON like {"city":"New York"} */}
        {!addr.address_line1 && !addr.name && Object.entries(addr).map(([k, v]) => (
          <div key={k}><span className="text-capitalize">{k}:</span> {v}</div>
        ))}
      </div>
    );
  };

  if (loading) return <Spinner />;
  if (!order) return (
    <div className="text-center py-5">
      <h5>Order not found</h5>
      <Link to="/admin/orders" className="btn btn-primary mt-2">Back to Orders</Link>
    </div>
  );

  return (
    <div>
      <PageHeader
        title={`Order ${order.order_number}`}
        subtitle={`Placed on ${new Date(order.created_at).toLocaleDateString()}`}
        action={<Link to="/admin/orders" className="btn btn-outline-secondary btn-sm"><i className="bi bi-arrow-left me-1"></i>Back</Link>}
      />

      <Alert type="danger" message={error} onClose={() => setError('')} />
      <Alert type="success" message={success} onClose={() => setSuccess('')} />

      {/* Status & Summary Row */}
      <div className="row g-3 mb-4">
        <div className="col-md-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body text-center">
              <div className="text-muted small mb-1">Order Status</div>
              <div className="mb-2"><StatusBadge value={status} map={ORDER_STATUS_MAP} /></div>
              <select
                className="form-select form-select-sm"
                value={status}
                onChange={e => handleStatusChange(e.target.value)}
                disabled={saving}
              >
                {Object.entries(ORDER_STATUS_MAP).map(([k, v]) => (
                  <option key={k} value={k}>{v.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body text-center">
              <div className="text-muted small mb-1">Payment Status</div>
              <div className="mb-2"><StatusBadge value={paymentStatus} map={PAYMENT_MAP} /></div>
              <select
                className="form-select form-select-sm"
                value={paymentStatus}
                onChange={e => handlePaymentStatusChange(e.target.value)}
                disabled={saving}
              >
                {Object.entries(PAYMENT_MAP).map(([k, v]) => (
                  <option key={k} value={k}>{v.label}</option>
                ))}
              </select>
              {order.payment_method && (
                <div className="text-muted small mt-1">via {order.payment_method}</div>
              )}
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body text-center">
              <div className="text-muted small mb-1">Customer</div>
              <div className="fw-semibold">{order.first_name} {order.last_name}</div>
              <div className="text-muted small">{order.email}</div>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body text-center">
              <div className="text-muted small mb-1">Total</div>
              <div className="fs-4 fw-bold text-primary">${Number(order.total_amount).toFixed(2)}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Items Table */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-header bg-white fw-semibold">
          <i className="bi bi-box-seam me-2"></i>Order Items ({(order.items || []).length})
        </div>
        <div className="table-responsive">
          <table className="table table-hover mb-0">
            <thead className="table-light">
              <tr>
                <th>Product</th>
                <th className="text-center">Qty</th>
                <th className="text-end">Unit Price</th>
                <th className="text-end">Total</th>
              </tr>
            </thead>
            <tbody>
              {(order.items || []).map(item => (
                <tr key={item.id}>
                  <td>{item.product_name}</td>
                  <td className="text-center">{item.quantity}</td>
                  <td className="text-end">${Number(item.unit_price).toFixed(2)}</td>
                  <td className="text-end fw-semibold">${Number(item.total_price).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Totals + Addresses */}
      <div className="row g-3 mb-4">
        <div className="col-md-4">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-header bg-white fw-semibold">
              <i className="bi bi-calculator me-2"></i>Order Totals
            </div>
            <div className="card-body">
              <div className="d-flex justify-content-between mb-2">
                <span className="text-muted">Subtotal</span>
                <span>${Number(order.subtotal).toFixed(2)}</span>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span className="text-muted">Tax</span>
                <span>${Number(order.tax_amount).toFixed(2)}</span>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span className="text-muted">Shipping</span>
                <span>${Number(order.shipping_amount).toFixed(2)}</span>
              </div>
              {Number(order.discount_amount) > 0 && (
                <div className="d-flex justify-content-between mb-2">
                  <span className="text-muted">Discount</span>
                  <span className="text-danger">-${Number(order.discount_amount).toFixed(2)}</span>
                </div>
              )}
              <hr />
              <div className="d-flex justify-content-between fw-bold">
                <span>Total</span>
                <span className="text-primary">${Number(order.total_amount).toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-header bg-white fw-semibold">
              <i className="bi bi-geo-alt me-2"></i>Billing Address
            </div>
            <div className="card-body">
              {renderAddress(order.billing_address)}
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-header bg-white fw-semibold">
              <i className="bi bi-truck me-2"></i>Shipping Address
            </div>
            <div className="card-body">
              {renderAddress(order.shipping_address)}
            </div>
          </div>
        </div>
      </div>

      {/* Payments */}
      {order.payments && order.payments.length > 0 && (
        <div className="card border-0 shadow-sm mb-4">
          <div className="card-header bg-white fw-semibold">
            <i className="bi bi-credit-card me-2"></i>Payment Transactions
          </div>
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead className="table-light">
                <tr>
                  <th>Transaction ID</th>
                  <th>Provider</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {order.payments.map(p => (
                  <tr key={p.id}>
                    <td className="font-monospace small">{p.transaction_id || '—'}</td>
                    <td><span className="badge bg-light text-dark">{p.provider}</span></td>
                    <td>${Number(p.amount).toFixed(2)} {p.currency}</td>
                    <td><StatusBadge value={p.status} map={PAYMENT_TXN_STATUS} /></td>
                    <td className="small text-muted">{p.paid_at ? new Date(p.paid_at).toLocaleString() : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
