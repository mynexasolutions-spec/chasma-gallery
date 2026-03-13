import { useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function AboutUs() {
    useEffect(() => { window.scrollTo(0, 0); }, []);

    const textStyle = { color: 'rgba(255,255,255,0.75)', lineHeight: 1.9, fontSize: '0.95rem' };

    return (
        <div className="store-theme" style={{ background: '#050505', minHeight: '100vh', color: '#fff', paddingBottom: '5rem' }}>
            {/* Hero Banner */}
            <div className="position-relative py-5" style={{ background: 'linear-gradient(135deg, rgba(212,175,55,0.08) 0%, rgba(0,0,0,0.9) 50%, rgba(212,175,55,0.05) 100%)', borderBottom: '1px solid rgba(212,175,55,0.15)', overflow: 'hidden' }}>
                <div className="container py-5 text-center position-relative" style={{ zIndex: 2 }}>
                    <div className="text-uppercase fw-bold mb-2" style={{ letterSpacing: '5px', fontSize: '0.75rem', color: '#d4af37' }}>Our Story</div>
                    <h1 className="display-4 fw-light mb-3" style={{ letterSpacing: '2px' }}>About Couture Jewellery</h1>
                    <p className="text-muted mb-0 mx-auto" style={{ fontSize: '1rem', maxWidth: '600px' }}>
                        Where timeless craftsmanship meets modern elegance
                    </p>
                </div>
            </div>

            <div className="container py-5">
                {/* Our Story Section */}
                <div className="row align-items-center g-5 mb-5 pb-5" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <div className="col-lg-6">
                        <div className="position-relative overflow-hidden rounded-4 shadow-lg" style={{ aspectRatio: '4/3' }}>
                            <img
                                src="https://images.unsplash.com/photo-1605100804763-247f67b3557e?q=80&w=1200&auto=format&fit=crop"
                                alt="Couture Jewellery Workshop"
                                className="w-100 h-100 object-fit-cover"
                            />
                            <div className="position-absolute bottom-0 start-0 w-100 p-4" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)' }}>
                                <span className="text-gold text-uppercase fw-bold" style={{ letterSpacing: '3px', fontSize: '0.75rem' }}>Since 2015</span>
                            </div>
                        </div>
                    </div>
                    <div className="col-lg-6">
                        <div className="text-gold text-uppercase fw-bold mb-3" style={{ letterSpacing: '4px', fontSize: '0.8rem' }}>Our Story</div>
                        <h2 className="display-6 fw-light text-white mb-4">Crafting Dreams Into Reality</h2>
                        <p style={textStyle}>
                            Founded with a passion for exceptional craftsmanship, <strong className="text-white">Couture Jewellery</strong> has been at the forefront of luxury jewellery design since 2015. What started as a small workshop in Mumbai has grown into a trusted name in fine jewellery, serving thousands of customers across India and beyond.
                        </p>
                        <p style={textStyle}>
                            Each piece in our collection is a testament to the dedication of our master artisans who blend traditional techniques with contemporary design. We believe that jewellery is not just an accessory — it's a story, an emotion, and a legacy passed down through generations.
                        </p>
                    </div>
                </div>

                {/* Values Section */}
                <div className="text-center mb-5">
                    <div className="text-gold text-uppercase fw-bold mb-3" style={{ letterSpacing: '4px', fontSize: '0.8rem' }}>What Drives Us</div>
                    <h2 className="display-6 fw-light text-white mb-5">Our Values</h2>
                </div>

                <div className="row g-4 mb-5 pb-5" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    {[
                        {
                            icon: 'bi-gem',
                            title: 'Uncompromising Quality',
                            desc: 'Every piece undergoes rigorous quality checks. We use only the finest metals, certified diamonds, and genuine gemstones sourced from trusted suppliers worldwide.'
                        },
                        {
                            icon: 'bi-hand-index-thumb',
                            title: 'Handcrafted Excellence',
                            desc: 'Our skilled artisans bring decades of experience to every piece, ensuring each creation is unique and crafted with precision and care.'
                        },
                        {
                            icon: 'bi-shield-check',
                            title: 'Trust & Transparency',
                            desc: 'We are ISO 9001:2015 certified and believe in complete transparency in our pricing, sourcing, and business practices.'
                        },
                        {
                            icon: 'bi-heart',
                            title: 'Customer First',
                            desc: 'From personalized consultations to hassle-free returns, we put our customers at the center of everything we do.'
                        },
                        {
                            icon: 'bi-recycle',
                            title: 'Sustainable Luxury',
                            desc: 'We are committed to ethical sourcing and sustainable practices, ensuring our jewellery is as responsible as it is beautiful.'
                        },
                        {
                            icon: 'bi-stars',
                            title: 'Innovation',
                            desc: 'We continuously push boundaries in design, blending traditional artistry with modern aesthetics to create pieces that transcend trends.'
                        }
                    ].map((value, i) => (
                        <div key={i} className="col-md-6 col-lg-4">
                            <div className="p-4 h-100 rounded-4 text-center" style={{ background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.05)', transition: 'all 0.3s ease' }}>
                                <div className="d-flex align-items-center justify-content-center mx-auto mb-3" style={{ width: 60, height: 60, borderRadius: '50%', background: 'rgba(212,175,55,0.08)', border: '1px solid rgba(212,175,55,0.2)' }}>
                                    <i className={`bi ${value.icon} fs-4`} style={{ color: '#d4af37' }}></i>
                                </div>
                                <h5 className="text-white fw-semibold mb-2" style={{ fontSize: '1.05rem' }}>{value.title}</h5>
                                <p className="mb-0" style={{ ...textStyle, fontSize: '0.88rem' }}>{value.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Numbers Section */}
                <div className="text-center mb-5">
                    <div className="text-gold text-uppercase fw-bold mb-3" style={{ letterSpacing: '4px', fontSize: '0.8rem' }}>By The Numbers</div>
                    <h2 className="display-6 fw-light text-white mb-5">Our Journey So Far</h2>
                </div>

                <div className="row g-4 mb-5 pb-5" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    {[
                        { number: '10+', label: 'Years of Excellence' },
                        { number: '50K+', label: 'Happy Customers' },
                        { number: '10,000+', label: 'Unique Designs' },
                        { number: '100+', label: 'Master Artisans' }
                    ].map((stat, i) => (
                        <div key={i} className="col-6 col-lg-3 text-center">
                            <div className="p-4 rounded-4" style={{ background: 'rgba(212,175,55,0.03)', border: '1px solid rgba(212,175,55,0.1)' }}>
                                <h2 className="fw-bold mb-1" style={{ color: '#d4af37', fontSize: '2.5rem' }}>{stat.number}</h2>
                                <p className="text-muted mb-0 text-uppercase" style={{ letterSpacing: '1px', fontSize: '0.78rem' }}>{stat.label}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Mission Statement */}
                <div className="text-center py-5">
                    <div className="mx-auto" style={{ maxWidth: '700px' }}>
                        <i className="bi bi-quote fs-1 d-block mb-3" style={{ color: '#d4af37', opacity: 0.5 }}></i>
                        <h3 className="fw-light text-white mb-4" style={{ lineHeight: 1.6, fontSize: '1.4rem' }}>
                            "Our mission is to make luxury jewellery accessible to everyone — pieces that celebrate your milestones, express your personality, and become cherished heirlooms for generations to come."
                        </h3>
                        <div className="bg-gold mx-auto mb-3" style={{ width: '50px', height: '2px' }}></div>
                        <p className="text-gold text-uppercase fw-bold" style={{ letterSpacing: '3px', fontSize: '0.8rem' }}>— The Couture Team</p>
                    </div>
                </div>

                <div className="text-center mt-4">
                    <Link to="/contact" className="btn rounded-pill px-5 py-3 text-uppercase fw-bold me-3" style={{ background: '#d4af37', color: '#000', letterSpacing: '1px', fontSize: '0.85rem' }}>
                        <i className="bi bi-chat-dots me-2"></i>Get In Touch
                    </Link>
                    <Link to="/shop" className="btn rounded-pill px-5 py-3 text-uppercase fw-bold" style={{ background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.3)', color: '#d4af37', letterSpacing: '1px', fontSize: '0.85rem' }}>
                        <i className="bi bi-gem me-2"></i>Shop Collection
                    </Link>
                </div>
            </div>
        </div>
    );
}
