import { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../../services/api';
import { useCart } from '../../context/CartContext';

function ProductCard({ product }) {
  const { addToCart } = useCart();
  const [isWishlisted, setIsWishlisted] = useState(false);

  const discount = product.sale_price
    ? Math.round((1 - product.sale_price / product.price) * 100) : 0;

  // Mock rating data for aesthetic matching
  const rating = (4 + Math.random()).toFixed(1);
  const reviewCount = Math.floor(Math.random() * 500) + 100;

  return (
    <div className="store-card h-100 position-relative d-flex flex-column" style={{ background: 'transparent', border: 'none' }}>
      <Link to={`/shop/product/${product.id}`} className="text-decoration-none flex-grow-1 position-relative group">

        {/* Wishlist Icon */}
        <button
          className="position-absolute border-0 bg-transparent text-white opacity-75 hover-opacity-100 transition-all"
          style={{ top: '15px', right: '15px', zIndex: 10, fontSize: '1.2rem' }}
          onClick={(e) => { e.preventDefault(); setIsWishlisted(!isWishlisted); }}
        >
          <i className={`bi ${isWishlisted ? 'bi-heart-fill text-danger' : 'bi-heart'}`}></i>
        </button>

        {/* Bestseller Badge */}
        {product.is_featured && (
          <div className="position-absolute bg-gold text-white px-3 py-1 fw-bold"
            style={{
              top: '15px',
              left: '-5px',
              zIndex: 10,
              fontSize: '0.65rem',
              letterSpacing: '1px',
              boxShadow: '2px 2px 10px rgba(0,0,0,0.3)',
              clipPath: 'polygon(0 0, 100% 0, 90% 100%, 0 100%)'
            }}>
            BESTSELLER
          </div>
        )}

        {/* Image Container */}
        <div className="position-relative overflow-hidden mb-3 bg-light shadow-sm" style={{ aspectRatio: '1/1', borderRadius: '12px' }}>
          <img src="https://images.unsplash.com/photo-1605100804763-247f67b3557e?q=80&w=800&auto=format&fit=crop" alt={product.name}
            className="w-100 h-100 object-fit-cover transition-all" style={{ transitionDuration: '0.8s' }}
            onMouseOver={e => e.currentTarget.style.transform = 'scale(1.08)'}
            onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
          />

          {/* Quick Add overlay button on hover */}
          <div className="product-overlay position-absolute w-100 bottom-0 start-0 p-3 opacity-0 transition-all" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.5), transparent)' }}>
            <button className="btn btn-gold w-100 rounded-1 fw-bold text-uppercase py-2"
              style={{ fontSize: '0.7rem', letterSpacing: '1px' }}
              onClick={(e) => { e.preventDefault(); addToCart(product, 1); }}>
              Quick Add
            </button>
          </div>
        </div>

        {/* Text Content */}
        <div className="d-flex flex-column text-start">
          {/* Rating */}
          <div className="d-flex align-items-center gap-1 mb-1" style={{ fontSize: '0.65rem' }}>
            <span className="bg-light px-2 py-0.5 rounded text-dark fw-bold">{rating} <i className="bi bi-star-fill text-warning" style={{ fontSize: '0.6rem' }}></i></span>
            <span className="text-muted opacity-75">| {reviewCount}</span>
          </div>

          <h5 className="text-white-50 mb-1 fw-normal text-truncate" style={{ fontSize: '0.85rem', letterSpacing: '0.5px' }}>
            {product.name}
          </h5>

          <div className="d-flex align-items-center gap-2">
            {product.sale_price ? (
              <>
                <span className="fw-bold text-white" style={{ fontSize: '1rem' }}>
                  Rs. {parseFloat(product.sale_price).toLocaleString()}
                </span>
                <del className="text-muted small" style={{ fontSize: '0.75rem' }}>Rs. {parseFloat(product.price).toLocaleString()}</del>
                <span className="text-gold fw-bold" style={{ fontSize: '0.7rem' }}>{discount}% OFF</span>
              </>
            ) : (
              <span className="fw-bold text-white" style={{ fontSize: '1rem' }}>
                Rs. {parseFloat(product.price).toLocaleString()}
              </span>
            )}
          </div>
        </div>
      </Link>
    </div>
  );
}

export default function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);

  // Read filters from URL
  const search = searchParams.get('search') || '';
  const category = searchParams.get('category') || '';
  const brand = searchParams.get('brand') || '';
  const sort = searchParams.get('sort') || 'featured';
  const page = parseInt(searchParams.get('page') || '1');

  // Fetch filter options once
  useEffect(() => {
    api.get('/shop/categories').then(r => setCategories(r.data.data)).catch(() => { });
    api.get('/shop/brands').then(r => setBrands(r.data.data)).catch(() => { });
  }, []);

  // Fetch products when filters change
  const fetchProducts = useCallback(() => {
    setLoading(true);
    const params = { page, limit: 12, sort };
    if (search) params.search = search;
    if (category) params.category = category;
    if (brand) params.brand = brand;

    api.get('/shop/products', { params })
      .then(r => {
        setProducts(r.data.data);
        setPagination(r.data.pagination);
      })
      .catch(() => { })
      .finally(() => setLoading(false));
  }, [page, search, category, brand, sort]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  useEffect(() => {
    if (loading) return;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('show-reveal');
        }
      });
    }, { threshold: 0.1 });

    const selectors = ['.reveal-up', '.product-reveal'];
    selectors.forEach(sel => {
      document.querySelectorAll(sel).forEach(el => observer.observe(el));
    });

    return () => observer.disconnect();
  }, [loading, products]);

  // Helper to update URL params
  const setFilter = (key, value) => {
    const params = new URLSearchParams(searchParams);
    if (value) params.set(key, value);
    else params.delete(key);
    if (key !== 'page') params.delete('page');
    setSearchParams(params);
  };

  const clearFilters = () => setSearchParams({});
  const activeFilterCount = [category, brand, search].filter(Boolean).length;
  const activeCategoryName = categories.find(c => c.id === category)?.name || 'All Designs';

  return (
    <div className="store-theme min-vh-100" style={{ background: '#000', paddingBottom: '5rem' }}>

      {/* Dynamic Header Section - Image matched layout */}
      <div className="container" style={{ paddingTop: '100px' }}>
        <div className="row align-items-end mb-4 g-4">
          <div className="col-12 col-lg-8 text-start">
            <nav aria-label="breadcrumb" className="mb-2">
              <ol className="breadcrumb small text-uppercase m-0 p-0 mb-3" style={{ letterSpacing: '1px' }}>
                <li className="breadcrumb-item"><Link to="/" className="text-muted text-decoration-none">Home</Link></li>
                <li className="breadcrumb-item active text-gold" aria-current="page">{activeCategoryName}</li>
              </ol>
            </nav>
            <h1 className="text-white playfair mb-3" style={{ fontSize: '2.5rem', fontWeight: 600 }}>
              {activeCategoryName} <span className="text-muted h4 fw-light ms-2">({pagination?.total || 0} Designs)</span>
            </h1>
            <p className="text-light opacity-75 max-w-700" style={{ fontSize: '0.9rem', lineHeight: 1.6 }}>
              From the intricate details of handcrafted pendants to the minimalist allure of everyday rings,
              our collection celebrates every facet of your journey. Discover pieces that oscillate between
              timeless tradition and contemporary boldess.
            </p>
          </div>
        </div>

        {/* Refined Filter Row */}
        <div className="d-flex flex-wrap align-items-center justify-content-between gap-4 py-3 mb-5" style={{ borderTop: '1px solid rgba(255,255,255,0.1)', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <div className="d-flex flex-wrap align-items-center gap-4">
            <div className="dropdown filter-dropdown">
              <button className="btn btn-link text-white text-decoration-none p-0 d-flex align-items-center gap-2" data-bs-toggle="dropdown">
                Filter: Collection <i className="bi bi-chevron-down small text-gold"></i>
              </button>
              <ul className="dropdown-menu dropdown-menu-dark">
                <li><button className="dropdown-item" onClick={() => setFilter('category', '')}>All Collections</button></li>
                {categories.map(c => (
                  <li key={c.id}><button className="dropdown-item" onClick={() => setFilter('category', c.id)}>{c.name}</button></li>
                ))}
              </ul>
            </div>
            <div className="dropdown filter-dropdown">
              <button className="btn btn-link text-white text-decoration-none p-0 d-flex align-items-center gap-2" data-bs-toggle="dropdown">
                Style <i className="bi bi-chevron-down small text-gold"></i>
              </button>
              <ul className="dropdown-menu dropdown-menu-dark">
                <li><button className="dropdown-item" onClick={() => setFilter('brand', '')}>All Styles</button></li>
                {brands.map(b => (
                  <li key={b.id}><button className="dropdown-item" onClick={() => setFilter('brand', b.id)}>{b.name}</button></li>
                ))}
              </ul>
            </div>
            {activeFilterCount > 0 && (
              <button className="btn btn-sm text-gold-hover text-white opacity-50 border-0 p-0" onClick={clearFilters}>Reset Filters</button>
            )}
          </div>

          <div className="d-flex align-items-center gap-4 ml-auto">
            <div className="d-flex align-items-center gap-2">
              <span className="text-muted small text-uppercase" style={{ letterSpacing: '1px' }}>Sort by:</span>
              <select className="form-select border-0 bg-transparent text-white shadow-none cursor-pointer fw-bold p-0"
                style={{ width: 'auto', backgroundImage: 'none' }}
                value={sort} onChange={e => setFilter('sort', e.target.value)}>
                <option value="featured" className="text-dark">Featured</option>
                <option value="newest" className="text-dark">Newest</option>
                <option value="price_asc" className="text-dark">Price: Low to High</option>
                <option value="price_desc" className="text-dark">Price: High to Low</option>
              </select>
              <i className="bi bi-chevron-down small text-gold"></i>
            </div>
          </div>
        </div>

        {/* Product Grid */}
        <div className="row g-4 g-lg-5">
          {loading ? (
            <div className="text-center py-5 w-100">
              <div className="spinner-border text-gold" />
            </div>
          ) : products.length === 0 ? (
            <div className="col-12 py-5 text-center">
              <i className="bi bi-gem fs-1 text-gold d-block mb-3 opacity-25"></i>
              <h3 className="playfair text-white">No designs found</h3>
              <p className="text-muted">Try adjusting your filters to find your perfect piece.</p>
              <button className="btn btn-gold rounded-pill px-4 mt-3" onClick={clearFilters}>Clear All</button>
            </div>
          ) : (
            <>
              {products.map((p, i) => (
                <div key={p.id} className="col-12 col-sm-6 col-lg-3">
                  <div className="product-reveal" style={{ animationDelay: `${(i % 4) * 80}ms` }}>
                    <ProductCard product={p} />
                  </div>
                </div>
              ))}

              {/* Pagination */}
              {pagination && pagination.pages > 1 && (
                <div className="col-12 d-flex justify-content-center mt-5">
                  <div className="d-flex gap-2">
                    {Array.from({ length: pagination.pages }, (_, i) => (
                      <button key={i} className={`btn btn-sm rounded-0 ${page === i + 1 ? 'btn-gold' : 'btn-outline-gold'}`}
                        style={{ width: '40px', height: '40px' }}
                        onClick={() => setFilter('page', String(i + 1))}>
                        {i + 1}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <style>{`
        .max-w-700 { max-width: 700px; }
        .text-gold-hover:hover { color: #d4af37 !important; }
        .filter-dropdown .dropdown-item:hover { background: #d4af37; color: #000; }
        .group:hover .product-overlay { opacity: 1 !important; transform: translateY(-10px); }
        .product-reveal { opacity: 0; transform: translateY(20px); transition: all 0.6s cubic-bezier(0.2, 1, 0.3, 1); }
        .product-reveal.show-reveal { opacity: 1; transform: translateY(0); }
        .btn-gold { background: #d4af37; color: #000; border: none; transition: 0.3s; }
        .btn-gold:hover { background: #c5a030; box-shadow: 0 5px 15px rgba(212,175,55,0.3); }
        .btn-outline-gold { border: 1px solid #d4af37; color: #d4af37; background: transparent; transition: 0.3s; }
        .btn-outline-gold:hover { background: #d4af37; color: #000; }
      `}</style>
    </div>
  );
}
