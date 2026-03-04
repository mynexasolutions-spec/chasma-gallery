import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function Navbar() {
  const { pathname } = useLocation();
  const { user } = useAuth();

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
            {user ? (
              <Link to="/admin" className="btn btn-sm btn-outline-dark">
                <i className="bi bi-speedometer2 me-1"></i>Dashboard
              </Link>
            ) : (
              <Link to="/admin/login" className="btn btn-sm btn-outline-dark">
                <i className="bi bi-person me-1"></i>Sign In
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
