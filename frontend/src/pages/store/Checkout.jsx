import { useState } from 'react';
import { useCart } from '../../context/CartContext';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';

const loadRazorpayScript = () => {
    return new Promise((resolve) => {
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
    });
};

export default function Checkout() {
    const { cart, getCartTotal, clearCart } = useCart();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState('online');
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        state: '',
        zip: '',
    });

    const handleInputChange = (e) => {
        setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleCOD = async () => {
        try {
            const total = getCartTotal();
            const { data } = await api.post('/payment/create-cod-order', {
                items: cart.map(item => ({
                    ...item,
                    id: item.baseId || item.id
                })),
                billing: formData,
                total: total
            });

            if (data.success) {
                clearCart();
                alert('Order placed successfully! Pay on delivery.');
                navigate('/');
            } else {
                alert('Failed to place order.');
            }
        } catch (error) {
            console.error(error);
            alert('Error placing COD order.');
        }
    };

    const handlePayment = async (e) => {
        e.preventDefault();
        setLoading(true);

        if (paymentMethod === 'cod') {
            await handleCOD();
            setLoading(false);
            return;
        }

        try {
            const res = await loadRazorpayScript();
            if (!res) {
                alert('Razorpay SDK failed to load. Please check your connection.');
                setLoading(false);
                return;
            }

            const total = getCartTotal();

            // 1. Create Order on backend
            const { data } = await api.post('/payment/create-order', {
                items: cart.map(item => ({
                    ...item,
                    id: item.baseId || item.id
                })),
                billing: formData,
                total: total
            });

            if (!data.success) {
                alert('Failed to place order.');
                setLoading(false);
                return;
            }

            const { id: order_id, currency, amount, dbOrderId, rzpKey } = data.data;

            // 2. Setup Razorpay configuration options
            const options = {
                key: rzpKey, // Use key dynamically returned from backend
                amount: amount,
                currency: currency,
                name: "ShopHub Store",
                description: "Order Checkout",
                order_id: order_id,
                handler: async function (response) {
                    try {
                        const verifyRes = await api.post('/payment/verify-payment', {
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_signature: response.razorpay_signature,
                            dbOrderId: dbOrderId,
                            amount: total
                        });

                        if (verifyRes.data.success) {
                            clearCart();
                            alert('Payment Successful & Order placed!');
                            navigate('/');
                        } else {
                            alert('Payment verification failed.');
                        }
                    } catch (err) {
                        console.error("Verification error:", err);
                        alert('Error verifying payment.');
                    }
                },
                prefill: {
                    name: formData.name,
                    email: formData.email,
                    contact: formData.phone
                },
                theme: {
                    color: "#0f172a"
                }
            };

            const paymentObject = new window.Razorpay(options);
            paymentObject.on('payment.failed', function (response) {
                alert(`Payment failed: ${response.error.description}`);
            });
            paymentObject.open();

        } catch (error) {
            console.error(error);
            if (error.response && error.response.status === 401) {
                alert('Razorpay Keys are missing on backend. Please configure them in .env');
            } else {
                alert('Error during checkout setup');
            }
        } finally {
            setLoading(false);
        }
    };

    if (cart.length === 0) {
        return (
            <div className="store-theme d-flex align-items-center justify-content-center" style={{ minHeight: '100vh', background: '#050505' }}>
                <div className="text-center p-5">
                    <i className="bi bi-shield-lock fs-1 d-block mb-3" style={{ color: '#d4af37', opacity: 0.5 }}></i>
                    <h2 className="text-white fw-light mb-3">Your Cart is Empty</h2>
                    <p className="text-muted mb-4">You have no items in your collection to checkout.</p>
                    <Link to="/shop" className="btn px-4 py-2 text-uppercase fw-bold rounded-0" style={{ background: 'linear-gradient(45deg, rgba(212, 175, 55, 0.1), rgba(212, 175, 55, 0.2))', border: '1px solid rgba(212,175,55,0.4)', color: '#d4af37', letterSpacing: '1px' }}>
                        Return to Shop
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="store-theme" style={{ background: '#050505', minHeight: '100vh', color: '#fff', paddingBottom: '5rem' }}>
            <div className="container py-5">
                <div className="d-flex align-items-center mb-4 gap-3">
                    <Link to="/shop" className="btn btn-link text-muted p-0 text-decoration-none">
                        <i className="bi bi-arrow-left"></i>
                    </Link>
                    <h2 className="fw-light m-0" style={{ letterSpacing: '1px' }}>Secure Checkout</h2>
                </div>

                <div className="row g-5">
                    {/* Billing Details */}
                    <div className="col-lg-8">
                        <div className="card border-0 p-4 p-md-5 rounded-4 shadow-lg" style={{ background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.05) !important' }}>
                            <h4 className="mb-4 fw-light text-white" style={{ letterSpacing: '0.5px' }}><i className="bi bi-person-lines-fill me-2 text-gold opacity-75"></i> Billing Details</h4>
                            <form onSubmit={handlePayment}>
                                <div className="row g-4">
                                    <div className="col-md-6">
                                        <label className="form-label text-white opacity-75 small text-uppercase" style={{ letterSpacing: '1px' }}>Full Name</label>
                                        <input type="text" className="form-control bg-transparent text-white border-secondary border-opacity-25 rounded-0 shadow-none px-3 py-2" name="name" value={formData.name} onChange={handleInputChange} required />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label text-white opacity-75 small text-uppercase" style={{ letterSpacing: '1px' }}>Email Address</label>
                                        <input type="email" className="form-control bg-transparent text-white border-secondary border-opacity-25 rounded-0 shadow-none px-3 py-2" name="email" value={formData.email} onChange={handleInputChange} required />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label text-white opacity-75 small text-uppercase" style={{ letterSpacing: '1px' }}>Phone Number</label>
                                        <input type="tel" className="form-control bg-transparent text-white border-secondary border-opacity-25 rounded-0 shadow-none px-3 py-2" name="phone" value={formData.phone} onChange={handleInputChange} required />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label text-white opacity-75 small text-uppercase" style={{ letterSpacing: '1px' }}>City</label>
                                        <input type="text" className="form-control bg-transparent text-white border-secondary border-opacity-25 rounded-0 shadow-none px-3 py-2" name="city" value={formData.city} onChange={handleInputChange} required />
                                    </div>
                                    <div className="col-12">
                                        <label className="form-label text-white opacity-75 small text-uppercase" style={{ letterSpacing: '1px' }}>Street Address</label>
                                        <input type="text" className="form-control bg-transparent text-white border-secondary border-opacity-25 rounded-0 shadow-none px-3 py-2" name="address" value={formData.address} onChange={handleInputChange} required />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label text-white opacity-75 small text-uppercase" style={{ letterSpacing: '1px' }}>State/Province</label>
                                        <input type="text" className="form-control bg-transparent text-white border-secondary border-opacity-25 rounded-0 shadow-none px-3 py-2" name="state" value={formData.state} onChange={handleInputChange} required />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label text-white opacity-75 small text-uppercase" style={{ letterSpacing: '1px' }}>ZIP / Postal Code</label>
                                        <input type="text" className="form-control bg-transparent text-white border-secondary border-opacity-25 rounded-0 shadow-none px-3 py-2" name="zip" value={formData.zip} onChange={handleInputChange} required />
                                    </div>
                                </div>

                                {/* Payment Method Selection */}
                                <div className="mt-5 mb-4">
                                    <h5 className="mb-3 fw-light text-white" style={{ letterSpacing: '0.5px' }}>
                                        <i className="bi bi-credit-card-2-front me-2 opacity-75" style={{ color: '#d4af37' }}></i>
                                        Payment Method
                                    </h5>
                                    <div className="row g-3">
                                        {/* Online Payment Option */}
                                        <div className="col-md-6">
                                            <div
                                                className="p-3 h-100 d-flex align-items-start gap-3"
                                                style={{
                                                    cursor: 'pointer',
                                                    background: paymentMethod === 'online' ? 'rgba(212,175,55,0.08)' : 'rgba(255,255,255,0.02)',
                                                    border: paymentMethod === 'online' ? '1.5px solid rgba(212,175,55,0.6)' : '1px solid rgba(255,255,255,0.08)',
                                                    transition: 'all 0.3s ease'
                                                }}
                                                onClick={() => setPaymentMethod('online')}
                                            >
                                                <div className="mt-1">
                                                    <div style={{
                                                        width: 20, height: 20, borderRadius: '50%',
                                                        border: paymentMethod === 'online' ? '2px solid #d4af37' : '2px solid rgba(255,255,255,0.2)',
                                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                        transition: 'all 0.3s ease'
                                                    }}>
                                                        {paymentMethod === 'online' && (
                                                            <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#d4af37' }}></div>
                                                        )}
                                                    </div>
                                                </div>
                                                <div>
                                                    <div className="fw-medium text-white mb-1" style={{ fontSize: '0.95rem' }}>
                                                        <i className="bi bi-globe me-2" style={{ color: '#d4af37' }}></i>
                                                        Pay Online
                                                    </div>
                                                    <div className="text-muted" style={{ fontSize: '0.78rem', lineHeight: 1.4 }}>
                                                        UPI, Card, Net Banking via Razorpay
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        {/* Cash on Delivery Option */}
                                        <div className="col-md-6">
                                            <div
                                                className="p-3 h-100 d-flex align-items-start gap-3"
                                                style={{
                                                    cursor: 'pointer',
                                                    background: paymentMethod === 'cod' ? 'rgba(212,175,55,0.08)' : 'rgba(255,255,255,0.02)',
                                                    border: paymentMethod === 'cod' ? '1.5px solid rgba(212,175,55,0.6)' : '1px solid rgba(255,255,255,0.08)',
                                                    transition: 'all 0.3s ease'
                                                }}
                                                onClick={() => setPaymentMethod('cod')}
                                            >
                                                <div className="mt-1">
                                                    <div style={{
                                                        width: 20, height: 20, borderRadius: '50%',
                                                        border: paymentMethod === 'cod' ? '2px solid #d4af37' : '2px solid rgba(255,255,255,0.2)',
                                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                        transition: 'all 0.3s ease'
                                                    }}>
                                                        {paymentMethod === 'cod' && (
                                                            <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#d4af37' }}></div>
                                                        )}
                                                    </div>
                                                </div>
                                                <div>
                                                    <div className="fw-medium text-white mb-1" style={{ fontSize: '0.95rem' }}>
                                                        <i className="bi bi-cash-coin me-2" style={{ color: '#d4af37' }}></i>
                                                        Cash on Delivery
                                                    </div>
                                                    <div className="text-muted" style={{ fontSize: '0.78rem', lineHeight: 1.4 }}>
                                                        Pay when your order arrives
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <button type="submit" className="btn w-100 py-3 fw-bold rounded-0 text-uppercase d-flex align-items-center justify-content-center"
                                        style={{ background: '#d4af37', color: '#000', letterSpacing: '1px', border: 'none' }}
                                        disabled={loading}>
                                        {loading ? (
                                            <span className="spinner-border spinner-border-sm me-2"></span>
                                        ) : (
                                            <i className={`bi ${paymentMethod === 'online' ? 'bi-shield-lock' : 'bi-bag-check'} me-2 fs-5`}></i>
                                        )}
                                        {loading
                                            ? 'Processing...'
                                            : paymentMethod === 'online'
                                                ? `Pay Rs. ${getCartTotal().toFixed(2)} Securely`
                                                : `Place Order — Rs. ${getCartTotal().toFixed(2)}`
                                        }
                                    </button>
                                    {paymentMethod === 'cod' && (
                                        <p className="text-center mt-3 mb-0 text-muted" style={{ fontSize: '0.78rem' }}>
                                            <i className="bi bi-info-circle me-1"></i>
                                            You will pay the delivery partner when your order arrives.
                                        </p>
                                    )}
                                </div>
                            </form>
                        </div>
                    </div>

                    {/* Order Summary */}
                    <div className="col-lg-4">
                        <div className="card p-4 rounded-4 sticky-top" style={{ top: '100px', background: 'rgba(212,175,55,0.03)', border: '1px solid rgba(212,175,55,0.1)' }}>
                            <h4 className="mb-4 fw-light text-white" style={{ letterSpacing: '0.5px' }}>Order Summary</h4>
                            <div className="d-flex flex-column gap-3 mb-4">
                                {cart.map((item) => (
                                    <div key={item.id} className="d-flex justify-content-between align-items-center pb-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                        <div className="d-flex align-items-center gap-3">
                                            <div className="rounded overflow-hidden" style={{ border: '1px solid rgba(212,175,55,0.2)' }}>
                                                <img src="https://images.unsplash.com/photo-1605100804763-247f67b3557e?q=80&w=800&auto=format&fit=crop" alt={item.name} className="object-fit-cover" style={{ width: 50, height: 50 }} />
                                            </div>
                                            <div style={{ fontSize: '0.9rem' }}>
                                                <p className="mb-0 text-white fw-medium text-truncate" style={{ maxWidth: 150 }}>{item.name}</p>
                                                <small className="text-muted">Qty: {item.quantity}</small>
                                            </div>
                                        </div>
                                        <div className="fw-semibold" style={{ color: '#d4af37' }}>
                                            Rs. {((item.sale_price || item.price) * item.quantity).toFixed(2)}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="d-flex justify-content-between mb-3 text-white opacity-75">
                                <span>Subtotal</span>
                                <span>Rs. {getCartTotal().toFixed(2)}</span>
                            </div>
                            <div className="d-flex justify-content-between mb-4">
                                <span className="text-white opacity-75">Shipping</span>
                                <span className="text-gold" style={{ color: '#d4af37' }}>Free Premium Delivery</span>
                            </div>
                            <hr className="border-secondary opacity-25 mt-0 mb-3" />
                            <div className="d-flex justify-content-between align-items-center fs-4 fw-bold text-white">
                                <span>Total</span>
                                <span style={{ color: '#d4af37' }}>Rs. {getCartTotal().toFixed(2)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
