import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { Spinner, Pagination, PageHeader, Alert } from '../components/ui';

const Stars = ({ rating }) => (
  <span>
    {[1,2,3,4,5].map(i => (
      <i key={i} className={`bi bi-star${i <= rating ? '-fill' : ''} text-warning`} style={{ fontSize: 12 }}></i>
    ))}
  </span>
);

export default function Reviews() {
  const [reviews, setReviews]     = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading]     = useState(true);
  const [filter, setFilter]       = useState('');
  const [search, setSearch]       = useState('');
  const [page, setPage]           = useState(1);
  const [error, setError]         = useState('');
  const [success, setSuccess]     = useState('');

  const fetchReviews = useCallback(() => {
    setLoading(true);
    const params = { page, limit: 15 };
    if (filter !== '') params.is_approved = filter;
    if (search) params.search = search;
    api.get('/reviews', { params })
      .then(res => { setReviews(res.data.data); setPagination(res.data.pagination); })
      .catch(() => setError('Failed to load reviews'))
      .finally(() => setLoading(false));
  }, [page, filter, search]);

  useEffect(() => { fetchReviews(); }, [fetchReviews]);

  const approve = async (id) => {
    try {
      await api.patch(`/reviews/${id}/approve`);
      setSuccess('Review approved');
      fetchReviews();
    } catch { setError('Failed to approve review'); }
  };

  const reject = async (id) => {
    try {
      await api.patch(`/reviews/${id}/reject`);
      setSuccess('Review rejected');
      fetchReviews();
    } catch { setError('Failed to reject review'); }
  };

  const remove = async (id) => {
    if (!confirm('Delete this review?')) return;
    try {
      await api.delete(`/reviews/${id}`);
      setSuccess('Review deleted');
      fetchReviews();
    } catch { setError('Failed to delete review'); }
  };

  return (
    <div>
      <PageHeader title="Reviews" subtitle="Moderate customer product reviews" />
      <Alert message={error}   type="danger"  onClose={() => setError('')} />
      <Alert message={success} type="success" onClose={() => setSuccess('')} />

      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body py-2">
          <div className="row g-2 align-items-center">
            <div className="col-md-5">
              <input className="form-control form-control-sm" placeholder="Search by product or customer..."
                value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
            </div>
            <div className="col-md-5">
              <div className="d-flex gap-2">
                {[['', 'All'], ['false', 'Pending'], ['true', 'Approved']].map(([val, label]) => (
                  <button key={val}
                    className={`btn btn-sm ${filter === val ? 'btn-primary' : 'btn-outline-secondary'}`}
                    onClick={() => { setFilter(val); setPage(1); }}>
                    {label}
                  </button>
                ))}
              </div>
            </div>
            {pagination && (
              <div className="col-md-2 text-end">
                <span className="text-muted small">{pagination.total} reviews</span>
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
                    <th className="border-0 small">Product</th>
                    <th className="border-0 small">Customer</th>
                    <th className="border-0 small">Rating</th>
                    <th className="border-0 small">Review</th>
                    <th className="border-0 small">Date</th>
                    <th className="border-0 small">Status</th>
                    <th className="border-0 small">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {reviews.map(r => (
                    <tr key={r.id}>
                      <td className="small fw-semibold">{r.product_name}</td>
                      <td className="small text-muted">{r.first_name} {r.last_name}</td>
                      <td><Stars rating={r.rating} /></td>
                      <td style={{ maxWidth: 250 }}>
                        <div className="small fw-semibold">{r.title}</div>
                        <div className="text-muted text-truncate" style={{ fontSize: 12, maxWidth: 220 }}>{r.comment}</div>
                      </td>
                      <td className="small text-muted">{new Date(r.created_at).toLocaleDateString()}</td>
                      <td>
                        <span className={`badge bg-${r.is_approved ? 'success' : 'warning'}`}>
                          {r.is_approved ? 'Approved' : 'Pending'}
                        </span>
                      </td>
                      <td>
                        {!r.is_approved && (
                          <button className="btn btn-sm btn-outline-success me-1" onClick={() => approve(r.id)} title="Approve">
                            <i className="bi bi-check-lg"></i>
                          </button>
                        )}
                        {r.is_approved && (
                          <button className="btn btn-sm btn-outline-warning me-1" onClick={() => reject(r.id)} title="Reject">
                            <i className="bi bi-x-lg"></i>
                          </button>
                        )}
                        <button className="btn btn-sm btn-outline-danger" onClick={() => remove(r.id)} title="Delete">
                          <i className="bi bi-trash"></i>
                        </button>
                      </td>
                    </tr>
                  ))}
                  {reviews.length === 0 && (
                    <tr><td colSpan="7" className="text-center text-muted py-5">No reviews found</td></tr>
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
