import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { Spinner, StatCard, StatusBadge, PageHeader } from '../components/ui';

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

const CHART_COLORS = ['#0d6efd', '#6610f2', '#6f42c1', '#d63384', '#dc3545', '#fd7e14', '#ffc107', '#198754', '#20c997', '#0dcaf0'];

export default function Dashboard() {
  const [data, setData]               = useState(null);
  const [loading, setLoading]         = useState(true);
  const [revenueData, setRevenueData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [topCustomers, setTopCustomers] = useState([]);
  const [chartDays, setChartDays]     = useState(30);

  useEffect(() => {
    api.get('/stats/overview')
      .then(res => setData(res.data.data))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    api.get('/stats/revenue-chart', { params: { days: chartDays } })
      .then(res => setRevenueData(res.data.data))
      .catch(() => {});
  }, [chartDays]);

  useEffect(() => {
    api.get('/stats/sales-by-category').then(res => setCategoryData(res.data.data)).catch(() => {});
    api.get('/stats/top-customers').then(res => setTopCustomers(res.data.data)).catch(() => {});
  }, []);

  if (loading) return <Spinner />;

  const { stats, recent_orders, top_products } = data;
  const fmt = (n) => `$${Number(n).toLocaleString('en-US', { minimumFractionDigits: 2 })}`;

  // Revenue chart calculations
  const maxRevenue = Math.max(...revenueData.map(d => d.revenue), 1);
  const maxCatRevenue = Math.max(...categoryData.map(d => d.revenue), 1);

  return (
    <div>
      <PageHeader title="Dashboard" subtitle="Welcome back! Here's what's happening." />

      {/* Stat cards */}
      <div className="row g-3 mb-4">
        <div className="col-sm-6 col-xl-3">
          <StatCard icon="bi-currency-dollar" label="Total Revenue" value={fmt(stats.total_revenue)} color="success" />
        </div>
        <div className="col-sm-6 col-xl-3">
          <StatCard icon="bi-receipt" label="Total Orders" value={stats.total_orders} color="primary" sub={`${stats.pending_orders} pending`} />
        </div>
        <div className="col-sm-6 col-xl-3">
          <StatCard icon="bi-people" label="Customers" value={stats.total_customers} color="info" />
        </div>
        <div className="col-sm-6 col-xl-3">
          <StatCard icon="bi-box-seam" label="Active Products" value={stats.active_products} color="warning" sub={`${stats.low_stock} low stock`} />
        </div>
      </div>

      {/* Revenue Chart */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-header bg-white border-0 py-3 d-flex justify-content-between align-items-center">
          <h6 className="fw-bold mb-0"><i className="bi bi-graph-up me-2 text-success"></i>Revenue Overview</h6>
          <div className="d-flex gap-1">
            {[7, 14, 30].map(d => (
              <button key={d} className={`btn btn-sm ${chartDays === d ? 'btn-primary' : 'btn-outline-secondary'}`}
                onClick={() => setChartDays(d)}>
                {d}d
              </button>
            ))}
          </div>
        </div>
        <div className="card-body">
          {revenueData.length === 0 ? (
            <div className="text-center text-muted py-4">No revenue data for this period</div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <div className="d-flex align-items-end gap-1" style={{ height: 200, minWidth: revenueData.length * 32 }}>
                {revenueData.map((d, i) => {
                  const h = Math.max((d.revenue / maxRevenue) * 180, 4);
                  return (
                    <div key={i} className="d-flex flex-column align-items-center flex-grow-1" style={{ minWidth: 28 }}>
                      <div className="text-muted text-center" style={{ fontSize: 9 }}>{fmt(d.revenue)}</div>
                      <div
                        className="bg-success bg-opacity-75 rounded-top w-100"
                        style={{ height: h, maxWidth: 32, transition: 'height 0.3s' }}
                        title={`${new Date(d.date).toLocaleDateString()}: ${fmt(d.revenue)} (${d.orders} orders)`}
                      ></div>
                      <div className="text-muted text-center" style={{ fontSize: 9 }}>
                        {new Date(d.date).toLocaleDateString('en', { month: 'short', day: 'numeric' })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="row g-4 mb-4">
        {/* Sales by Category */}
        <div className="col-xl-6">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-header bg-white border-0 py-3">
              <h6 className="fw-bold mb-0"><i className="bi bi-pie-chart me-2 text-primary"></i>Sales by Category</h6>
            </div>
            <div className="card-body">
              {categoryData.length === 0 ? (
                <div className="text-center text-muted py-4">No category data</div>
              ) : categoryData.map((c, i) => (
                <div key={i} className="mb-3">
                  <div className="d-flex justify-content-between small mb-1">
                    <span className="fw-semibold">{c.category}</span>
                    <span className="text-muted">{fmt(c.revenue)} ({c.order_count} orders)</span>
                  </div>
                  <div className="progress" style={{ height: 8 }}>
                    <div
                      className="progress-bar"
                      style={{
                        width: `${maxCatRevenue > 0 ? (c.revenue / maxCatRevenue) * 100 : 0}%`,
                        backgroundColor: CHART_COLORS[i % CHART_COLORS.length],
                      }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top Customers */}
        <div className="col-xl-6">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-header bg-white border-0 py-3">
              <h6 className="fw-bold mb-0"><i className="bi bi-person-hearts me-2 text-danger"></i>Top Customers</h6>
            </div>
            <div className="card-body p-0">
              {topCustomers.length === 0 ? (
                <div className="text-center text-muted py-4">No customer data</div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover mb-0">
                    <thead className="table-light">
                      <tr>
                        <th className="border-0 small">Customer</th>
                        <th className="border-0 small text-center">Orders</th>
                        <th className="border-0 small text-end">Spent</th>
                      </tr>
                    </thead>
                    <tbody>
                      {topCustomers.map(c => (
                        <tr key={c.id}>
                          <td>
                            <div className="d-flex align-items-center gap-2">
                              <div className="bg-danger bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center fw-bold text-danger small"
                                   style={{ width: 30, height: 30, fontSize: 11 }}>
                                {c.first_name[0]}{c.last_name[0]}
                              </div>
                              <div>
                                <div className="small fw-semibold">{c.first_name} {c.last_name}</div>
                                <div className="text-muted" style={{ fontSize: 11 }}>{c.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="text-center small">{c.order_count}</td>
                          <td className="text-end small fw-bold text-success">{fmt(c.total_spent)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="row g-4">
        {/* Recent Orders */}
        <div className="col-xl-7">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-white border-0 py-3 d-flex justify-content-between align-items-center">
              <h6 className="fw-bold mb-0">Recent Orders</h6>
              <Link to="/admin/orders" className="btn btn-sm btn-outline-primary">View All</Link>
            </div>
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-hover mb-0">
                  <thead className="table-light">
                    <tr>
                      <th className="border-0 small">Order</th>
                      <th className="border-0 small">Customer</th>
                      <th className="border-0 small">Amount</th>
                      <th className="border-0 small">Status</th>
                      <th className="border-0 small">Payment</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recent_orders.map(o => (
                      <tr key={o.id}>
                        <td>
                          <Link to={`/orders/${o.id}`} className="fw-semibold text-decoration-none small">
                            #{o.order_number}
                          </Link>
                        </td>
                        <td className="small text-muted">{o.first_name} {o.last_name}</td>
                        <td className="small fw-semibold">{fmt(o.total_amount)}</td>
                        <td><StatusBadge value={o.status} map={ORDER_STATUS} /></td>
                        <td><StatusBadge value={o.payment_status} map={PAYMENT_STATUS} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Top Products */}
        <div className="col-xl-5">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-white border-0 py-3 d-flex justify-content-between align-items-center">
              <h6 className="fw-bold mb-0">Top Products by Revenue</h6>
              <Link to="/admin/products" className="btn btn-sm btn-outline-primary">View All</Link>
            </div>
            <div className="card-body">
              {top_products.map((p, idx) => (
                <div key={p.id} className="d-flex align-items-center gap-3 mb-3">
                  <div className="bg-primary bg-opacity-10 rounded-2 d-flex align-items-center justify-content-center fw-bold text-primary small"
                       style={{ width: 32, height: 32 }}>
                    {idx + 1}
                  </div>
                  <div className="flex-grow-1 min-w-0">
                    <div className="small fw-semibold text-truncate">{p.name}</div>
                    <div className="text-muted" style={{ fontSize: 12 }}>{p.total_orders} orders</div>
                  </div>
                  <div className="text-success small fw-bold">{fmt(p.revenue)}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Alerts */}
      {(stats.pending_orders > 0 || stats.low_stock > 0) && (
        <div className="row g-3 mt-1">
          {stats.pending_orders > 0 && (
            <div className="col-md-6">
              <div className="alert alert-warning d-flex align-items-center gap-2 mb-0">
                <i className="bi bi-clock-history"></i>
                <span><strong>{stats.pending_orders}</strong> order(s) awaiting processing.</span>
                <Link to="/admin/orders?status=pending" className="ms-auto btn btn-sm btn-warning">Review</Link>
              </div>
            </div>
          )}
          {stats.low_stock > 0 && (
            <div className="col-md-6">
              <div className="alert alert-danger d-flex align-items-center gap-2 mb-0">
                <i className="bi bi-exclamation-triangle"></i>
                <span><strong>{stats.low_stock}</strong> product(s) low on stock.</span>
                <Link to="/admin/products" className="ms-auto btn btn-sm btn-danger">Review</Link>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
