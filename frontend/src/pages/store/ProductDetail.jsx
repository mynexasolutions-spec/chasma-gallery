import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../services/api';

function StarRating({ rating, size = 16 }) {
  return (
    <span className="d-inline-flex gap-0">
      {[1, 2, 3, 4, 5].map(i => (
        <i key={i} className={`bi bi-star${i <= Math.round(rating) ? '-fill' : ''}`}
          style={{ fontSize: size, color: i <= Math.round(rating) ? '#f59e0b' : '#d1d5db' }} />
      ))}
    </span>
  );
}

export default function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct]       = useState(null);
  const [loading, setLoading]       = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedVariation, setSelectedVariation] = useState(null);
  const [error, setError]           = useState('');

  useEffect(() => {
    setLoading(true);
    api.get(`/shop/products/${id}`)
      .then(r => { setProduct(r.data.data); setSelectedImage(0); })
      .catch(() => setError('Product not found'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
        <div className="spinner-border text-primary" />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="container py-5 text-center">
        <i className="bi bi-exclamation-circle fs-1 text-muted d-block mb-3"></i>
        <h4>Product not found</h4>
        <Link to="/shop" className="btn btn-primary mt-3">Back to Shop</Link>
      </div>
    );
  }

  const images = product.images || [];
  const currentImage = images[selectedImage];
  const discount = product.sale_price
    ? Math.round((1 - product.sale_price / product.price) * 100) : 0;

  const displayPrice = selectedVariation
    ? (selectedVariation.sale_price || selectedVariation.price)
    : (product.sale_price || product.price);
  const displayOriginal = selectedVariation
    ? (selectedVariation.sale_price ? selectedVariation.price : null)
    : (product.sale_price ? product.price : null);

  return (
    <div className="bg-light min-vh-100">
      {/* Breadcrumb */}
      <div className="bg-white border-bottom py-3">
        <div className="container">
          <nav aria-label="breadcrumb">
            <ol className="breadcrumb mb-0 small">
              <li className="breadcrumb-item"><Link to="/" className="text-decoration-none">Home</Link></li>
              <li className="breadcrumb-item"><Link to="/shop" className="text-decoration-none">Shop</Link></li>
              {product.category_name && (
                <li className="breadcrumb-item">
                  <Link to={`/shop?category=${product.category_id}`} className="text-decoration-none">
                    {product.category_name}
                  </Link>
                </li>
              )}
              <li className="breadcrumb-item active">{product.name}</li>
            </ol>
          </nav>
        </div>
      </div>

      <div className="container py-4">
        <div className="card border-0 shadow-sm">
          <div className="card-body p-4">
            <div className="row g-4">
              {/* ── Image Gallery ─────────────────────────────────── */}
              <div className="col-lg-6">
                <div className="position-relative rounded overflow-hidden bg-light mb-3"
                  style={{ height: 420, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {currentImage ? (
                    <img src={currentImage.file_url} alt={currentImage.alt_text || product.name}
                      className="w-100 h-100" style={{ objectFit: 'contain' }} />
                  ) : (
                    <div className="text-center">
                      <i className="bi bi-image display-1 text-muted opacity-25"></i>
                      <p className="text-muted mt-2">No image available</p>
                    </div>
                  )}
                  {discount > 0 && (
                    <span className="position-absolute top-0 start-0 m-3 badge bg-danger fs-6">-{discount}%</span>
                  )}
                </div>
                {images.length > 1 && (
                  <div className="d-flex gap-2 overflow-auto pb-2">
                    {images.map((img, i) => (
                      <button key={img.id}
                        className={`btn p-0 border rounded overflow-hidden flex-shrink-0
                          ${i === selectedImage ? 'border-primary border-2' : 'border-light'}`}
                        style={{ width: 72, height: 72 }}
                        onClick={() => setSelectedImage(i)}>
                        <img src={img.file_url} alt="" className="w-100 h-100" style={{ objectFit: 'cover' }} />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* ── Product Info ──────────────────────────────────── */}
              <div className="col-lg-6">
                <div className="d-flex align-items-center gap-2 mb-2">
                  {product.category_name && (
                    <Link to={`/shop?category=${product.category_id}`}
                      className="badge bg-primary bg-opacity-10 text-primary text-decoration-none">
                      {product.category_name}
                    </Link>
                  )}
                  {product.brand_name && (
                    <Link to={`/shop?brand=${product.brand_id}`}
                      className="badge bg-dark bg-opacity-10 text-dark text-decoration-none">
                      {product.brand_name}
                    </Link>
                  )}
                </div>

                <h2 className="fw-bold mb-2">{product.name}</h2>

                {/* Rating */}
                {product.review_count > 0 && (
                  <div className="d-flex align-items-center gap-2 mb-3">
                    <StarRating rating={product.avg_rating} />
                    <span className="fw-semibold">{product.avg_rating}</span>
                    <span className="text-muted small">({product.review_count} review{product.review_count !== 1 ? 's' : ''})</span>
                  </div>
                )}

                {/* Price */}
                <div className="d-flex align-items-baseline gap-2 mb-3">
                  <span className="fs-3 fw-bold text-primary">${parseFloat(displayPrice).toFixed(2)}</span>
                  {displayOriginal && (
                    <del className="fs-5 text-muted">${parseFloat(displayOriginal).toFixed(2)}</del>
                  )}
                  {discount > 0 && !selectedVariation && (
                    <span className="badge bg-danger">Save {discount}%</span>
                  )}
                </div>

                {/* Stock status */}
                <div className="mb-3">
                  <span className={`badge ${
                    product.stock_status === 'in_stock' ? 'bg-success' :
                    product.stock_status === 'backorder' ? 'bg-warning text-dark' : 'bg-secondary'
                  } px-3 py-2`}>
                    <i className={`bi ${product.stock_status === 'in_stock' ? 'bi-check-circle' : 'bi-clock'} me-1`}></i>
                    {product.stock_status === 'in_stock' ? 'In Stock' :
                     product.stock_status === 'backorder' ? 'Available on Backorder' : 'Out of Stock'}
                  </span>
                  {product.stock_quantity > 0 && product.stock_quantity <= 10 && (
                    <span className="text-danger small ms-2">Only {product.stock_quantity} left!</span>
                  )}
                </div>

                {/* Short description */}
                {product.short_description && (
                  <p className="text-muted mb-4">{product.short_description}</p>
                )}

                {/* Variations */}
                {product.variations && product.variations.length > 0 && (
                  <div className="mb-4">
                    <h6 className="fw-semibold mb-2">Variations</h6>
                    <div className="d-flex flex-wrap gap-2">
                      {product.variations.map(v => (
                        <button key={v.id}
                          className={`btn btn-sm ${selectedVariation?.id === v.id ? 'btn-primary' : 'btn-outline-secondary'}`}
                          onClick={() => setSelectedVariation(selectedVariation?.id === v.id ? null : v)}>
                          {v.attributes.map(a => a.value).join(' / ') || v.sku}
                          {v.sale_price
                            ? <span className="ms-1">${parseFloat(v.sale_price).toFixed(2)}</span>
                            : <span className="ms-1">${parseFloat(v.price).toFixed(2)}</span>}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* SKU and meta */}
                <div className="border-top pt-3 mt-3">
                  <div className="row small text-muted">
                    <div className="col-auto"><strong>SKU:</strong> {product.sku}</div>
                    <div className="col-auto"><strong>Type:</strong> {product.type}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Full Description ────────────────────────────────────── */}
        {product.description && (
          <div className="card border-0 shadow-sm mt-4">
            <div className="card-body p-4">
              <h5 className="fw-bold mb-3">Description</h5>
              <div className="text-muted" style={{ whiteSpace: 'pre-line' }}>{product.description}</div>
            </div>
          </div>
        )}

        {/* ── Reviews ─────────────────────────────────────────────── */}
        <div className="card border-0 shadow-sm mt-4">
          <div className="card-body p-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h5 className="fw-bold mb-0">
                Customer Reviews
                {product.review_count > 0 && (
                  <span className="text-muted fw-normal fs-6 ms-2">({product.review_count})</span>
                )}
              </h5>
              {product.review_count > 0 && (
                <div className="d-flex align-items-center gap-2">
                  <StarRating rating={product.avg_rating} size={20} />
                  <span className="fs-5 fw-bold">{product.avg_rating}</span>
                </div>
              )}
            </div>

            {product.reviews && product.reviews.length > 0 ? (
              <div className="d-flex flex-column gap-3">
                {product.reviews.map(review => (
                  <div key={review.id} className="border rounded p-3">
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <div>
                        <div className="fw-semibold">{review.first_name} {review.last_name?.[0]}.</div>
                        <StarRating rating={review.rating} size={14} />
                      </div>
                      <span className="text-muted small">
                        {new Date(review.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    {review.title && <div className="fw-semibold mb-1">{review.title}</div>}
                    {review.comment && <p className="text-muted mb-0 small">{review.comment}</p>}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 text-muted">
                <i className="bi bi-chat-dots fs-3 d-block mb-2 opacity-25"></i>
                <p className="mb-0">No reviews yet. Be the first to review this product!</p>
              </div>
            )}
          </div>
        </div>

        {/* Back link */}
        <div className="mt-4 mb-3">
          <Link to="/shop" className="btn btn-outline-secondary">
            <i className="bi bi-arrow-left me-1"></i>Back to Shop
          </Link>
        </div>
      </div>
    </div>
  );
}
