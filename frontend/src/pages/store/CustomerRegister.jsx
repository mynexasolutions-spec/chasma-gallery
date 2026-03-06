import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';

export default function CustomerRegister() {
    const [formData, setFormData] = useState({ first_name: '', last_name: '', email: '', password: '', confirmPassword: '' });
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const { register } = useAuth();
    const navigate = useNavigate();

    const handleInputChange = (e) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        if (formData.password !== formData.confirmPassword) {
            return setError('Passwords do not match');
        }

        setLoading(true);
        setError(null);
        try {
            await register({
                first_name: formData.first_name,
                last_name: formData.last_name,
                email: formData.email,
                password: formData.password
            });
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container py-5 d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
            <div className="card shadow-sm border-0 p-4" style={{ width: '100%', maxWidth: '500px' }}>
                <h3 className="mb-4 text-center fw-bold">Sign Up</h3>
                {error && <div className="alert alert-danger">{error}</div>}
                <form onSubmit={handleRegister}>
                    <div className="row g-3 mb-3">
                        <div className="col-md-6">
                            <label className="form-label">First Name</label>
                            <input type="text" name="first_name" className="form-control" value={formData.first_name} onChange={handleInputChange} required />
                        </div>
                        <div className="col-md-6">
                            <label className="form-label">Last Name</label>
                            <input type="text" name="last_name" className="form-control" value={formData.last_name} onChange={handleInputChange} required />
                        </div>
                    </div>
                    <div className="mb-3">
                        <label className="form-label">Email address</label>
                        <input type="email" name="email" className="form-control" value={formData.email} onChange={handleInputChange} required />
                    </div>
                    <div className="mb-3">
                        <label className="form-label">Password</label>
                        <input type="password" name="password" className="form-control" value={formData.password} onChange={handleInputChange} required minLength="6" />
                    </div>
                    <div className="mb-4">
                        <label className="form-label">Confirm Password</label>
                        <input type="password" name="confirmPassword" className="form-control" value={formData.confirmPassword} onChange={handleInputChange} required />
                    </div>
                    <button type="submit" className="btn btn-dark w-100 py-2 fw-bold" disabled={loading}>
                        {loading ? 'Signing Up...' : 'Sign Up'}
                    </button>
                </form>
                <div className="mt-3 text-center">
                    <small className="text-muted">
                        Already have an account? <Link to="/login" className="text-primary text-decoration-none">Sign in</Link>
                    </small>
                </div>
            </div>
        </div>
    );
}
