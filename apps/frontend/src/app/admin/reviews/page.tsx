'use client';

import { useState, useEffect, useCallback } from 'react';
import api from '@/lib/api';
import { Check, X, Trash2, Star, ChevronLeft, ChevronRight } from 'lucide-react';

interface Review {
  id: string; product_name: string; first_name: string; last_name: string;
  rating: number; comment: string; is_approved: boolean;
  created_at: string;
}

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, pages: 1 });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchReviews = useCallback(() => {
    setLoading(true);
    api.get('/reviews', { params: { page, limit: 20, is_approved: filter || undefined } })
      .then(r => { setReviews(r.data.data); setPagination(r.data.pagination); })
      .catch(() => setError('Failed to load reviews'))
      .finally(() => setLoading(false));
  }, [page, filter]);

  useEffect(() => { fetchReviews(); }, [fetchReviews]);
  useEffect(() => { if (success) { const t = setTimeout(() => setSuccess(''), 3000); return () => clearTimeout(t); } }, [success]);

  const handleApprove = async (id: string) => {
    try { await api.patch(`/reviews/${id}/approve`); setSuccess('Review approved'); fetchReviews(); }
    catch { setError('Failed to approve'); }
  };

  const handleReject = async (id: string) => {
    try { await api.patch(`/reviews/${id}/reject`); setSuccess('Review rejected'); fetchReviews(); }
    catch { setError('Failed to reject'); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this review?')) return;
    try { await api.delete(`/reviews/${id}`); setSuccess('Review deleted'); fetchReviews(); }
    catch { setError('Failed to delete'); }
  };

  const renderStars = (rating: number) => (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <Star key={i} className={`h-4 w-4 ${i <= rating ? 'fill-amber-400 text-amber-400' : 'text-gray-300 dark:text-gray-600'}`} />
      ))}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Reviews</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{pagination.total} total</p>
        </div>
        <select value={filter} onChange={e => { setFilter(e.target.value); setPage(1); }}
          className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white">
          <option value="">All Reviews</option>
          <option value="true">Approved</option>
          <option value="false">Pending</option>
        </select>
      </div>

      {error && <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-300">{error}</div>}
      {success && <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800 dark:border-green-900/50 dark:bg-green-900/20 dark:text-green-300">{success}</div>}

      <div className="space-y-3">
        {loading ? (
          <div className="flex h-64 items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" /></div>
        ) : reviews.length === 0 ? (
          <div className="rounded-xl border border-gray-200 bg-white p-12 text-center text-sm text-gray-500 dark:border-gray-800 dark:bg-gray-950">No reviews found</div>
        ) : reviews.map(r => (
          <div key={r.id} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-950">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  {renderStars(r.rating)}
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${r.is_approved ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400'}`}>
                    {r.is_approved ? 'Approved' : 'Pending'}
                  </span>
                </div>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">{r.product_name || 'Unknown Product'}</p>
                <p className="text-xs text-gray-500 mb-2">by {r.first_name} {r.last_name} • {new Date(r.created_at).toLocaleDateString()}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">{r.comment}</p>
              </div>
              <div className="flex gap-1 ml-4 shrink-0">
                {!r.is_approved && (
                  <button onClick={() => handleApprove(r.id)} title="Approve"
                    className="rounded p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors">
                    <Check className="h-4 w-4" />
                  </button>
                )}
                {r.is_approved && (
                  <button onClick={() => handleReject(r.id)} title="Reject"
                    className="rounded p-1.5 text-gray-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors">
                    <X className="h-4 w-4" />
                  </button>
                )}
                <button onClick={() => handleDelete(r.id)} title="Delete"
                  className="rounded p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {pagination.pages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-gray-500">Page {page} of {pagination.pages}</p>
          <div className="flex gap-2">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              className="rounded-md border border-gray-200 p-1.5 text-gray-400 hover:text-gray-600 disabled:opacity-50 dark:border-gray-700"><ChevronLeft className="h-4 w-4" /></button>
            <button onClick={() => setPage(p => Math.min(pagination.pages, p + 1))} disabled={page === pagination.pages}
              className="rounded-md border border-gray-200 p-1.5 text-gray-400 hover:text-gray-600 disabled:opacity-50 dark:border-gray-700"><ChevronRight className="h-4 w-4" /></button>
          </div>
        </div>
      )}
    </div>
  );
}
