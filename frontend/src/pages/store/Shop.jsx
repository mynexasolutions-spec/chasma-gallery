import { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../../services/api';
import { useCart } from '../../context/CartContext';

function ProductCard({ product }) {
  const { addToCart } = useCart();
  const discount = product.sale_price
    ? Math.round((1 - product.sale_price / product.price) * 100) : 0;

  return (
    <div className="card store-card h-100 position-relative">
      <Link to={`/shop/product/${product.id}`} className="text-decoration-none text-dark flex-grow-1 d-flex flex-column">
        <div className="store-card-img-wrapper" style={{ height: 260 }}>
          {product.image_url ? (
            <img src={product.image_url} alt={product.name}
              className="card-img-top h-100 w-100" style={{ objectFit: 'cover' }} />
          ) : (
            <div className="h-100 bg-light d-flex align-items-center justify-content-center">
              <i className="bi bi-image fs-1 text-muted opacity-25"></i>
            </div>
          )}
          {discount > 0 && (
            <span className="position-absolute top-0 start-0 m-3 badge badge-premium badge-discount shadow">-{discount}% OFF</span>
          )}
        </div>
        <div className="card-body p-4 d-flex flex-column flex-grow-1">
          {product.category_name && (
            <div className="text-primary fw-semibold mb-2" style={{ fontSize: '0.75rem', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
              {product.category_name}
            </div>
          )}
          <h5 className="card-title mb-3 fw-bold flex-grow-1" style={{ fontSize: '1.1rem', lineHeight: '1.4' }}>
            {product.name}
          </h5>
          <div className="d-flex align-items-center justify-content-between mt-auto">
            <div className="d-flex align-items-center gap-2">
              {product.sale_price ? (
                <>
                  <span className="fw-bold fs-5 text-dark">${parseFloat(product.sale_price).toFixed(2)}</span>
                  <del className="text-muted small">${parseFloat(product.price).toFixed(2)}</del>
                </>
              ) : (
                <span className="fw-bold fs-5 text-dark">${parseFloat(product.price).toFixed(2)}</span>
              )}
            </div>
            <span className={`badge rounded-pill ${product.stock_status === 'in_stock' ? 'bg-success bg-opacity-10 text-success' : product.stock_status === 'backorder' ? 'bg-warning bg-opacity-10 text-warning' : 'bg-secondary bg-opacity-10 text-secondary'}`}
              style={{ fontSize: 11, padding: '0.4rem 0.6rem' }}>
              {product.stock_status === 'in_stock' ? 'In Stock' : product.stock_status === 'backorder' ? 'Backorder' : 'Out of Stock'}
            </span>
          </div>
        </div>
      </Link>

      {/* Quick Add Overlay */}
      <div className="add-to-cart-overlay text-center pb-3">
        <button
          className="btn add-cart-btn w-100 rounded-pill shadow-sm"
          onClick={(e) => {
            e.preventDefault();
            addToCart(product, 1);
          }}
          disabled={product.stock_status === 'out_of_stock'}
        >
          <i className="bi bi-cart-plus me-2"></i>
          {product.stock_status === 'out_of_stock' ? 'Out of Stock' : 'Add to Cart'}
        </button>
      </div>
    </div>
  );
}

export default function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [priceRange, setPriceRange] = useState({ min_price: 0, max_price: 1000 });
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtersOpen, setFiltersOpen] = useState(false);

  // Read filters from URL
  const search = searchParams.get('search') || '';
  const category = searchParams.get('category') || '';
  const brand = searchParams.get('brand') || '';
  const minPrice = searchParams.get('min_price') || '';
  const maxPrice = searchParams.get('max_price') || '';
  const sort = searchParams.get('sort') || 'newest';
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
    if (minPrice) params.min_price = minPrice;
    if (maxPrice) params.max_price = maxPrice;

    api.get('/shop/products', { params })
      .then(r => {
        setProducts(r.data.data);
        setPagination(r.data.pagination);
        if (r.data.priceRange) setPriceRange(r.data.priceRange);
      })
      .catch(() => { })
      .finally(() => setLoading(false));
  }, [page, search, category, brand, minPrice, maxPrice, sort]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  // Helper to update URL params
  const setFilter = (key, value) => {
    const params = new URLSearchParams(searchParams);
    if (value) params.set(key, value);
    else params.delete(key);
    if (key !== 'page') params.delete('page');
    setSearchParams(params);
  };

  const clearFilters = () => setSearchParams({});

  const activeFilterCount = [category, brand, minPrice, maxPrice, search].filter(Boolean).length;

  return (
    <div className="bg-light min-vh-100 pb-5">
      {/* Breadcrumb */}
      <div className="shop-header-bg py-4 mb-4">
        <div className="container position-relative" style={{ zIndex: 1 }}>
          <h2 className="fw-bold mb-2">Shop Collection</h2>
          <nav aria-label="breadcrumb">
            <ol className="breadcrumb mb-0">
              <li className="breadcrumb-item"><Link to="/" className="text-decoration-none text-muted">Home</Link></li>
              <li className="breadcrumb-item active fw-semibold text-dark">Shop</li>
            </ol>
          </nav>
        </div>
      </div>

      <div className="container">
        <div className="row g-5">

          {/* ── Sidebar Filters (Desktop) ─────────────────────────── */}
          <div className="col-lg-3">
            {/* Mobile toggle */}
            <button className="btn btn-outline-dark w-100 d-lg-none mb-4 rounded-pill fw-semibold"
              onClick={() => setFiltersOpen(!filtersOpen)}>
              <i className="bi bi-funnel me-2"></i>Filters
              {activeFilterCount > 0 && <span className="badge bg-primary ms-2">{activeFilterCount}</span>}
            </button>

            <div className={`${filtersOpen ? '' : 'd-none'} d-lg-block sticky-top`}>
              <div className="card filter-card border-0 shadow-sm mb-4">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h6 className="fw-bold mb-0">Filters</h6>
                    {activeFilterCount > 0 && (
                      <button className="btn btn-link btn-sm text-danger p-0" onClick={clearFilters}>
                        Clear All
                      </button>
                    )}
                  </div>

                  {/* Search */}
                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Search</label>
                    <div className="input-group input-group-sm">
                      <input className="form-control" placeholder="Search products..."
                        value={search} onChange={e => setFilter('search', e.target.value)} />
                      {search && (
                        <button className="btn btn-outline-secondary" onClick={() => setFilter('search', '')}>
                          <i className="bi bi-x"></i>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Category filter */}
                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Category</label>
                    <select className="form-select form-select-sm" value={category}
                      onChange={e => setFilter('category', e.target.value)}>
                      <option value="">All Categories</option>
                      {categories.map(c => (
                        <option key={c.id} value={c.id}>{c.name} ({c.product_count})</option>
                      ))}
                    </select>
                  </div>

                  {/* Brand filter */}
                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Brand</label>
                    <select className="form-select form-select-sm" value={brand}
                      onChange={e => setFilter('brand', e.target.value)}>
                      <option value="">All Brands</option>
                      {brands.map(b => (
                        <option key={b.id} value={b.id}>{b.name} ({b.product_count})</option>
                      ))}
                    </select>
                  </div>

                  {/* Price range */}
                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Price Range</label>
                    <div className="row g-2">
                      <div className="col-6">
                        <input type="number" className="form-control form-control-sm"
                          placeholder={`Min ($${priceRange.min_price || 0})`}
                          value={minPrice}
                          onChange={e => setFilter('min_price', e.target.value)} />
                      </div>
                      <div className="col-6">
                        <input type="number" className="form-control form-control-sm"
                          placeholder={`Max ($${priceRange.max_price || 0})`}
                          value={maxPrice}
                          onChange={e => setFilter('max_price', e.target.value)} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ── Product Grid ──────────────────────────────────────── */}
          <div className="col-lg-9">
            {/* Toolbar */}
            <div className="card filter-card border-0 shadow-sm mb-4">
              <div className="card-body py-2">
                <div className="d-flex flex-wrap justify-content-between align-items-center gap-2">
                  <div className="text-muted small">
                    {pagination
                      ? <>{pagination.total} product{pagination.total !== 1 ? 's' : ''} found</>
                      : 'Loading...'}
                  </div>
                  <div className="d-flex align-items-center gap-2">
                    <label className="small text-muted">Sort:</label>
                    <select className="form-select form-select-sm" style={{ width: 'auto' }}
                      value={sort} onChange={e => setFilter('sort', e.target.value)}>
                      <option value="newest">Newest</option>
                      <option value="price_asc">Price: Low to High</option>
                      <option value="price_desc">Price: High to Low</option>
                      <option value="name_asc">Name: A to Z</option>
                      <option value="name_desc">Name: Z to A</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Active filter tags */}
            {activeFilterCount > 0 && (
              <div className="d-flex flex-wrap gap-2 mb-3">
                {search && (
                  <span className="badge bg-primary bg-opacity-10 text-primary d-flex align-items-center gap-1">
                    Search: "{search}"
                    <button className="btn-close btn-close-sm ms-1" style={{ fontSize: 8 }}
                      onClick={() => setFilter('search', '')}></button>
                  </span>
                )}
                {category && (
                  <span className="badge bg-primary bg-opacity-10 text-primary d-flex align-items-center gap-1">
                    {categories.find(c => c.id === category)?.name || 'Category'}
                    <button className="btn-close btn-close-sm ms-1" style={{ fontSize: 8 }}
                      onClick={() => setFilter('category', '')}></button>
                  </span>
                )}
                {brand && (
                  <span className="badge bg-primary bg-opacity-10 text-primary d-flex align-items-center gap-1">
                    {brands.find(b => b.id === brand)?.name || 'Brand'}
                    <button className="btn-close btn-close-sm ms-1" style={{ fontSize: 8 }}
                      onClick={() => setFilter('brand', '')}></button>
                  </span>
                )}
                {(minPrice || maxPrice) && (
                  <span className="badge bg-primary bg-opacity-10 text-primary d-flex align-items-center gap-1">
                    ${minPrice || '0'} – ${maxPrice || '∞'}
                    <button className="btn-close btn-close-sm ms-1" style={{ fontSize: 8 }}
                      onClick={() => { setFilter('min_price', ''); setFilter('max_price', ''); }}></button>
                  </span>
                )}
              </div>
            )}

            {/* Products Grid */}
            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary" />
              </div>
            ) : products.length === 0 ? (
              <div className="card border-0 shadow-sm">
                <div className="card-body text-center py-5">
                  <i className="bi bi-search fs-1 text-muted d-block mb-3 opacity-25"></i>
                  <h5 className="fw-semibold">No products found</h5>
                  <p className="text-muted">Try adjusting your filters or search terms.</p>
                  <button className="btn btn-outline-primary btn-sm" onClick={clearFilters}>
                    Clear All Filters
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="row g-4">
                  {products.map(p => (
                    <div key={p.id} className="col-12 col-md-6 col-xl-4">
                      <ProductCard product={p} />
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {pagination && pagination.pages > 1 && (
                  <nav className="mt-4 d-flex justify-content-center">
                    <ul className="pagination pagination-sm">
                      <li className={`page-item ${page <= 1 ? 'disabled' : ''}`}>
                        <button className="page-link" onClick={() => setFilter('page', String(page - 1))}>
                          <i className="bi bi-chevron-left"></i>
                        </button>
                      </li>
                      {Array.from({ length: pagination.pages }, (_, i) => i + 1)
                        .filter(p => p === 1 || p === pagination.pages || Math.abs(p - page) <= 2)
                        .reduce((acc, p, i, arr) => {
                          if (i > 0 && p - arr[i - 1] > 1) acc.push('...');
                          acc.push(p);
                          return acc;
                        }, [])
                        .map((p, i) =>
                          p === '...' ? (
                            <li key={`e${i}`} className="page-item disabled"><span className="page-link">...</span></li>
                          ) : (
                            <li key={p} className={`page-item ${p === page ? 'active' : ''}`}>
                              <button className="page-link" onClick={() => setFilter('page', String(p))}>{p}</button>
                            </li>
                          )
                        )}
                      <li className={`page-item ${page >= pagination.pages ? 'disabled' : ''}`}>
                        <button className="page-link" onClick={() => setFilter('page', String(page + 1))}>
                          <i className="bi bi-chevron-right"></i>
                        </button>
                      </li>
                    </ul>
                  </nav>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
