import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="store-theme pb-4 mt-auto border-top" style={{ background: '#0a0a0a', borderColor: 'rgba(212, 175, 55, 0.1) !important' }}>
      <div className="container pt-5">
        <div className="row g-5 mb-5">
          <div className="col-lg-4">
            <Link to="/" className="text-decoration-none d-inline-block mb-4">
              <div className="fw-bold text-gold" style={{ fontFamily: 'serif', letterSpacing: '3px', lineHeight: '1', fontSize: '2.2rem' }}>
                COUTURE
              </div>
              <div style={{ fontSize: '0.65rem', letterSpacing: '6px', color: '#ccc', marginTop: '2px' }}>
                JEWELLERY
              </div>
            </Link>
            <p className="text-light opacity-75 lh-lg pe-lg-4" style={{ fontSize: '0.9rem' }}>
              From the intricate details of handcrafted pendants to the minimalist allure of everyday rings, our collection celebrates every facet of your journey.
            </p>
          </div>

          <div className="col-6 col-lg-2">
            <h6 className="fw-bold mb-4 text-white text-uppercase" style={{ letterSpacing: '1px' }}>Collections</h6>
            <ul className="list-unstyled">
              <li className="mb-3"><Link to="/shop" className="text-light opacity-75 text-decoration-none hover-opacity-100 transition-all">All Products</Link></li>
              <li className="mb-3"><Link to="/shop?sort=newest" className="text-light opacity-75 text-decoration-none hover-opacity-100 transition-all">New Arrivals</Link></li>
              <li className="mb-3"><Link to="/shop?sort=featured" className="text-light opacity-75 text-decoration-none hover-opacity-100 transition-all">Best Sellers</Link></li>
            </ul>
          </div>

          <div className="col-6 col-lg-2">
            <h6 className="fw-bold mb-4 text-white text-uppercase" style={{ letterSpacing: '1px' }}>Support</h6>
            <ul className="list-unstyled">
              <li className="mb-3"><Link to="/contact" className="text-light opacity-75 text-decoration-none hover-opacity-100 transition-all">Contact Us</Link></li>
              <li className="mb-3"><Link to="/about" className="text-light opacity-75 text-decoration-none hover-opacity-100 transition-all">About Us</Link></li>
              <li className="mb-3"><Link to="/shipping-policy" className="text-light opacity-75 text-decoration-none hover-opacity-100 transition-all">Shipping Info</Link></li>
              <li className="mb-3"><Link to="/refund-policy" className="text-light opacity-75 text-decoration-none hover-opacity-100 transition-all">Returns & Refunds</Link></li>
            </ul>
          </div>

          <div className="col-lg-4">
            <h6 className="fw-bold mb-4 text-white text-uppercase" style={{ letterSpacing: '1px' }}>Stay Exclusive</h6>
            <p className="text-light opacity-75 mb-4" style={{ fontSize: '0.9rem' }}>Subscribe to our newsletter for exclusive offers and updates.</p>
            <div className="input-group glass-panel rounded-pill p-1 mx-0" style={{ maxWidth: '100%', borderColor: 'rgba(255, 255, 255, 0.1)' }}>
              <input type="email" className="form-control border-0 bg-transparent text-white shadow-none px-4" placeholder="Your email address" style={{ fontSize: '0.9rem' }} />
              <button className="btn btn-gold rounded-pill px-4 text-uppercase fw-bold" style={{ fontSize: '0.8rem', letterSpacing: '1px', padding: '10px 20px' }}>Subscribe</button>
            </div>
          </div>
        </div>

        <hr className="border-secondary opacity-25" />

        {/* Bottom Row with Policy Links & Socials */}
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-center pt-3 pb-2 gap-3">
          <p className="text-light opacity-50 small mb-0" style={{ letterSpacing: '1px' }}>&copy; {new Date().getFullYear()} COUTURE JEWELLERY. All rights reserved.</p>

          <div className="d-flex gap-3 flex-wrap justify-content-center" style={{ fontSize: '0.78rem' }}>
            <Link to="/privacy-policy" className="text-light opacity-50 text-decoration-none hover-opacity-100 transition-all">Privacy Policy</Link>
            <span className="text-light opacity-25">|</span>
            <Link to="/terms-conditions" className="text-light opacity-50 text-decoration-none hover-opacity-100 transition-all">Terms & Conditions</Link>
            <span className="text-light opacity-25">|</span>
            <Link to="/refund-policy" className="text-light opacity-50 text-decoration-none hover-opacity-100 transition-all">Refund Policy</Link>
            <span className="text-light opacity-25">|</span>
            <Link to="/shipping-policy" className="text-light opacity-50 text-decoration-none hover-opacity-100 transition-all">Shipping</Link>
          </div>

          <div className="d-flex gap-4">
            <a href="https://facebook.com" target="_blank" rel="noreferrer" className="text-light opacity-50 hover-opacity-100 transition-all"><i className="bi bi-facebook fs-6"></i></a>
            <a href="https://twitter.com" target="_blank" rel="noreferrer" className="text-light opacity-50 hover-opacity-100 transition-all"><i className="bi bi-twitter-x fs-6"></i></a>
            <a href="https://instagram.com" target="_blank" rel="noreferrer" className="text-light opacity-50 hover-opacity-100 transition-all"><i className="bi bi-instagram fs-6"></i></a>
          </div>
        </div>
      </div>
    </footer>
  );
}

