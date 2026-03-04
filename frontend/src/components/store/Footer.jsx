import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-dark text-light pt-5 pb-3 mt-auto">
      <div className="container">
        <div className="row g-4 mb-4">
          <div className="col-lg-4">
            <h5 className="fw-bold mb-3">
              <i className="bi bi-bag-heart-fill text-primary me-2"></i>ShopHub
            </h5>
            <p className="text-secondary small">
              Your one-stop destination for quality products at great prices.
              Shop the latest trends with confidence.
            </p>
          </div>
          <div className="col-6 col-lg-2">
            <h6 className="fw-semibold mb-3">Shop</h6>
            <ul className="list-unstyled small">
              <li className="mb-2"><Link to="/shop" className="text-secondary text-decoration-none">All Products</Link></li>
              <li className="mb-2"><Link to="/shop?sort=newest" className="text-secondary text-decoration-none">New Arrivals</Link></li>
              <li className="mb-2"><Link to="/shop?sort=price_asc" className="text-secondary text-decoration-none">Best Deals</Link></li>
            </ul>
          </div>
          <div className="col-6 col-lg-2">
            <h6 className="fw-semibold mb-3">Support</h6>
            <ul className="list-unstyled small">
              <li className="mb-2"><span className="text-secondary">Contact Us</span></li>
              <li className="mb-2"><span className="text-secondary">FAQ</span></li>
              <li className="mb-2"><span className="text-secondary">Shipping Info</span></li>
              <li className="mb-2"><span className="text-secondary">Returns</span></li>
            </ul>
          </div>
          <div className="col-lg-4">
            <h6 className="fw-semibold mb-3">Stay Updated</h6>
            <p className="text-secondary small mb-3">Subscribe to get notified about new products and offers.</p>
            <div className="input-group">
              <input type="email" className="form-control form-control-sm" placeholder="Your email..." />
              <button className="btn btn-primary btn-sm">Subscribe</button>
            </div>
          </div>
        </div>
        <hr className="border-secondary" />
        <div className="d-flex flex-wrap justify-content-between align-items-center">
          <p className="text-secondary small mb-0">&copy; 2026 ShopHub. All rights reserved.</p>
          <div className="d-flex gap-3">
            <a href="#" className="text-secondary"><i className="bi bi-facebook"></i></a>
            <a href="#" className="text-secondary"><i className="bi bi-twitter-x"></i></a>
            <a href="#" className="text-secondary"><i className="bi bi-instagram"></i></a>
          </div>
        </div>
      </div>
    </footer>
  );
}
