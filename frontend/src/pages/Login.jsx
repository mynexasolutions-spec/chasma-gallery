import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [form, setForm]     = useState({ email: '', password: '' });
  const [error, setError]   = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate  = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate('/admin');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
      <div className="card shadow border-0" style={{ width: 400 }}>
        <div className="card-body p-5">
          <div className="text-center mb-4">
            <div className="bg-primary bg-opacity-10 rounded-3 d-inline-flex p-3 mb-3">
              <i className="bi bi-shop fs-2 text-primary"></i>
            </div>
            <h4 className="fw-bold mb-0">StoreAdmin</h4>
            <p className="text-muted small">Sign in to your dashboard</p>
          </div>

          {error && (
            <div className="alert alert-danger alert-sm py-2 small">{error}</div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label fw-semibold small">Email</label>
              <input
                type="email"
                className="form-control"
                placeholder="admin@store.com"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>
            <div className="mb-4">
              <label className="form-label fw-semibold small">Password</label>
              <input
                type="password"
                className="form-control"
                placeholder="••••••••"
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                required
              />
            </div>
            <button type="submit" className="btn btn-primary w-100" disabled={loading}>
              {loading ? <span className="spinner-border spinner-border-sm me-2" /> : null}
              Sign In
            </button>
          </form>

          <hr className="my-4" />
          <div className="bg-light rounded p-3 small text-muted">
            <div className="fw-semibold mb-1">Test credentials:</div>
            <div>Admin: <code>admin@store.com</code></div>
            <div>Manager: <code>manager@store.com</code></div>
            <div>Password: <code>Admin@1234</code></div>
          </div>
        </div>
      </div>
    </div>
  );
}
