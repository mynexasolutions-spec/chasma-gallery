import { useCart } from '../../context/CartContext';
import { Link } from 'react-router-dom';

export default function CartOffcanvas() {
    const { cart, isCartOpen, setIsCartOpen, removeFromCart, updateQuantity, getCartTotal } = useCart();

    return (
        <>
            {/* Backdrop */}
            {isCartOpen && (
                <div
                    className="offcanvas-backdrop fade show"
                    onClick={() => setIsCartOpen(false)}
                    style={{ zIndex: 1040, backgroundColor: 'rgba(0,0,0,0.8)' }}
                ></div>
            )}

            {/* Offcanvas Panel */}
            <div
                className={`offcanvas offcanvas-end ${isCartOpen ? 'show' : ''}`}
                tabIndex="-1"
                style={{
                    visibility: isCartOpen ? 'visible' : 'hidden',
                    zIndex: 1045,
                    width: '420px',
                    background: '#0a0a0a',
                    borderLeft: '1px solid rgba(212,175,55,0.2)',
                    color: '#fff'
                }}
            >
                <div className="offcanvas-header" style={{ borderBottom: '1px solid rgba(212,175,55,0.2)' }}>
                    <h5 className="offcanvas-title fw-light d-flex align-items-center gap-2 m-0" style={{ letterSpacing: '1px' }}>
                        <i className="bi bi-bag text-gold"></i> Your Collection
                    </h5>
                    <button
                        type="button"
                        className="btn-close btn-close-white shadow-none opacity-75"
                        onClick={() => setIsCartOpen(false)}
                    ></button>
                </div>

                <div className="offcanvas-body d-flex flex-column p-0" style={{ background: '#050505' }}>
                    {cart.length === 0 ? (
                        <div className="text-center p-5 my-auto text-muted">
                            <i className="bi bi-gem fs-1 text-gold opacity-50 mb-3 d-block"></i>
                            <h6 className="text-white fw-light mb-2">Your collection is empty.</h6>
                            <p className="small opacity-75 mb-4">Discover our exquisite pieces.</p>
                            <button className="btn w-100 text-uppercase rounded-0 py-2 fw-bold"
                                style={{ background: 'linear-gradient(45deg, rgba(212, 175, 55, 0.1), rgba(212, 175, 55, 0.2))', color: '#d4af37', border: '1px solid rgba(212, 175, 55, 0.3)' }}
                                onClick={() => setIsCartOpen(false)}>
                                Continue Shopping
                            </button>
                        </div>
                    ) : (
                        <>
                            {/* Cart Items */}
                            <div className="flex-grow-1 overflow-auto p-4 d-flex flex-column gap-3 no-scrollbar">
                                {cart.map((item) => {
                                    const itemPrice = item.sale_price ? parseFloat(item.sale_price) : parseFloat(item.price);
                                    return (
                                        <div key={item.id} className="card border-0 rounded-0" style={{ background: 'transparent' }}>
                                            <div className="card-body p-0 d-flex gap-3 align-items-center">
                                                <div style={{ padding: '4px', border: '1px solid rgba(212,175,55,0.2)', background: '#111' }}>
                                                    <img
                                                        src="https://images.unsplash.com/photo-1605100804763-247f67b3557e?q=80&w=800&auto=format&fit=crop"
                                                        alt={item.name}
                                                        className="object-fit-cover"
                                                        style={{ width: 70, height: 70 }}
                                                    />
                                                </div>
                                                <div className="flex-grow-1">
                                                    <div className="d-flex justify-content-between align-items-start mb-1">
                                                        <h6 className="mb-0 text-truncate text-white fw-medium" style={{ maxWidth: 180, fontSize: '0.9rem' }}>
                                                            {item.name}
                                                        </h6>
                                                        <button
                                                            className="btn btn-link text-muted p-0 ms-1 opacity-75 pe-2"
                                                            onClick={() => removeFromCart(item.id)}
                                                        >
                                                            <i className="bi bi-x-lg" style={{ fontSize: '0.8rem' }}></i>
                                                        </button>
                                                    </div>
                                                    <div className="fw-bold mb-2 small" style={{ color: '#d4af37' }}>
                                                        Rs. {itemPrice.toFixed(2)}
                                                    </div>
                                                    <div className="d-flex align-items-center gap-2">
                                                        <button
                                                            className="btn btn-sm py-0 px-2 rounded-0 text-white"
                                                            style={{ border: '1px solid rgba(255,255,255,0.2)', background: '#111' }}
                                                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                        >
                                                            -
                                                        </button>
                                                        <span className="small fw-semibold text-white" style={{ width: '20px', textAlign: 'center' }}>
                                                            {item.quantity}
                                                        </span>
                                                        <button
                                                            className="btn btn-sm py-0 px-2 rounded-0 text-white"
                                                            style={{ border: '1px solid rgba(255,255,255,0.2)', background: '#111' }}
                                                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                        >
                                                            +
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Cart Footer */}
                            <div className="p-4" style={{ background: '#0a0a0a', borderTop: '1px solid rgba(212,175,55,0.2)' }}>
                                <div className="d-flex justify-content-between align-items-center mb-4">
                                    <span className="text-muted fw-semibold text-uppercase" style={{ letterSpacing: '1px', fontSize: '0.85rem' }}>Subtotal</span>
                                    <span className="fs-5 fw-bold" style={{ color: '#d4af37' }}>Rs. {getCartTotal().toFixed(2)}</span>
                                </div>
                                <Link
                                    to="/checkout"
                                    className="btn w-100 py-3 rounded-0 fw-bold shadow-sm d-flex justify-content-center align-items-center text-uppercase"
                                    style={{ background: '#d4af37', color: '#000', letterSpacing: '1px' }}
                                    onClick={() => setIsCartOpen(false)}
                                >
                                    Secure Checkout <i className="bi bi-shield-lock ms-2"></i>
                                </Link>
                                <div className="text-center mt-3">
                                    <button className="btn btn-link opacity-50 small text-decoration-none text-white text-uppercase" style={{ letterSpacing: '1px', fontSize: '0.75rem' }} onClick={() => setIsCartOpen(false)}>
                                        Continue Shopping
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </>
    );
}
