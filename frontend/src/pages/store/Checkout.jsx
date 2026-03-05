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

    const handlePayment = async (e) => {
        e.preventDefault();
        setLoading(true);

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
                items: cart,
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
            <div className="container py-5 text-center">
                <h2>Your Cart is Empty</h2>
                <p className="text-muted">You have no items in your cart to checkout.</p>
                <Link to="/shop" className="btn btn-primary mt-3">Go to Shop</Link>
            </div>
        );
    }

    return (
        <div className="container py-5">
            <h2 className="mb-4 fw-bold">Checkout</h2>
            <div className="row g-4">
                {/* Billing Details */}
                <div className="col-lg-8">
                    <div className="card shadow-sm border-0 p-4">
                        <h4 className="mb-3">Billing Details</h4>
                        <form onSubmit={handlePayment}>
                            <div className="row g-3">
                                <div className="col-md-6">
                                    <label className="form-label">Full Name</label>
                                    <input type="text" className="form-control" name="name" value={formData.name} onChange={handleInputChange} required />
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label">Email Address</label>
                                    <input type="email" className="form-control" name="email" value={formData.email} onChange={handleInputChange} required />
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label">Phone Number</label>
                                    <input type="tel" className="form-control" name="phone" value={formData.phone} onChange={handleInputChange} required />
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label">City</label>
                                    <input type="text" className="form-control" name="city" value={formData.city} onChange={handleInputChange} required />
                                </div>
                                <div className="col-12">
                                    <label className="form-label">Street Address</label>
                                    <input type="text" className="form-control" name="address" value={formData.address} onChange={handleInputChange} required />
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label">State/Province</label>
                                    <input type="text" className="form-control" name="state" value={formData.state} onChange={handleInputChange} required />
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label">ZIP / Postal Code</label>
                                    <input type="text" className="form-control" name="zip" value={formData.zip} onChange={handleInputChange} required />
                                </div>
                            </div>

                            <div className="mt-4">
                                <button type="submit" className="btn btn-dark w-100 py-3 fw-bold shadow" disabled={loading}>
                                    {loading ? 'Processing...' : `Pay $${getCartTotal().toFixed(2)} with Razorpay`}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                {/* Order Summary */}
                <div className="col-lg-4">
                    <div className="card shadow-sm border-0 p-4 bg-light">
                        <h4 className="mb-3">Order Summary</h4>
                        <div className="d-flex flex-column gap-3 mb-3">
                            {cart.map((item) => (
                                <div key={item.id} className="d-flex justify-content-between align-items-center">
                                    <div className="d-flex align-items-center gap-2">
                                        <img src={item.image_url} alt={item.name} className="rounded object-fit-cover" style={{ width: 40, height: 40 }} />
                                        <div style={{ fontSize: '0.9rem' }}>
                                            <p className="mb-0 text-truncate" style={{ maxWidth: 150 }}>{item.name}</p>
                                            <small className="text-muted">Qty: {item.quantity}</small>
                                        </div>
                                    </div>
                                    <div className="fw-semibold">
                                        ${((item.sale_price || item.price) * item.quantity).toFixed(2)}
                                    </div>
                                </div>
                            ))}
                        </div>
                        <hr />
                        <div className="d-flex justify-content-between mb-2">
                            <span className="text-muted">Subtotal</span>
                            <span>${getCartTotal().toFixed(2)}</span>
                        </div>
                        <div className="d-flex justify-content-between mb-3">
                            <span className="text-muted">Shipping</span>
                            <span className="text-success">Free</span>
                        </div>
                        <div className="d-flex justify-content-between fs-5 fw-bold">
                            <span>Total</span>
                            <span>${getCartTotal().toFixed(2)}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
