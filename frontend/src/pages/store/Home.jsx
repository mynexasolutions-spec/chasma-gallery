import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';

function ProductCard({ product }) {
  const discount = product.sale_price
    ? Math.round((1 - product.sale_price / product.price) * 100)
    : 0;

  return (
    <Link to={`/shop/product/${product.id}`} className="text-decoration-none">
      <div className="card store-card h-100 border-0 shadow-sm">
        <div className="position-relative overflow-hidden" style={{ height: 220 }}>
          {product.image_url ? (
            <img src={product.image_url} alt={product.name}
              className="card-img-top h-100 w-100" style={{ objectFit: 'cover' }} />
          ) : (
            <div className="h-100 bg-light d-flex align-items-center justify-content-center">
              <i className="bi bi-image fs-1 text-muted opacity-25"></i>
            </div>
          )}
          {discount > 0 && (
            <span className="position-absolute top-0 start-0 m-2 badge bg-danger">-{discount}%</span>
          )}
          {product.is_featured && (
            <span className="position-absolute top-0 end-0 m-2 badge bg-warning text-dark">
              <i className="bi bi-star-fill me-1"></i>Featured
            </span>
          )}
        </div>
        <div className="card-body p-3">
          {product.category_name && (
            <div className="text-muted small mb-1">{product.category_name}</div>
          )}
          <h6 className="card-title mb-2 text-dark fw-semibold" style={{ fontSize: '0.95rem' }}>{product.name}</h6>
          <div className="d-flex align-items-center gap-2">
            {product.sale_price ? (
              <>
                <span className="fw-bold text-primary">${parseFloat(product.sale_price).toFixed(2)}</span>
                <del className="text-muted small">${parseFloat(product.price).toFixed(2)}</del>
              </>
            ) : (
              <span className="fw-bold text-dark">${parseFloat(product.price).toFixed(2)}</span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function Home() {
  const [featured, setFeatured]       = useState([]);
  const [arrivals, setArrivals]       = useState([]);
  const [categories, setCategories]   = useState([]);
  const [loading, setLoading]         = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/shop/featured').then(r => setFeatured(r.data.data)),
      api.get('/shop/new-arrivals').then(r => setArrivals(r.data.data)),
      api.get('/shop/categories').then(r => setCategories(r.data.data)),
    ]).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
        <div className="spinner-border text-primary" />
      </div>
    );
  }

  return (
    <div>
      {/* ── Hero Section ───────────────────────────────────────────── */}
      <section className="store-hero position-relative overflow-hidden">
        <div className="container position-relative py-5" style={{ zIndex: 2 }}>
          <div className="row align-items-center min-vh-50" style={{ minHeight: '420px' }}>
            <div className="col-lg-7">
              <span className="badge bg-primary bg-opacity-10 text-primary px-3 py-2 mb-3 fs-6 fw-normal">
                <i className="bi bi-lightning-fill me-1"></i>New Collection 2026
              </span>
              <h1 className="display-4 fw-bold mb-3 lh-sm">
                Discover Products<br />
                <span className="text-primary">You'll Love</span>
              </h1>
              <p className="lead text-muted mb-4" style={{ maxWidth: 480 }}>
                Explore our curated collection of high-quality products at unbeatable prices.
                From electronics to fashion, we've got you covered.
              </p>
              <div className="d-flex gap-3 flex-wrap">
                <Link to="/shop" className="btn btn-primary btn-lg px-4">
                  <i className="bi bi-bag me-2"></i>Shop Now
                </Link>
                <Link to="/shop?sort=newest" className="btn btn-outline-dark btn-lg px-4">
                  New Arrivals
                </Link>
              </div>

              {/* Stats */}
              <div className="d-flex gap-4 mt-5">
                <div>
                  <div className="fs-4 fw-bold text-primary">200+</div>
                  <div className="text-muted small">Products</div>
                </div>
                <div className="vr"></div>
                <div>
                  <div className="fs-4 fw-bold text-primary">50+</div>
                  <div className="text-muted small">Brands</div>
                </div>
                <div className="vr"></div>
                <div>
                  <div className="fs-4 fw-bold text-primary">1k+</div>
                  <div className="text-muted small">Happy Customers</div>
                </div>
              </div>
            </div>
            <div className="col-lg-5 d-none d-lg-flex justify-content-center">
              <div className="position-relative">
                <div className="hero-blob"></div>
                <i className="bi bi-bag-heart display-1 text-primary position-relative" style={{ fontSize: '12rem', opacity: 0.15 }}></i>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Categories Section ─────────────────────────────────────── */}
      {categories.length > 0 && (
        <section className="py-5 bg-light">
          <div className="container">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <div>
                <h3 className="fw-bold mb-1">Shop by Category</h3>
                <p className="text-muted mb-0">Browse our wide range of categories</p>
              </div>
              <Link to="/shop" className="btn btn-outline-primary btn-sm">View All</Link>
            </div>
            <div className="row g-3">
              {categories.filter(c => !c.parent_id).slice(0, 6).map(cat => (
                <div key={cat.id} className="col-6 col-md-4 col-lg-2">
                  <Link to={`/shop?category=${cat.id}`} className="text-decoration-none">
                    <div className="card store-card border-0 shadow-sm h-100 text-center">
                      <div className="card-body py-4">
                        {cat.image_url ? (
                          <img src={cat.image_url} alt={cat.name}
                            style={{ width: 56, height: 56, objectFit: 'cover', borderRadius: '50%' }}
                            className="mb-3" />
                        ) : (
                          <div className="mx-auto mb-3 d-flex align-items-center justify-content-center rounded-circle bg-primary bg-opacity-10"
                            style={{ width: 56, height: 56 }}>
                            <i className="bi bi-tag fs-4 text-primary"></i>
                          </div>
                        )}
                        <h6 className="fw-semibold text-dark mb-1 small">{cat.name}</h6>
                        <span className="text-muted" style={{ fontSize: 12 }}>{cat.product_count} items</span>
                      </div>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Featured Products ──────────────────────────────────────── */}
      {featured.length > 0 && (
        <section className="py-5">
          <div className="container">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <div>
                <h3 className="fw-bold mb-1">Featured Products</h3>
                <p className="text-muted mb-0">Hand-picked by our team</p>
              </div>
              <Link to="/shop" className="btn btn-outline-primary btn-sm">View All</Link>
            </div>
            <div className="row g-4">
              {featured.map(p => (
                <div key={p.id} className="col-6 col-md-4 col-lg-3">
                  <ProductCard product={p} />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Promo Banner ───────────────────────────────────────────── */}
      <section className="py-5 bg-primary text-white">
        <div className="container text-center">
          <div className="row justify-content-center">
            <div className="col-lg-8">
              <i className="bi bi-truck fs-1 mb-3 d-block"></i>
              <h3 className="fw-bold mb-3">Free Shipping on Orders Over $50</h3>
              <p className="mb-4 opacity-75">
                Enjoy free standard shipping on all orders above $50.
                Fast, reliable delivery right to your doorstep.
              </p>
              <Link to="/shop" className="btn btn-light btn-lg px-4">Start Shopping</Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── New Arrivals ───────────────────────────────────────────── */}
      {arrivals.length > 0 && (
        <section className="py-5">
          <div className="container">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <div>
                <h3 className="fw-bold mb-1">New Arrivals</h3>
                <p className="text-muted mb-0">Recently added to our store</p>
              </div>
              <Link to="/shop?sort=newest" className="btn btn-outline-primary btn-sm">View All</Link>
            </div>
            <div className="row g-4">
              {arrivals.map(p => (
                <div key={p.id} className="col-6 col-md-4 col-lg-3">
                  <ProductCard product={p} />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Trust Indicators ───────────────────────────────────────── */}
      <section className="py-5 bg-light">
        <div className="container">
          <div className="row g-4 text-center">
            {[
              { icon: 'bi-truck',         title: 'Fast Delivery',      desc: 'Free shipping over $50' },
              { icon: 'bi-shield-check',  title: 'Secure Payment',     desc: '100% protected checkout' },
              { icon: 'bi-arrow-repeat',  title: 'Easy Returns',       desc: '30-day return policy' },
              { icon: 'bi-headset',       title: '24/7 Support',       desc: 'Always here to help' },
            ].map((item, i) => (
              <div key={i} className="col-6 col-md-3">
                <div className="p-3">
                  <i className={`bi ${item.icon} fs-2 text-primary mb-2 d-block`}></i>
                  <h6 className="fw-semibold mb-1">{item.title}</h6>
                  <p className="text-muted small mb-0">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
