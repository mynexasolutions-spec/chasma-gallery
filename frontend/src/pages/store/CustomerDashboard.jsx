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
        <div className="container py-5">
            <div className="row g-4">
                {/* Sidebar */}
                <div className="col-lg-3">
                    <div className="card shadow-sm border-0 p-4">
                        <h4 className="mb-4 text-break">Hello, {user?.first_name}</h4>
                        <div className="d-flex flex-column gap-2">
                            <Link to="/dashboard" className="btn btn-dark text-start fw-bold">
                                <i className="bi bi-grid-fill me-2"></i> Dashboard
                            </Link>
                            <button onClick={handleLogout} className="btn btn-outline-danger text-start">
                                <i className="bi bi-box-arrow-right me-2"></i> Logout
                            </button>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="col-lg-9">
                    <div className="card shadow-sm border-0 p-4 mb-4">
                        <h3 className="fw-bold mb-3">Order History</h3>
                        {orders.length === 0 ? (
                            <div className="text-center py-5 bg-light rounded">
                                <i className="bi bi-box2 fs-1 text-muted mb-3 d-block"></i>
                                <h5>No orders found</h5>
                                <p className="text-muted">You haven't placed any orders yet.</p>
                                <Link to="/shop" className="btn btn-primary mt-2">Start Shopping</Link>
                            </div>
                        ) : (
                            <div className="table-responsive">
                                <table className="table align-middle">
                                    <thead className="table-light">
                                        <tr>
                                            <th>Order ID</th>
                                            <th>Date</th>
                                            <th>Total</th>
                                            <th>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {orders.map(order => (
                                            <tr key={order.id}>
                                                <td className="fw-semibold">
                                                    #{order.order_number}
                                                </td>
                                                <td>{new Date(order.created_at).toLocaleDateString()}</td>
                                                <td>${parseFloat(order.total_amount).toFixed(2)}</td>
                                                <td>
                                                    <span className={`badge rounded-pill ${order.status === 'delivered' ? 'bg-success' :
                                                        order.status === 'cancelled' ? 'bg-danger' : 'bg-warning text-dark'
                                                        }`}>
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
    );
}
