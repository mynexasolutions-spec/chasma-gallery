import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';

export default function Navbar() {
  const { pathname } = useLocation();
  const { user } = useAuth();
  const { getCartCount, setIsCartOpen } = useCart();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => { setMobileOpen(false); }, [pathname]);

  const navLinks = [
    { label: 'Shop', to: '/shop' },
    { label: 'Collections', to: '/shop?sort=featured' },
    { label: 'About', to: '/about' },
    { label: 'Contact', to: '/contact' },
  ];

  const linkStyle = {
    whiteSpace: 'nowrap',
    fontSize: scrolled ? '0.82rem' : '0.88rem',
    fontWeight: '500',
    letterSpacing: '1.5px',
    textTransform: 'uppercase',
    transition: 'all 0.4s ease',
    position: 'relative',
    padding: '4px 0',
  };

  return (
    <>
      {/* Spacer to prevent content jump */}
      <div style={{ height: scrolled ? '70px' : '90px', transition: 'height 0.5s ease' }}></div>

      {/* ── Floating Navbar ── */}
      <div
        className="fixed-top w-100 d-flex justify-content-center"
        style={{
          zIndex: 1030,
          pointerEvents: 'none',
          top: scrolled ? '8px' : '16px',
          transition: 'all 0.5s cubic-bezier(0.25, 1, 0.5, 1)',
          padding: '0 16px'
        }}
      >
        <nav
          style={{
            pointerEvents: 'auto',
            borderRadius: scrolled ? '20px' : '24px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            width: '100%',
            maxWidth: '1400px',
            padding: scrolled ? '0 28px' : '0 36px',
            height: scrolled ? '56px' : '68px',
            display: 'flex',
            alignItems: 'center',
            background: scrolled
              ? 'rgba(8, 8, 8, 0.85)'
              : 'rgba(10, 10, 10, 0.55)',
            backdropFilter: 'blur(24px) saturate(180%)',
            WebkitBackdropFilter: 'blur(24px) saturate(180%)',
            boxShadow: scrolled
              ? '0 8px 32px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.06)'
              : '0 12px 48px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.08)',
            transition: 'all 0.6s cubic-bezier(0.25, 1, 0.5, 1)',
          }}
        >
          {/* ── Logo (Left) ── */}
          <Link to="/" className="text-decoration-none d-flex flex-column align-items-center flex-shrink-0" style={{ marginRight: 'auto' }}>
            <div
              className="fw-bold"
              style={{
                fontFamily: "'Playfair Display', serif",
                letterSpacing: scrolled ? '2px' : '3px',
                lineHeight: '1',
                fontSize: scrolled ? '1.35rem' : '1.6rem',
                color: '#d4af37',
                transition: 'all 0.5s ease',
                textShadow: '0 2px 10px rgba(212,175,55,0.2)',
              }}
            >
              COUTURE
            </div>
            <div
              style={{
                fontSize: scrolled ? '0.42rem' : '0.5rem',
                letterSpacing: scrolled ? '3.5px' : '5px',
                color: 'rgba(212, 175, 55, 0.65)',
                fontWeight: '400',
                transition: 'all 0.5s ease',
                marginTop: '1px',
              }}
            >
              JEWELLERY
            </div>
          </Link>

          {/* ── Center Nav Links (Desktop) ── */}
          <div className="d-none d-lg-flex align-items-center justify-content-center" style={{ gap: scrolled ? '28px' : '36px', position: 'absolute', left: '50%', transform: 'translateX(-50%)' }}>
            {navLinks.map(link => (
              <Link
                key={link.to}
                to={link.to}
                className="nav-link-pro text-decoration-none"
                style={{
                  ...linkStyle,
                  color: pathname === link.to || (link.to !== '/' && pathname.startsWith(link.to.split('?')[0]))
                    ? '#d4af37'
                    : 'rgba(255,255,255,0.7)',
                }}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* ── Right Section (Search + Icons) ── */}
          <div className="d-flex align-items-center gap-3" style={{ marginLeft: 'auto' }}>

            {/* Search Bar (Desktop) */}
            <div className="position-relative d-none d-xl-flex align-items-center">
              <style>{`
                .nav-search-pro::placeholder { color: rgba(255,255,255,0.35); }
                .nav-search-pro:focus { border-color: rgba(212,175,55,0.4) !important; background: rgba(255,255,255,0.08) !important; }
                .nav-link-pro { position: relative; }
                .nav-link-pro::after {
                  content: '';
                  position: absolute;
                  bottom: -2px;
                  left: 50%;
                  transform: translateX(-50%);
                  width: 0;
                  height: 1.5px;
                  background: linear-gradient(90deg, transparent, #d4af37, transparent);
                  transition: width 0.4s cubic-bezier(0.16, 1, 0.3, 1);
                }
                .nav-link-pro:hover { color: #d4af37 !important; }
                .nav-link-pro:hover::after { width: 100%; }
                .nav-icon-btn { 
                  width: 36px; height: 36px; 
                  border-radius: 50%; 
                  display: flex; align-items: center; justify-content: center;
                  background: transparent;
                  border: 1px solid transparent;
                  color: rgba(255,255,255,0.7);
                  transition: all 0.3s ease;
                  cursor: pointer;
                  text-decoration: none;
                  position: relative;
                }
                .nav-icon-btn:hover { 
                  background: rgba(212,175,55,0.1); 
                  border-color: rgba(212,175,55,0.2);
                  color: #d4af37;
                  transform: translateY(-1px);
                }
              `}</style>
              <i className="bi bi-search position-absolute" style={{ left: '13px', fontSize: '0.75rem', color: 'rgba(255,255,255,0.35)', pointerEvents: 'none' }}></i>
              <input
                type="text"
                placeholder="Search..."
                className="form-control border-0 text-white nav-search-pro"
                style={{
                  borderRadius: '12px',
                  background: 'rgba(255,255,255,0.05)',
                  fontSize: '0.78rem',
                  padding: '7px 14px 7px 34px',
                  border: '1px solid rgba(255,255,255,0.08)',
                  transition: 'all 0.3s ease',
                  outline: 'none',
                  width: '160px',
                  letterSpacing: '0.3px',
                  boxShadow: 'none',
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && e.target.value.trim()) {
                    window.location.href = `/shop?search=${encodeURIComponent(e.target.value.trim())}`;
                  }
                }}
              />
            </div>

            {/* Divider */}
            <div className="d-none d-xl-block" style={{ width: '1px', height: '20px', background: 'rgba(255,255,255,0.1)' }}></div>

            {/* Search icon (tablet) */}
            <Link to="/shop" className="nav-icon-btn d-xl-none">
              <i className="bi bi-search" style={{ fontSize: '1rem' }}></i>
            </Link>

            {/* User Icon */}
            {user ? (
              <Link to={user.role === 'admin' || user.role === 'manager' ? "/admin" : "/dashboard"} className="nav-icon-btn">
                <i className="bi bi-person-check" style={{ fontSize: '1.15rem' }}></i>
              </Link>
            ) : (
              <Link to="/login" className="nav-icon-btn">
                <i className="bi bi-person" style={{ fontSize: '1.15rem' }}></i>
              </Link>
            )}

            {/* Cart Icon */}
            <button
              className="nav-icon-btn"
              onClick={() => setIsCartOpen(true)}
              style={{ border: 'none' }}
            >
              <i className="bi bi-bag" style={{ fontSize: '1.05rem' }}></i>
              {getCartCount() > 0 && (
                <span
                  className="position-absolute d-flex align-items-center justify-content-center"
                  style={{
                    top: '-3px',
                    right: '-3px',
                    width: '18px',
                    height: '18px',
                    borderRadius: '50%',
                    background: '#d4af37',
                    color: '#000',
                    fontSize: '0.65rem',
                    fontWeight: '700',
                    border: '2px solid rgba(10,10,10,0.9)',
                  }}
                >
                  {getCartCount()}
                </span>
              )}
            </button>

            {/* Mobile Menu Toggle */}
            <button
              className="nav-icon-btn d-lg-none"
              onClick={() => setMobileOpen(!mobileOpen)}
              style={{ border: 'none' }}
            >
              <i className={`bi ${mobileOpen ? 'bi-x-lg' : 'bi-list'}`} style={{ fontSize: '1.2rem' }}></i>
            </button>
          </div>
        </nav>

        {/* ── Mobile Menu Drawer ── */}
        {mobileOpen && (
          <div
            className="d-lg-none position-fixed"
            style={{
              top: scrolled ? '72px' : '92px',
              left: '50%',
              transform: 'translateX(-50%)',
              width: 'calc(100% - 32px)',
              maxWidth: '1400px',
              background: 'rgba(10, 10, 10, 0.95)',
              backdropFilter: 'blur(24px)',
              WebkitBackdropFilter: 'blur(24px)',
              borderRadius: '16px',
              border: '1px solid rgba(255,255,255,0.08)',
              padding: '20px 24px',
              zIndex: 1029,
              pointerEvents: 'auto',
              boxShadow: '0 16px 48px rgba(0,0,0,0.5)',
              animation: 'mobileMenuIn 0.3s ease forwards',
            }}
          >
            <style>{`
              @keyframes mobileMenuIn {
                from { opacity: 0; transform: translateX(-50%) translateY(-10px); }
                to { opacity: 1; transform: translateX(-50%) translateY(0); }
              }
            `}</style>
            <div className="d-flex flex-column gap-1">
              {navLinks.map(link => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="text-decoration-none py-2 px-3 rounded-3"
                  style={{
                    color: pathname === link.to ? '#d4af37' : 'rgba(255,255,255,0.7)',
                    fontSize: '0.9rem',
                    fontWeight: '500',
                    letterSpacing: '1.5px',
                    textTransform: 'uppercase',
                    transition: 'all 0.2s ease',
                    background: pathname === link.to ? 'rgba(212,175,55,0.08)' : 'transparent',
                  }}
                  onClick={() => setMobileOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
            </div>
            {/* Mobile Search */}
            <div className="position-relative mt-3 pt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
              <i className="bi bi-search position-absolute" style={{ left: '14px', top: '50%', transform: 'translateY(-20%)', fontSize: '0.8rem', color: 'rgba(255,255,255,0.35)' }}></i>
              <input
                type="text"
                placeholder="Search jewellery..."
                className="form-control border-0 text-white nav-search-pro w-100"
                style={{
                  borderRadius: '12px',
                  background: 'rgba(255,255,255,0.05)',
                  fontSize: '0.85rem',
                  padding: '10px 16px 10px 38px',
                  border: '1px solid rgba(255,255,255,0.08)',
                  outline: 'none',
                  boxShadow: 'none',
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && e.target.value.trim()) {
                    window.location.href = `/shop?search=${encodeURIComponent(e.target.value.trim())}`;
                    setMobileOpen(false);
                  }
                }}
              />
            </div>
          </div>
        )}
      </div>
    </>
  );
}
