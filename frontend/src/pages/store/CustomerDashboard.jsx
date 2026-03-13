import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';
import { Spinner } from '../../components/ui';

export default function CustomerDashboard() {
    const { user, logout, loading: authLoading } = useAuth();
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!authLoading) {
            if (!user) {
                navigate('/login');
            } else {
                fetchMyOrders();
            }
        }
    }, [user, navigate, authLoading]);

    const fetchMyOrders = async () => {
        try {
            const { data } = await api.get('/orders/my-orders');
            if (data.success) {
                setOrders(data.data);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        await logout();
        navigate('/');
    };

    if (authLoading || loading) return <Spinner />;

    return (
        <div className="store-theme" style={{ background: 'linear-gradient(135deg, #050505 0%, #1a1505 100%)', minHeight: '100vh', padding: '100px 0' }}>
            <div className="container">
                <div className="row g-5">
                    {/* Sidebar Profile */}
                    <div className="col-lg-3">
                        <div className="glass-panel p-4 shadow-lg sticky-top" style={{ top: '100px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(212,175,55,0.15)' }}>
                            <div className="text-center mb-4">
                                <div className="rounded-circle bg-gold d-inline-flex align-items-center justify-content-center mb-3" style={{ width: 80, height: 80 }}>
                                    <span className="fs-1 fw-bold text-dark">{user?.first_name?.charAt(0)}</span>
                                </div>
                                <h4 className="fw-bold text-white mb-1">Hello, {user?.first_name}</h4>
                                <p className="text-gold small mb-0" style={{ opacity: 0.7 }}>{user?.email}</p>
                            </div>

                            <hr className="border-secondary opacity-25" />

                            <div className="d-flex flex-column gap-3 mt-4">
                                <Link to="/dashboard" className="btn text-start fw-bold w-100 d-flex align-items-center gap-2" style={{ background: '#d4af37', color: '#000', borderRadius: '8px', padding: '10px 16px' }}>
                                    <i className="bi bi-grid-fill"></i> Dashboard
                                </Link>
                                <button onClick={handleLogout} className="btn text-start w-100 d-flex align-items-center gap-2" style={{ border: '1px solid rgba(212,175,55,0.4)', color: '#d4af37', borderRadius: '8px', padding: '10px 16px' }}>
                                    <i className="bi bi-box-arrow-right"></i> Logout
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="col-lg-9">
                        <div className="mb-4">
                            <h2 className="text-white fw-bold text-uppercase mb-2" style={{ letterSpacing: '2px' }}>Order History</h2>
                            <p className="text-gold" style={{ letterSpacing: '1px' }}>Track and manage your luxury acquisitions.</p>
                        </div>

                        <div className="glass-panel p-4 shadow-sm" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(212,175,55,0.15)' }}>
                            {orders.length === 0 ? (
                                <div className="text-center py-5">
                                    <i className="bi bi-bag-x display-1 text-gold opacity-50 mb-3 d-block"></i>
                                    <h4 className="text-white">No orders found</h4>
                                    <p className="text-gold mb-4" style={{ opacity: 0.6 }}>Your collection awaits its first masterpiece.</p>
                                    <Link to="/shop" className="btn-gold d-inline-block text-decoration-none">Start Shopping</Link>
                                </div>
                            ) : (
                                <div className="table-responsive">
                                    <table className="table table-dark table-hover table-borderless align-middle m-0 bg-transparent">
                                        <thead>
                                            <tr className="border-bottom border-secondary" style={{ opacity: 0.8 }}>
                                                <th className="py-3 text-uppercase text-gold fs-7" style={{ letterSpacing: '1px' }}>Order ID</th>
                                                <th className="py-3 text-uppercase text-gold fs-7" style={{ letterSpacing: '1px' }}>Date</th>
                                                <th className="py-3 text-uppercase text-gold fs-7" style={{ letterSpacing: '1px' }}>Total</th>
                                                <th className="py-3 text-uppercase text-gold fs-7" style={{ letterSpacing: '1px' }}>Status</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {orders.map(order => (
                                                <tr key={order.id} className="border-bottom border-secondary" style={{ borderColor: 'rgba(255,255,255,0.05) !important' }}>
                                                    <td className="py-3">
                                                        <span className="fw-semibold text-gold">#{order.order_number}</span>
                                                    </td>
                                                    <td className="py-3 text-white" style={{ opacity: 0.85 }}>{new Date(order.created_at).toLocaleDateString()}</td>
                                                    <td className="py-3 fw-bold text-white">${parseFloat(order.total_amount).toFixed(2)}</td>
                                                    <td className="py-3">
                                                        <span className={`badge rounded-pill px-3 py-2 fw-normal ${order.status === 'delivered' ? 'bg-success text-white' :
                                                            order.status === 'cancelled' ? 'bg-danger text-white' :
                                                                'bg-gold'}`}>
                                                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                                        </span>
                                                    </td>
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
        </div>
    );
}
