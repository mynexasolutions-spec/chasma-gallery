import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';

export default function Navbar() {
  const { pathname } = useLocation();
  const { user } = useAuth();
  const { getCartCount, setIsCartOpen } = useCart();

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-white border-bottom sticky-top shadow-sm">
      <div className="container">
        <Link to="/" className="navbar-brand fw-bold fs-4">
          <i className="bi bi-bag-heart-fill text-primary me-2"></i>
          ShopHub
        </Link>

        <button className="navbar-toggler" data-bs-toggle="collapse" data-bs-target="#storeNav">
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="storeNav">
          <ul className="navbar-nav me-auto ms-3">
            <li className="nav-item">
              <Link to="/" className={`nav-link ${pathname === '/' ? 'active fw-semibold' : ''}`}>Home</Link>
            </li>
            <li className="nav-item">
              <Link to="/shop" className={`nav-link ${pathname.startsWith('/shop') ? 'active fw-semibold' : ''}`}>Shop</Link>
            </li>
          </ul>

          <div className="d-flex align-items-center gap-3">
            <button
              className="btn btn-light rounded-circle position-relative p-2 text-dark border shadow-sm cart-btn-hover"
              onClick={() => setIsCartOpen(true)}
            >
              <i className="bi bi-cart3 fs-5"></i>
              {getCartCount() > 0 && (
                <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger shadow-sm">
                  {getCartCount()}
                </span>
              )}
            </button>
            {user ? (
              <Link to={user.role === 'admin' || user.role === 'manager' ? "/admin" : "/dashboard"} className="btn btn-sm btn-dark px-3 py-2 ms-2 rounded-pill shadow-sm fw-semibold">
                <i className="bi bi-speedometer2 me-1"></i> Dashboard
              </Link>
            ) : (
              <Link to="/login" className="btn btn-sm btn-outline-dark px-3 py-2 ms-2 rounded-pill fw-semibold shadow-sm">
                <i className="bi bi-person me-1"></i> Sign In
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
