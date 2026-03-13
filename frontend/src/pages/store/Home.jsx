import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { useCart } from '../../context/CartContext';

function LuxuryProductCard({ product }) {
  const { addToCart } = useCart();
  const [isWishlisted, setIsWishlisted] = useState(false);
  const discount = product.sale_price
    ? Math.round((1 - product.sale_price / product.price) * 100)
    : 0;

  // Mock rating data for aesthetic matching
  const rating = (4 + Math.random()).toFixed(1);
  const reviewCount = Math.floor(Math.random() * 300) + 50;

  return (
    <div className="luxury-card h-100 position-relative">
      <Link to={`/shop/product/${product.id}`} className="text-decoration-none group d-block">

        {/* Wishlist Icon */}
        <button
          className="position-absolute border-0 bg-transparent text-white opacity-75 hover-opacity-100 transition-all shadow-sm"
          style={{ top: '10px', right: '10px', zIndex: 10, fontSize: '1.1rem' }}
          onClick={(e) => { e.preventDefault(); setIsWishlisted(!isWishlisted); }}
        >
          <i className={`bi ${isWishlisted ? 'bi-heart-fill text-danger' : 'bi-heart'}`}></i>
        </button>

        <div className="luxury-card-img rounded-1 overflow-hidden position-relative mb-3 bg-light shadow-sm" style={{ aspectRatio: '1/1' }}>
          <img src="https://images.unsplash.com/photo-1605100804763-247f67b3557e?q=80&w=800&auto=format&fit=crop" alt={product.name} className="w-100 h-100 object-fit-cover transition-all duration-700 group-hover:scale-105" />

          {/* Floating Pill Button Overlay */}
          <div className="product-overlay position-absolute bottom-0 start-0 w-100 d-flex justify-content-center pb-5 opacity-0 transition-all translate-y-2 group-hover:opacity-100 group-hover:translate-y-0"
            style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 100%)', zIndex: 10 }}>
            <button className="btn btn-gold rounded-pill fw-bold text-uppercase py-2 px-4 shadow-lg hover-scale"
              style={{ fontSize: '0.7rem', letterSpacing: '1px', width: '80%', border: '1px solid rgba(255,255,255,0.2)' }}
              onClick={(e) => { e.preventDefault(); addToCart(product, 1); }}>
              Quick Add
            </button>
          </div>
        </div>

        <div className="d-flex flex-column text-start">
          <div className="d-flex align-items-center gap-1 mb-1" style={{ fontSize: '0.6rem' }}>
            <span className="bg-light px-1 py-0.5 rounded text-dark fw-bold">{rating} <i className="bi bi-star-fill text-warning"></i></span>
            <span className="text-muted opacity-75">| {reviewCount}</span>
          </div>

          <h6 className="text-white-50 text-truncate mb-1 fw-normal" style={{ fontSize: '0.8rem' }}>
            {product.name}
          </h6>

          <div className="d-flex align-items-center gap-2" style={{ fontSize: '0.9rem' }}>
            {product.sale_price ? (
              <>
                <span className="text-white fw-bold">Rs. {parseFloat(product.sale_price).toLocaleString()}</span>
                <del className="text-muted small">Rs. {parseFloat(product.price).toLocaleString()}</del>
                <span className="text-gold fw-bold" style={{ fontSize: '0.65rem' }}>{discount}% OFF</span>
              </>
            ) : (
              <span className="text-white fw-bold">Rs. {parseFloat(product.price).toLocaleString()}</span>
            )}
          </div>
        </div>
      </Link>
    </div>
  );
}

export default function Home() {
  const [featured, setFeatured] = useState([]);
  const [arrivals, setArrivals] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/shop/featured').then(r => setFeatured(r.data.data)),
      api.get('/shop/new-arrivals').then(r => setArrivals(r.data.data)),
      api.get('/shop/categories').then(r => setCategories(r.data.data)),
    ]).catch(() => { }).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (loading) return;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('show-reveal');
        }
      });
    }, { threshold: 0.1 });

    const selectors = ['.reveal-up', '.reveal-left', '.reveal-right', '.reveal-zoom', '.reveal'];
    selectors.forEach(sel => {
      document.querySelectorAll(sel).forEach(el => observer.observe(el));
    });

    return () => observer.disconnect();
  }, [loading, featured, arrivals, categories]);

  if (loading) {
    return (
      <div className="store-theme d-flex justify-content-center align-items-center" style={{ minHeight: '100vh', background: '#000' }}>
        <div className="spinner-border text-gold" />
      </div>
    );
  }

  // Predefined luxury category images if not provided by DB
  const defaultCatImages = [
    "https://images.unsplash.com/photo-1605100804763-247f67b3557e?q=80&w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1599643478121-5a2190000742?q=80&w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?q=80&w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1573408302185-9127feed255e?q=80&w=800&auto=format&fit=crop"
  ];

  // Dynamically pad the categories to 8 so the horizontal scrolling UI is fully populated
  const displayCategories = categories.filter(c => !c.parent_id);
  const stubCategories = [
    { id: 'stub1', name: 'Diamond Rings', image_url: 'https://images.unsplash.com/photo-1582234034458-75038ecba1f8?q=80&w=800&auto=format&fit=crop' },
    { id: 'stub2', name: 'Fine Necklaces', image_url: 'https://images.unsplash.com/photo-1601121141461-9d6647bca1ed?q=80&w=800&auto=format&fit=crop' },
    { id: 'stub3', name: 'Luxury Watches', image_url: 'https://images.unsplash.com/photo-1524333892444-2103734a5d91?q=80&w=800&auto=format&fit=crop' },
    { id: 'stub4', name: 'Gold Bracelets', image_url: 'https://images.unsplash.com/photo-1515562141207-7a8ef6fc1fb8?q=80&w=800&auto=format&fit=crop' },
    { id: 'stub5', name: 'Bridal Sets', image_url: 'https://images.unsplash.com/photo-1596944210900-34a5ba8601f2?q=80&w=800&auto=format&fit=crop' }
  ];
  const finalCategories = displayCategories.length > 0 && displayCategories.length < 8
    ? [...displayCategories, ...stubCategories].slice(0, 8)
    : displayCategories;

  return (
    <div className="store-theme" style={{ background: '#000', minHeight: '100vh', overflowX: 'hidden' }}>

      {/* ── Hero Section ── */}
      <section className="hero-luxury position-relative d-flex align-items-center w-100">

        {/* Right Side Image Presenter */}
        <div className="hero-img-container position-absolute top-0 end-0 h-100 d-flex justify-content-end" style={{ zIndex: 0 }}>
          {/* Gradient mask to fade out the left edge of the image into the black background ensuring completely clear text reading */}
          <div className="position-absolute top-0 start-0 h-100 w-100 d-none d-lg-block" style={{ background: 'linear-gradient(to right, #050505 0%, transparent 40%)', zIndex: 1 }}></div>
          {/* Extra dark gradient for mobile */}
          <div className="position-absolute top-0 start-0 h-100 w-100 d-lg-none" style={{ background: 'linear-gradient(to right, rgba(5,5,5,0.95) 0%, rgba(5,5,5,0.6) 100%)', zIndex: 1 }}></div>
          {/* Bottom fade mask to blend smoothly into the next section */}
          <div className="position-absolute bottom-0 start-0 h-100 w-100" style={{ background: 'linear-gradient(to top, #000 0%, transparent 15%)', zIndex: 1 }}></div>

          <img
            src="https://images.unsplash.com/photo-1605100804763-247f67b3557e?q=80&w=2000&auto=format&fit=crop"
            alt="Luxury Jewellery Collection"
            className="h-100 w-100 object-fit-cover"
            style={{ objectPosition: 'center' }}
          />
        </div>

        {/* Content Container */}
        <div className="container-fluid px-4 px-md-5 position-relative" style={{ zIndex: 2 }}>
          <div className="row justify-content-start">
            <div className="col-12 col-md-8 col-lg-5 col-xl-4 ms-lg-5 mt-5 mt-lg-0">
              <div className="glass-panel text-center p-5 rounded-5 shadow-lg text-white position-relative overflow-hidden reveal-up delay-100" style={{ background: 'rgba(20, 20, 20, 0.4)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255, 255, 255, 0.08)' }}>

                {/* Subtle internal shine for luxury feel */}
                <div className="position-absolute top-0 start-0 w-100 h-100" style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, transparent 50%)', zIndex: 0, pointerEvents: 'none' }}></div>

                <div className="position-relative" style={{ zIndex: 1 }}>
                  <div className="text-uppercase fw-semibold" style={{ letterSpacing: '5px', fontSize: '0.95rem', marginTop: '0.5rem', color: '#e8c872' }}>
                    NEW COLLECTION
                  </div>

                  <hr className="bg-white opacity-100 mx-auto mt-3 mb-4" style={{ width: '45px', height: '2px', border: 'none', borderRadius: '2px' }} />

                  <h1 className="fw-regular mb-4" style={{ lineHeight: 0.9 }}>
                    <div style={{ fontSize: '3rem', letterSpacing: '1px' }}>TIMELESS</div>
                    <div className="fw-bold text-gold" style={{ fontSize: '4.8rem', letterSpacing: '-2px', margin: '14px 0', textShadow: '0 4px 20px rgba(0,0,0,0.5)' }}>JEWELS</div>
                    <div style={{ fontSize: '2.5rem', letterSpacing: '2px' }}>FOR YOU</div>
                  </h1>

                  <hr className="bg-white opacity-100 mx-auto mt-4 mb-3" style={{ width: '45px', height: '2px', border: 'none', borderRadius: '2px' }} />

                  <p className="text-light opacity-75 mb-4 text-uppercase align-items-center mx-auto" style={{ letterSpacing: '2px', fontSize: '0.75rem', maxWidth: '250px', lineHeight: 1.5 }}>
                    ELEGANCE CRAFTED TO <br /> PERFECTION.
                  </p>

                  <div className="d-flex justify-content-center pb-2">
                    <Link to="/shop" className="btn btn-outline-light rounded-pill text-decoration-none d-inline-block text-uppercase shadow-lg px-4 py-2" style={{ letterSpacing: '2px', fontSize: '0.8rem', transition: 'all 0.3s' }}>
                      Shop Collection
                    </Link>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Shop By Occasion (Image 3 Match) ── */}
      <section className="py-5 bg-black overflow-hidden" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="container-fluid px-4 px-md-5">
          <div className="mb-5 reveal-up text-center">
            <h2 className="text-white playfair display-5 mb-2">Shop By Occasion</h2>
            <p className="text-gold text-uppercase small" style={{ letterSpacing: '3px' }}>Exquisite Pieces for Every Moment</p>
          </div>

          <div className="horiz-scroll no-scrollbar pb-4">
            {[
              { title: 'Corporate Boss', img: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?q=80&w=800&auto=format&fit=crop', link: '/shop?category=corporate' },
              { title: 'Bridal Wear', img: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?q=80&w=800&auto=format&fit=crop', link: '/shop?category=bridal' },
              { title: 'Bridesmaids', img: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?q=80&w=800&auto=format&fit=crop', link: '/shop?category=bridesmaids' },
              { title: 'Goddess', img: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?q=80&w=800&auto=format&fit=crop', link: '/shop?category=goddess' },
              { title: 'Daily Boldness', img: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?q=80&w=800&auto=format&fit=crop', link: '/shop?category=daily' },
            ].map((occ, i) => (
              <div key={i} className="cat-scroll-item reveal-up" style={{ animationDelay: `${i * 100}ms`, width: '320px' }}>
                <Link to={occ.link} className="text-decoration-none group d-block position-relative overflow-hidden rounded-3 shadow-lg" style={{ aspectRatio: '3/4' }}>
                  <img src={occ.img} alt={occ.title} className="w-100 h-100 object-fit-cover transition-all duration-700 group-hover:scale-110" />
                  <div className="position-absolute bottom-0 start-0 w-100 p-4" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.9), transparent)' }}>
                    <h4 className="text-white fw-bold d-flex align-items-center gap-2 m-0" style={{ fontSize: '1.25rem', letterSpacing: '1px' }}>
                      {occ.title} <i className="bi bi-arrow-right text-gold transition-all group-hover:translate-x-2"></i>
                    </h4>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Shop By Category (Refined) ── */}
      {categories.length > 0 && (
        <section className="py-5 bg-black overflow-hidden">
          <div className="container-fluid px-4 px-md-5">
            <div className="text-center mb-5 reveal-up">
              <h2 className="text-white playfair display-6 mb-2">Our Collections</h2>
              <p className="text-gold text-uppercase small" style={{ letterSpacing: '3px' }}>Nothing Ordinary. All Bold.</p>
            </div>
          </div>

          <div className="horiz-scroll">
            {finalCategories.map((cat, i) => (
              <div key={cat.id} className={`cat-scroll-item reveal-left delay-${((i % 5) + 1) * 100}`}>
                <div className="d-flex flex-column align-items-start">
                  <Link to={`/shop?category=${cat.id}`} className="text-decoration-none w-100">
                    <div className="cat-blob mb-4 shadow-lg w-100">
                      <img src={"https://images.unsplash.com/photo-1605100804763-247f67b3557e?q=80&w=800&auto=format&fit=crop"} alt={cat.name} />
                      <div className="position-absolute bottom-0 start-0 w-100 p-3 pb-4" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.9), transparent)' }}>
                        <h4 className="text-white fw-bold text-uppercase m-0" style={{ letterSpacing: '2px' }}>{cat.name}</h4>
                      </div>
                    </div>
                  </Link>
                  <Link to={`/shop?category=${cat.id}`} className="text-white fw-semibold text-uppercase d-flex align-items-center gap-2" style={{ letterSpacing: '1px', fontSize: '0.9rem' }}>
                    {cat.name} <i className="bi bi-arrow-right text-gold"></i>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── New Launch: Cinematic Banner Slider ── */}
      <section className="py-5 bg-black overflow-hidden">
        <div className="container-fluid px-4 px-md-5">
          <div className="mb-5 reveal-up text-center">
            <h2 className="text-white playfair display-5 mb-2">New Launch</h2>
            <p className="text-gold text-uppercase small" style={{ letterSpacing: '3px' }}>A Premium Collection of Curated Products</p>
          </div>
        </div>

        <div className="horiz-scroll no-scrollbar pb-5 d-flex gap-4" style={{ paddingLeft: '5%', paddingRight: '5%' }}>
          {[
            {
              titleLeft: "Pearl-fectly",
              titleRight: "Silver",
              bannerImg: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?q=80&w=1200&auto=format&fit=crop",
              tag: "NEW",
              tagRight: "COLLECTION",
              productImages: [
                "https://images.unsplash.com/photo-1601121141461-9d6647bca1ed?q=80&w=400&auto=format&fit=crop",
                "https://images.unsplash.com/photo-1601121141461-9d6647bca1ed?q=80&w=400&auto=format&fit=crop",
                "https://images.unsplash.com/photo-1601121141461-9d6647bca1ed?q=80&w=400&auto=format&fit=crop"
              ]
            },
            {
              titleLeft: "Glow in",
              titleRight: "Motion",
              bannerImg: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?q=80&w=1200&auto=format&fit=crop",
              tag: "NEW",
              tagRight: "COLLECTION",
              productImages: [
                "https://images.unsplash.com/photo-1601121141461-9d6647bca1ed?q=80&w=400&auto=format&fit=crop",
                "https://images.unsplash.com/photo-1601121141461-9d6647bca1ed?q=80&w=400&auto=format&fit=crop",
                "https://images.unsplash.com/photo-1601121141461-9d6647bca1ed?q=80&w=400&auto=format&fit=crop"
              ]
            },
            {
              titleLeft: "Riviera",
              titleRight: "Dreams",
              bannerImg: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?q=80&w=1200&auto=format&fit=crop",
              tag: "NEW",
              tagRight: "COLLECTION",
              productImages: [
                "https://images.unsplash.com/photo-1601121141461-9d6647bca1ed?q=80&w=400&auto=format&fit=crop",
                "https://images.unsplash.com/photo-1601121141461-9d6647bca1ed?q=80&w=400&auto=format&fit=crop",
                "https://images.unsplash.com/photo-1601121141461-9d6647bca1ed?q=80&w=400&auto=format&fit=crop"
              ]
            },
            {
              titleLeft: "Golden",
              titleRight: "Hour",
              bannerImg: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?q=80&w=1200&auto=format&fit=crop",
              tag: "NEW",
              tagRight: "COLLECTION",
              productImages: [
                "https://images.unsplash.com/photo-1601121141461-9d6647bca1ed?q=80&w=400&auto=format&fit=crop",
                "https://images.unsplash.com/photo-1601121141461-9d6647bca1ed?q=80&w=400&auto=format&fit=crop",
                "https://images.unsplash.com/photo-1601121141461-9d6647bca1ed?q=80&w=400&auto=format&fit=crop"
              ]
            },
            {
              titleLeft: "Eternal",
              titleRight: "Shine",
              bannerImg: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?q=80&w=1200&auto=format&fit=crop",
              tag: "NEW",
              tagRight: "COLLECTION",
              productImages: [
                "https://images.unsplash.com/photo-1601121141461-9d6647bca1ed?q=80&w=400&auto=format&fit=crop",
                "https://images.unsplash.com/photo-1601121141461-9d6647bca1ed?q=80&w=400&auto=format&fit=crop",
                "https://images.unsplash.com/photo-1601121141461-9d6647bca1ed?q=80&w=400&auto=format&fit=crop"
              ]
            }
          ].map((item, i) => (
            <div key={i} className="new-launch-slide reveal-up" style={{ minWidth: '42%', position: 'relative', scrollSnapAlign: 'center', paddingBottom: '35px' }}>
              {/* Main Cinematic Banner */}
              <div className="position-relative overflow-hidden rounded-4 shadow-lg" style={{ height: '260px', background: '#111' }}>
                <img src={item.bannerImg} alt={`${item.titleLeft} ${item.titleRight}`}
                  className="new-launch-banner-img w-100 h-100 object-fit-cover"
                  style={{ filter: 'brightness(0.7)', transition: 'all 0.8s cubic-bezier(0.16, 1, 0.3, 1)' }} />

                {/* Dark gradient overlay */}
                <div className="position-absolute top-0 start-0 w-100 h-100"
                  style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.5) 100%)' }}></div>

                {/* Title text overlaid — split left/right */}
                <div className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-between px-3 px-md-4">
                  {/* Left side */}
                  <div className="text-start">
                    <h3 className="script-font text-white mb-0" style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.8rem)', lineHeight: 1, textShadow: '0 4px 20px rgba(0,0,0,0.6)' }}>
                      {item.titleLeft}
                    </h3>
                    <div className="text-white text-uppercase fw-bold mt-1" style={{ letterSpacing: '4px', fontSize: '0.55rem', opacity: 0.9 }}>
                      {item.tag}
                    </div>
                  </div>

                  {/* Right side */}
                  <div className="text-end">
                    <h3 className="script-font text-white mb-0" style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.8rem)', lineHeight: 1, textShadow: '0 4px 20px rgba(0,0,0,0.6)' }}>
                      {item.titleRight}
                    </h3>
                    <div className="text-white text-uppercase fw-bold mt-1" style={{ letterSpacing: '4px', fontSize: '0.55rem', opacity: 0.9 }}>
                      {item.tagRight}
                    </div>
                  </div>
                </div>
              </div>

              {/* Overlapping Product Cards */}
              <div className="d-flex gap-2 position-absolute start-50 translate-middle-x justify-content-center" style={{ bottom: '0px', width: '75%' }}>
                {item.productImages.map((img, idx) => (
                  <div key={idx}
                    className="new-launch-bottom-card rounded-3 shadow-lg overflow-hidden"
                    style={{
                      flex: '1 1 0',
                      maxWidth: '80px',
                      aspectRatio: '5/4',
                      background: '#111',
                      boxShadow: '0 6px 20px rgba(0,0,0,0.5)'
                    }}>
                    <img
                      src={img}
                      alt={`Product ${idx + 1}`}
                      className="w-100 h-100 object-fit-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Brand Video Showcase ── */}
      <section className="py-4 my-4 bg-black">
        <div className="container-fluid px-md-5">
          <div className="text-center mb-5 reveal-up">
            <h2 className="text-gold fw-bold text-uppercase" style={{ letterSpacing: '4px' }}>Couture Jewellery</h2>
          </div>

          <div className="row g-4 justify-content-center">
            {/* Video Card 1 */}
            <div className="col-12 col-md-4 reveal-up delay-100">
              <div className="video-card-container" style={{ cursor: 'pointer' }}>
                <div className="video-wrapper position-relative overflow-hidden mb-4 shadow" style={{ borderRadius: '1.2rem', aspectRatio: '4/5', transform: 'translateZ(0)' }}>
                  <iframe
                    src="https://www.youtube.com/embed/PBwE76MLWMY?autoplay=1&mute=1&loop=1&controls=0&showinfo=0&rel=0&playlist=PBwE76MLWMY&modestbranding=1&disablekb=1&playsinline=1"
                    frameBorder="0"
                    allow="autoplay; encrypted-media"
                    className="w-100 h-100 object-fit-cover"
                    title="Jewellery Short 1"
                    style={{ filter: 'brightness(0.85)', transform: 'scale(1.5)', pointerEvents: 'none' }}
                  />
                  <div className="position-absolute top-0 start-0 w-100 h-100 d-flex flex-column align-items-center justify-content-center" style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.1), rgba(0,0,0,0.4))' }}>
                    {/* Text overlay removed as requested */}
                  </div>
                </div>
                <div className="text-center px-3">
                  <h5 className="text-gold fw-bold text-uppercase mb-2" style={{ letterSpacing: '1px', fontSize: '0.95rem' }}>Master Craftsmanship</h5>
                  <p className="text-light opacity-75" style={{ fontSize: '0.85rem' }}>Each jewel is meticulously hand-set by our master craftsmen.</p>
                </div>
              </div>
            </div>

            {/* Video Card 2 */}
            <div className="col-12 col-md-4 reveal-up delay-300">
              <div className="video-card-container" style={{ cursor: 'pointer' }}>
                <div className="video-wrapper position-relative overflow-hidden mb-4 shadow" style={{ borderRadius: '1.2rem', aspectRatio: '4/5', transform: 'translateZ(0)' }}>
                  <iframe
                    src="https://www.youtube.com/embed/PBwE76MLWMY?autoplay=1&mute=1&loop=1&controls=0&showinfo=0&rel=0&playlist=PBwE76MLWMY&modestbranding=1&disablekb=1&playsinline=1"
                    frameBorder="0"
                    allow="autoplay; encrypted-media"
                    className="w-100 h-100 object-fit-cover"
                    title="Jewellery Short 2"
                    style={{ filter: 'brightness(0.85)', transform: 'scale(1.5)', pointerEvents: 'none' }}
                  />
                  <div className="position-absolute top-0 start-0 w-100 h-100 d-flex flex-column align-items-center justify-content-center" style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.1), rgba(0,0,0,0.4))' }}>
                    {/* Empty or subtle text can go here */}
                  </div>
                </div>
                <div className="text-center px-3">
                  <h5 className="text-gold fw-bold text-uppercase mb-2" style={{ letterSpacing: '1px', fontSize: '0.95rem' }}>Brilliant Diamonds</h5>
                  <p className="text-light opacity-75" style={{ fontSize: '0.85rem' }}>Only the most exceptional diamonds make it into our collections.</p>
                </div>
              </div>
            </div>

            {/* Video Card 3 */}
            <div className="col-12 col-md-4 reveal-up delay-500">
              <div className="video-card-container" style={{ cursor: 'pointer' }}>
                <div className="video-wrapper position-relative overflow-hidden mb-4 shadow" style={{ borderRadius: '1.2rem', aspectRatio: '4/5', transform: 'translateZ(0)' }}>
                  <iframe
                    src="https://www.youtube.com/embed/PBwE76MLWMY?autoplay=1&mute=1&loop=1&controls=0&showinfo=0&rel=0&playlist=PBwE76MLWMY&modestbranding=1&disablekb=1&playsinline=1"
                    frameBorder="0"
                    allow="autoplay; encrypted-media"
                    className="w-100 h-100 object-fit-cover"
                    title="Jewellery Short 3"
                    style={{ filter: 'brightness(0.85)', transform: 'scale(1.5)', pointerEvents: 'none' }}
                  />
                  <div className="position-absolute top-0 start-0 w-100 h-100 d-flex flex-column align-items-center justify-content-center" style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.1), rgba(0,0,0,0.4))' }}>
                    {/* Empty or subtle text can go here */}
                  </div>
                </div>
                <div className="text-center px-3">
                  <h5 className="text-gold fw-bold text-uppercase mb-2" style={{ letterSpacing: '1px', fontSize: '0.95rem' }}>Ethical Luxury</h5>
                  <p className="text-light opacity-75" style={{ fontSize: '0.85rem' }}>Sustainably sourced metals and stones for conscious elegance.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Handmade Is A Luxury Banner ── */}
      <section className="handmade-luxury-banner py-5 bg-black overflow-hidden">
        <div className="container-fluid p-0">
          <div className="row g-0 align-items-center">
            {/* Left Column: Image */}
            <div className="col-12 col-lg-6 reveal-left">
              <div className="position-relative overflow-hidden" style={{ minHeight: '600px', height: '100%' }}>
                <img
                  src="https://images.unsplash.com/photo-1605100804763-247f67b3557e?q=80&w=1500&auto=format&fit=crop"
                  alt="Luxury Diamond Ring"
                  className="w-100 h-100 object-fit-cover"
                  style={{ minHeight: '600px' }}
                />
              </div>
            </div>
            {/* Right Column: Text Content */}
            <div className="col-12 col-lg-6 p-5 reveal-right">
              <div className="ps-lg-5 text-center text-lg-start">
                <div className="text-gold text-uppercase fw-bold mb-3" style={{ letterSpacing: '4px', fontSize: '0.9rem' }}>
                  Nothing Ordinary.
                </div>
                <h2 className="display-4 fw-bold text-white mb-4" style={{ letterSpacing: '-1px', lineHeight: 1.1 }}>
                  HANDMADE IS <br />
                  <span className="text-gold">A LUXURY.</span>
                </h2>
                <p className="text-light opacity-75 mb-0" style={{ fontSize: '1.2rem', lineHeight: 1.8, maxWidth: '500px' }}>
                  Every piece of Couture Jewellery is delicately handcrafted by skilled artisans across the globe. Our jewellery reflects timeless beauty and thoughtful design. Experience the charm of human touch in every piece of art.
                </p>
                <div className="mt-5 d-flex justify-content-center justify-content-lg-start">
                  <div className="bg-gold" style={{ width: '80px', height: '3px' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Best Sellers ── */}
      {featured.length > 0 && (
        <section className="py-4 mb-4">
          <div className="px-3 text-center">
            <div className="mb-4 reveal-up">
              <h2 className="text-white fw-bold mb-2">Best Seller</h2>
              <p className="text-white opacity-75" style={{ fontSize: '0.95rem' }}>Loved by more than 1000+ customers!</p>
            </div>
          </div>

          <div className="horiz-scroll">
            {featured.map((p, i) => (
              <div key={p.id} className={`product-scroll-item reveal-zoom delay-${((i % 5) + 1) * 100}`}>
                <LuxuryProductCard product={p} />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── Diagonal Trust Banner ── */}
      <section className="position-relative overflow-hidden mt-4 mb-5 reveal" style={{ minHeight: '220px', display: 'flex', alignItems: 'center' }}>
        {/* Black Left Background */}
        <div className="position-absolute top-0 start-0 w-100 h-100" style={{ backgroundColor: '#0a0a0a', zIndex: 0 }}></div>

        {/* Slanted Gold Right Background */}
        <div className="diagonal-trust-bg shadow-lg"></div>

        <div className="container-fluid position-relative py-5" style={{ zIndex: 2 }}>
          <div className="row align-items-center h-100">

            {/* Left Content */}
            <div className="col-12 col-md-4 text-center text-md-end pe-md-5 mb-5 mb-md-0 reveal-left delay-100" style={{ zIndex: 2 }}>
              <div className="fw-bold d-inline-block text-start" style={{
                fontFamily: '"Impact", "Arial Black", sans-serif',
                fontSize: 'clamp(2.5rem, 4vw, 3.5rem)',
                lineHeight: 0.9,
                letterSpacing: '1px',
                color: '#e8c872',
                textShadow: '0 5px 15px rgba(0,0,0,0.5)'
              }}>
                FREE SHIPPING<br />WORLDWIDE
              </div>
            </div>

            {/* Right Content */}
            <div className="col-12 col-md-8 ps-md-4 reveal-right delay-300" style={{ zIndex: 2 }}>
              <div className="d-flex flex-column flex-md-row align-items-center justify-content-center justify-content-md-start gap-4 gap-md-5">

                {/* Custom ISO Badge */}
                <div className="diagonal-trust-badge position-relative shadow-lg d-flex flex-column align-items-center justify-content-center flex-shrink-0" style={{
                  width: '160px', height: '160px',
                  backgroundColor: '#1a1a1a',
                  border: '6px solid #e8c872',
                  borderRadius: '50%',
                  zIndex: 10,
                  outline: '2px solid #1a1a1a',
                  outlineOffset: '-7px'
                }}>
                  {/* Outer Dashed ring */}
                  <div className="position-absolute w-100 h-100 rounded-circle" style={{ border: '2px dashed rgba(232,200,114,0.5)', transform: 'scale(0.88)' }}></div>

                  {/* Ribbons */}
                  <div className="position-absolute shadow-sm" style={{ bottom: '-20px', left: '15px', width: '35px', height: '50px', backgroundColor: '#1a1a1a', clipPath: 'polygon(0 0, 100% 0, 100% 100%, 50% 80%, 0 100%)', zIndex: -1, transform: 'rotate(30deg)' }}></div>
                  <div className="position-absolute shadow-sm" style={{ bottom: '-20px', right: '15px', width: '35px', height: '50px', backgroundColor: '#1a1a1a', clipPath: 'polygon(0 0, 100% 0, 100% 100%, 50% 80%, 0 100%)', zIndex: -1, transform: 'rotate(-30deg)' }}></div>

                  {/* Inner Content */}
                  <div className="text-gold text-center position-relative mt-2" style={{ zIndex: 2 }}>
                    <div style={{ fontSize: '0.62rem', letterSpacing: '2px', fontFamily: '"Arial", sans-serif', color: '#e8c872' }}>INTERNATIONAL</div>
                    <i className="bi bi-globe2 fs-3 my-1 d-block opacity-75" style={{ color: '#e8c872' }}></i>
                    <div className="bg-dark px-2 rounded-1 fw-bold" style={{ color: '#e8c872', fontSize: '1.2rem', fontFamily: '"Impact", sans-serif', letterSpacing: '1px', border: '1px solid rgba(232,200,114,0.4)', transform: 'scale(1.1)' }}>ISO 9001</div>
                    <div className="mt-2 text-dark d-inline-block fw-bold" style={{ fontSize: '0.6rem', letterSpacing: '2px', backgroundColor: '#e8c872', padding: '2px 8px', borderRadius: '20px' }}>CERTIFIED</div>
                  </div>
                </div>

                {/* Typography Block */}
                <div className="text-center text-md-start" style={{ textShadow: '0px 0px 10px rgba(0,0,0,0.5)' }}>
                  <h3 className="fw-bold m-0 text-white" style={{
                    fontFamily: '"Impact", "Arial Black", sans-serif',
                    fontSize: 'clamp(2rem, 4vw, 3rem)',
                    letterSpacing: '2px',
                    lineHeight: 1
                  }}>WE ARE</h3>
                  <h1 className="fw-bold m-0" style={{
                    fontFamily: '"Playfair Display", "Georgia", serif',
                    fontSize: 'clamp(3rem, 7vw, 6rem)',
                    color: '#e8c872',
                    lineHeight: 0.9,
                    letterSpacing: '-2px',
                    textShadow: '0 4px 15px rgba(232, 200, 114, 0.4)'
                  }}>ISO 9001:2015</h1>
                  <h5 className="fw-bold m-0 mt-2 text-uppercase d-inline-block px-1 text-white" style={{
                    fontFamily: '"Impact", "Arial Black", sans-serif',
                    letterSpacing: '1px',
                    fontSize: 'clamp(0.9rem, 2vw, 1.3rem)'
                  }}>CERTIFIED TRUSTED COMPANY</h5>
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── Customer Stories Section ── */}
      <section className="py-5 bg-black">
        <div className="container py-4">
          <div className="text-center mb-5 reveal-up">
            <h2 className="text-white playfair display-5 mb-2">Customer Stories</h2>
            <p className="text-gold text-uppercase small" style={{ letterSpacing: '3px' }}>Voices of Elegance</p>
          </div>

          <div className="row g-4 mt-2">
            {[
              {
                name: 'Virda',
                quote: "A big shout out to you guys for improving my hubby's gifting tastes. Completely in love with my ring!",
                img: 'https://images.unsplash.com/photo-1601121141461-9d6647bca1ed?q=80&w=400&auto=format&fit=crop'
              },
              {
                name: 'Harshika',
                quote: "Never thought buying jewellery would be this easy, thanks for helping make my mom's birthday special.",
                img: 'https://images.unsplash.com/photo-1601121141461-9d6647bca1ed?q=80&w=400&auto=format&fit=crop'
              },
              {
                name: 'Priya',
                quote: "Gifted these earrings to my sister on her wedding and she loved them! I am obsessed with buying gifts from GIVA.",
                img: 'https://images.unsplash.com/photo-1601121141461-9d6647bca1ed?q=80&w=400&auto=format&fit=crop'
              }
            ].map((story, i) => (
              <div key={i} className={`col-12 col-md-4 reveal-up delay-${(i + 1) * 200}`}>
                <div
                  className="position-relative py-3 px-3 text-center h-100 d-flex flex-column align-items-center justify-content-center"
                  style={{
                    backgroundColor: '#FFE9BA',
                    borderRadius: '12px',
                    color: '#000',
                    marginBottom: '40px',
                    minHeight: '170px'
                  }}
                >
                  <h4 className="fw-bold mb-2">{story.name}</h4>
                  <p className="opacity-75 mb-0" style={{ fontSize: '0.95rem', lineHeight: 1.5, maxWidth: '280px' }}>
                    {story.quote}
                  </p>

                  {/* Floating Circle Image Container */}
                  <div
                    className="position-absolute start-50 translate-middle-x"
                    style={{
                      bottom: '-40px',
                      width: '80px',
                      height: '80px',
                      borderRadius: '50%',
                      overflow: 'hidden',
                      border: '4px solid #000',
                      boxShadow: '0 10px 20px rgba(0,0,0,0.2)'
                    }}
                  >
                    <img src={story.img} alt={story.name} className="w-100 h-100 object-fit-cover" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}
