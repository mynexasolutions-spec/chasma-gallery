import { useCart } from '../../context/CartContext';
import { Link } from 'react-router-dom';

export default function CartOffcanvas() {
    const { cart, isCartOpen, setIsCartOpen, removeFromCart, updateQuantity, getCartTotal } = useCart();

    // Simple override to display as a side panel without requiring bootstrap's JS data-attributes if we manage state
    return (
        <>
            {/* Backdrop */}
            {isCartOpen && (
                <div
                    className="offcanvas-backdrop fade show"
                    onClick={() => setIsCartOpen(false)}
                    style={{ zIndex: 1040 }}
                ></div>
            )}

            {/* Offcanvas Panel */}
            <div
                className={`offcanvas offcanvas-end ${isCartOpen ? 'show' : ''}`}
                tabIndex="-1"
                style={{ visibility: isCartOpen ? 'visible' : 'hidden', zIndex: 1045, width: '400px' }}
            >
                <div className="offcanvas-header border-bottom">
                    <h5 className="offcanvas-title fw-bold d-flex align-items-center gap-2">
                        <i className="bi bi-cart3"></i> Your Cart
                    </h5>
                    <button
                        type="button"
                        className="btn-close shadow-none"
                        onClick={() => setIsCartOpen(false)}
                    ></button>
                </div>

                <div className="offcanvas-body d-flex flex-column bg-light p-0">
                    {cart.length === 0 ? (
                        <div className="text-center p-5 my-auto text-muted">
                            <i className="bi bi-bag-x fs-1 opacity-50 mb-3 d-block"></i>
                            <h6>Your cart is empty.</h6>
                            <p>Looks like you haven't added anything yet.</p>
                            <button className="btn btn-outline-primary mt-2 rounded-pill px-4" onClick={() => setIsCartOpen(false)}>
                                Continue Shopping
                            </button>
                        </div>
                    ) : (
                        <>
                            {/* Cart Items */}
                            <div className="flex-grow-1 overflow-auto p-3 d-flex flex-column gap-3">
                                {cart.map((item) => {
                                    const itemPrice = item.sale_price ? parseFloat(item.sale_price) : parseFloat(item.price);
                                    return (
                                        <div key={item.id} className="card border-0 shadow-sm rounded-3">
                                            <div className="card-body p-2 d-flex gap-3 align-items-center">
                                                <img
                                                    src={item.image_url || 'https://via.placeholder.com/80'}
                                                    alt={item.name}
                                                    className="rounded object-fit-cover"
                                                    style={{ width: 80, height: 80 }}
                                                />
                                                <div className="flex-grow-1">
                                                    <div className="d-flex justify-content-between align-items-start mb-1">
                                                        <h6 className="mb-0 text-truncate" style={{ maxWidth: 180, fontSize: '0.9rem' }}>
                                                            {item.name}
                                                        </h6>
                                                        <button
                                                            className="btn btn-link text-danger p-0 ms-1"
                                                            onClick={() => removeFromCart(item.id)}
                                                        >
                                                            <i className="bi bi-trash"></i>
                                                        </button>
                                                    </div>
                                                    <div className="text-primary fw-bold mb-2 small">
                                                        ${itemPrice.toFixed(2)}
                                                    </div>
                                                    <div className="d-flex align-items-center gap-2">
                                                        <button
                                                            className="btn btn-sm btn-outline-secondary py-0 px-2"
                                                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                        >
                                                            -
                                                        </button>
                                                        <span className="small fw-semibold" style={{ width: '20px', textAlign: 'center' }}>
                                                            {item.quantity}
                                                        </span>
                                                        <button
                                                            className="btn btn-sm btn-outline-secondary py-0 px-2"
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
                            <div className="border-top bg-white p-3 shadow">
                                <div className="d-flex justify-content-between align-items-center mb-3">
                                    <span className="text-muted fw-semibold">Subtotal</span>
                                    <span className="fs-5 fw-bold text-dark">${getCartTotal().toFixed(2)}</span>
                                </div>
                                <Link
                                    to="/checkout"
                                    className="btn btn-dark w-100 py-3 rounded-pill fw-bold shadow-sm"
                                    onClick={() => setIsCartOpen(false)}
                                >
                                    Proceed to Checkout <i className="bi bi-arrow-right ms-2"></i>
                                </Link>
                                <div className="text-center mt-2">
                                    <button className="btn btn-link text-muted small text-decoration-none" onClick={() => setIsCartOpen(false)}>
                                        Or continue shopping
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
