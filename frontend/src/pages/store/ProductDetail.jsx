import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useCart } from '../../context/CartContext';

function StarRating({ rating, size = 16 }) {
  return (
    <span className="d-inline-flex gap-0">
      {[1, 2, 3, 4, 5].map(i => (
        <i key={i} className={`bi bi-star${i <= Math.round(rating) ? '-fill' : ''}`}
          style={{ fontSize: size, color: i <= Math.round(rating) ? '#d4af37' : 'rgba(255,255,255,0.1)' }} />
      ))}
    </span>
  );
}

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedVariation, setSelectedVariation] = useState(null);
  const [error, setError] = useState('');
  const [qty, setQty] = useState(1);
  const [pincode, setPincode] = useState('');
  const [isGift, setIsGift] = useState(false);
  const [openSection, setOpenSection] = useState('inspiration');

  useEffect(() => {
    setLoading(true);
    api.get(`/shop/products/${id}`)
      .then(r => { setProduct(r.data.data); setSelectedImage(0); })
      .catch(() => setError('Product not found'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="store-theme d-flex justify-content-center align-items-center" style={{ minHeight: '100vh', background: '#000' }}>
        <div className="spinner-border text-gold" />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="store-theme container py-5 text-center" style={{ minHeight: '60vh' }}>
        <i className="bi bi-exclamation-circle fs-1 text-gold d-block mb-3 opacity-25"></i>
        <h4 className="playfair text-white">Product not found</h4>
        <Link to="/shop" className="btn btn-outline-light rounded-pill mt-3 px-4">Back to Shop</Link>
      </div>
    );
  }

  const images = product.images || [];
  const discount = product.sale_price
    ? Math.round((1 - product.sale_price / product.price) * 100) : 0;

  const displayPrice = selectedVariation
    ? (selectedVariation.sale_price || selectedVariation.price)
    : (product.sale_price || product.price);
  const displayOriginal = selectedVariation
    ? (selectedVariation.sale_price ? selectedVariation.price : null)
    : (product.sale_price ? product.price : null);

  const handleAddToCart = () => {
    addToCart(product, qty);
  };

  const handleBuyNow = () => {
    addToCart(product, qty);
    navigate('/checkout');
  };

  return (
    <div className="store-theme" style={{ background: '#000', minHeight: '100vh', paddingBottom: '5rem' }}>

      {/* Upper Breadcrumb */}
      <div className="py-3" style={{ background: 'rgba(255,255,255,0.02)' }}>
        <div className="container">
          <nav aria-label="breadcrumb">
            <ol className="breadcrumb mb-0 small opacity-75">
              <li className="breadcrumb-item"><Link to="/" className="text-white text-decoration-none">Home</Link></li>
              <li className="breadcrumb-item text-white">Collection</li>
              <li className="breadcrumb-item active text-gold fw-bold">{product.name}</li>
            </ol>
          </nav>
        </div>
      </div>

      <div className="container py-5 mt-2">
        <div className="row g-5">
          {/* ── Left: Image Gallery ─────────────────────────────────── */}
          <div className="col-lg-7">
            <div className="row g-3">
              <div className="col-2 d-none d-md-block">
                <div className="d-flex flex-column gap-3">
                  {[0, 1, 2, 3].map((_, i) => (
                    <div key={i}
                      className={`thumbnail-luxury overflow-hidden cursor-pointer position-relative ${i === selectedImage ? 'active' : ''}`}
                      style={{
                        aspectRatio: '1/1',
                        borderRadius: '12px',
                        border: i === selectedImage ? '2px solid #d4af37' : '1px solid rgba(255,255,255,0.1)',
                      }}
                      onClick={() => setSelectedImage(i)}>
                      <img src="https://images.unsplash.com/photo-1605100804763-247f67b3557e?q=80&w=800&auto=format&fit=crop" className="w-100 h-100 object-fit-cover" alt="" />
                      {i === 3 && (
                        <div className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center bg-black bg-opacity-25">
                          <i className="bi bi-play-circle-fill text-white fs-4"></i>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              <div className="col-12 col-md-10">
                <div className="position-relative overflow-hidden rounded-4 shadow-2xl bg-dark"
                  style={{ aspectRatio: '1/1', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <img src="https://images.unsplash.com/photo-1605100804763-247f67b3557e?q=80&w=800&auto=format&fit=crop"
                    className="w-100 h-100 object-fit-cover transition-all" style={{ transitionDuration: '0.8s' }}
                    onMouseOver={e => e.currentTarget.style.transform = 'scale(1.1)'}
                    onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
                    alt=""
                  />
                  {discount > 0 && (
                    <span className="position-absolute top-0 end-0 m-4 badge bg-gold text-black fw-bold px-3 py-2 rounded-2 shadow">SALE</span>
                  )}
                  <div className="position-absolute bottom-0 start-0 m-4 shadow-sm bg-white bg-opacity-10 px-3 py-1 rounded-pill backdrop-blur">
                    <StarRating rating={product.avg_rating || 5} size={14} />
                    <span className="text-white small ms-2">| {product.review_count || 12}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ── Right: Product Details ──────────────────────────────────── */}
          <div className="col-lg-5">
            <div className="ps-lg-3">
              <h1 className="playfair display-6 fw-bold text-white mb-2">{product.name}</h1>
              <p className="text-white-50 mb-3" style={{ fontSize: '0.95rem' }}>Indulge in the Timeless Elegance of Couture</p>

              {/* Stock Indicator */}
              <div className="d-flex align-items-center gap-2 mb-4">
                <div className="dot animate-pulse" style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#ff4d4d' }}></div>
                <span className="text-danger small fw-bold text-uppercase" style={{ letterSpacing: '1px' }}>Low stock: Only 3 pieces left</span>
              </div>

              {/* Price Section */}
              <div className="mb-4">
                <div className="d-flex align-items-center gap-3">
                  <span className="h2 fw-bold text-white m-0">Rs. {parseFloat(displayPrice).toLocaleString()}</span>
                  {displayOriginal && (
                    <del className="h4 text-muted m-0">Rs. {parseFloat(displayOriginal).toLocaleString()}</del>
                  )}
                  <span className="badge bg-danger rounded-pill px-3 py-1" style={{ fontSize: '0.7rem' }}>SAVE {discount}%</span>
                </div>
                <p className="text-white-50 mt-1 small">Tax included. <Link to="/" className="text-gold text-decoration-none">Shipping</Link> calculated at checkout.</p>
              </div>

              {/* Delivery Checker */}
              <div className="p-4 rounded-4 mb-4" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <h6 className="text-white mb-3 fw-bold">Estimated Delivery Time</h6>
                <div className="d-flex gap-2">
                  <input
                    type="text"
                    className="form-control bg-transparent text-white border-white border-opacity-10 px-3 py-2"
                    placeholder="Enter 6 digit pincode"
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                    style={{ borderRadius: '8px' }}
                  />
                  <button className="btn btn-gold px-4 fw-bold" style={{ borderRadius: '8px' }}>Check</button>
                </div>
                <div className="d-flex flex-wrap gap-4 mt-4">
                  <div className="d-flex align-items-center gap-2">
                    <i className="bi bi-truck text-gold fs-5"></i>
                    <span className="small text-white-50">Easy 15 Day Return</span>
                  </div>
                  <div className="d-flex align-items-center gap-2">
                    <i className="bi bi-shield-check text-gold fs-5"></i>
                    <span className="small text-white-50">Lifetime Plating</span>
                  </div>
                  <div className="d-flex align-items-center gap-2">
                    <i className="bi bi-gem text-gold fs-5"></i>
                    <span className="small text-white-50">Fine 925 Silver</span>
                  </div>
                </div>
              </div>

              {/* Gift Option */}
              <div className="d-flex align-items-center gap-3 mb-4 p-3 rounded-3" style={{ border: '1px dashed rgba(212, 175, 55, 0.3)' }}>
                <div className="form-check m-0">
                  <input className="form-check-input shadow-none" type="checkbox" id="giftCheck" checked={isGift} onChange={() => setIsGift(!isGift)} />
                  <label className="form-check-label text-white small" htmlFor="giftCheck">
                    Is this a <span className="text-gold fw-bold">Gift?</span> 🎁 Wrap it for just <span className="fw-bold">₹50</span>
                  </label>
                </div>
              </div>

              {/* Variations */}
              {product.variations?.length > 0 && (
                <div className="mb-4">
                  <label className="text-white-50 small text-uppercase fw-bold mb-2">Choose Style</label>
                  <div className="d-flex flex-wrap gap-2">
                    {product.variations.map(v => (
                      <button key={v.id}
                        className={`btn btn-sm rounded-pill px-4 py-2 transition-all ${selectedVariation?.id === v.id ? 'bg-gold text-black border-gold' : 'btn-outline-light opacity-50'}`}
                        onClick={() => setSelectedVariation(v)}>
                        {v.attributes.map(a => a.value).join(' / ')}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* CTA Buttons */}
              <div className="d-flex flex-column gap-3">
                <div className="d-flex align-items-center gap-3">
                  <div className="d-flex align-items-center bg-transparent rounded-pill p-1" style={{ border: '1px solid #d4af37' }}>
                    <button className="btn btn-link text-gold p-0 px-3 fs-5 text-decoration-none shadow-none" onClick={() => setQty(Math.max(1, qty - 1))}>−</button>
                    <span className="px-1 fw-bold text-gold" style={{ minWidth: '20px' }}>{qty}</span>
                    <button className="btn btn-link text-gold p-0 px-3 fs-5 text-decoration-none shadow-none" onClick={() => setQty(qty + 1)}>+</button>
                  </div>
                  <button className="btn btn-gold flex-grow-1 py-3 px-4 rounded-pill fw-bold text-uppercase shadow-lg hover-scale"
                    style={{ letterSpacing: '1px' }}
                    onClick={handleAddToCart}>
                    Add To Cart
                  </button>
                </div>
                <button className="btn py-3 rounded-pill fw-bold text-uppercase shadow-sm w-100 hover-scale"
                  style={{ background: '#000', color: '#d4af37', border: '1px solid #d4af37', letterSpacing: '1px' }}
                  onClick={handleBuyNow}>
                  Buy It Now
                </button>
              </div>

              {/* Accordion Details */}
              <div className="mt-5 border-top border-white border-opacity-10">
                {/* 1. Inspiration */}
                <div className="border-bottom border-white border-opacity-10 py-2">
                  <button
                    className="btn w-100 text-start text-white d-flex justify-content-between align-items-center shadow-none py-3"
                    onClick={() => setOpenSection(openSection === 'inspiration' ? '' : 'inspiration')}
                  >
                    <span>The Inspiration</span>
                    <i className={`bi bi-chevron-${openSection === 'inspiration' ? 'up' : 'down'} text-gold`}></i>
                  </button>
                  {openSection === 'inspiration' && (
                    <div className="px-3 pb-3 text-white-50 small animate-fade-in">
                      Think of it as a gift from you to you. A masterpiece that says you deserve the best. Inspired by the floral gardens of the Riviera.
                    </div>
                  )}
                </div>

                {/* 2. Gems */}
                <div className="border-bottom border-white border-opacity-10 py-2">
                  <button
                    className="btn w-100 text-start text-white d-flex justify-content-between align-items-center shadow-none py-3"
                    onClick={() => setOpenSection(openSection === 'gems' ? '' : 'gems')}
                  >
                    <span>Gems & Materials</span>
                    <i className={`bi bi-chevron-${openSection === 'gems' ? 'up' : 'down'} text-gold`}></i>
                  </button>
                  {openSection === 'gems' && (
                    <div className="px-3 pb-3 text-white-50 small animate-fade-in">
                      Crafted with Pure 925 Silver, AAA+ Quality Zircons, and 18K Gold Plating for a lifetime of shine.
                    </div>
                  )}
                </div>

                {/* 3. Shipping */}
                <div className="border-bottom border-white border-opacity-10 py-2">
                  <button
                    className="btn w-100 text-start text-white d-flex justify-content-between align-items-center shadow-none py-3"
                    onClick={() => setOpenSection(openSection === 'shipping' ? '' : 'shipping')}
                  >
                    <span>Shipping & Returns</span>
                    <i className={`bi bi-chevron-${openSection === 'shipping' ? 'up' : 'down'} text-gold`}></i>
                  </button>
                  {openSection === 'shipping' && (
                    <div className="px-3 pb-3 text-white-50 small animate-fade-in">
                      Insured worldwide shipping within 5-7 business days. Easy returns and lifetime plating warranty included.
                    </div>
                  )}
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* ── Visual Section: The Inspiration ── */}
        <div className="mt-4 pt-4 reveal-up">
          <div className="rounded-4 p-4 text-center position-relative overflow-hidden"
            style={{
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(212, 175, 55, 0.1)'
            }}>
            <h2 className="playfair h3 text-gold mb-3">The Inspiration</h2>
            <p className="text-white mx-auto mb-0 opacity-75" style={{ maxWidth: '800px', lineHeight: 1.6, fontSize: '1rem', fontStyle: 'italic' }}>
              &quot;Every piece of jewellery tells a story. This creation, with its intricate floral motifs and brilliant zircons, is inspired by the first bloom of spring in the Italian Riviera—a symbol of new beginnings and eternal beauty.&quot;
            </p>
          </div>
        </div>

        {/* ── Related / Recently Viewed ── */}
        <div className="mt-4 pt-4 mb-4 border-top border-white border-opacity-10">
          <h4 className="playfair text-white text-center mb-4">Recently Viewed</h4>
          <div className="row g-4 overflow-auto pb-4 no-scrollbar flex-nowrap flex-md-wrap">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="col-9 col-sm-6 col-lg-3">
                <div className="position-relative group rounded-3 overflow-hidden bg-dark p-2" style={{ border: '1px solid rgba(255,255,255,0.05)' }}>
                  <img src="https://images.unsplash.com/photo-1601121141461-9d6647bca1ed?q=80&w=400&auto=format&fit=crop" className="w-100 h-100 object-fit-cover rounded-2" alt="" />
                  <div className="mt-3 px-2">
                    <h6 className="text-white-50 text-truncate small mb-1">Couture Silver Ring</h6>
                    <p className="text-white fw-bold small mb-0">Rs. 3,499.00</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      <style>{`
        .backdrop-blur { backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px); }
        .thumbnail-luxury.active { border: 2px solid #d4af37 !important; }
        .thumbnail-luxury:hover { transform: translateY(-2px); transition: 0.3s; }
        .animate-pulse { animation: pulse 2s infinite; }
        @keyframes pulse { 0% { opacity: 1; } 50% { opacity: 0.4; } 100% { opacity: 1; } }
        .animate-fade-in { animation: fadeIn 0.4s ease-out; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(-5px); } to { opacity: 1; transform: translateY(0); } }
        .hover-scale:hover { transform: scale(1.02); }
        .shadow-2xl { box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.7); }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .btn-gold { 
          background: #d4af37; 
          color: #000; 
          border: 1px solid #d4af37; 
        }
        .btn-gold:hover { 
          background: #b8962d; 
          border-color: #b8962d; 
          color: #000; 
        }
      `}</style>
    </div>
  );
}
