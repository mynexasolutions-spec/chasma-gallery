import { useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function ShippingPolicy() {
    useEffect(() => { window.scrollTo(0, 0); }, []);

    const sectionStyle = { marginBottom: '2.5rem' };
    const headingStyle = { color: '#d4af37', fontWeight: 600, letterSpacing: '0.5px', marginBottom: '1rem', fontSize: '1.2rem' };
    const textStyle = { color: 'rgba(255,255,255,0.75)', lineHeight: 1.9, fontSize: '0.95rem' };

    return (
        <div className="store-theme" style={{ background: '#050505', minHeight: '100vh', color: '#fff', paddingBottom: '5rem' }}>
            {/* Hero Banner */}
            <div className="position-relative py-5" style={{ background: 'linear-gradient(135deg, rgba(212,175,55,0.08) 0%, rgba(0,0,0,0.9) 50%, rgba(212,175,55,0.05) 100%)', borderBottom: '1px solid rgba(212,175,55,0.15)' }}>
                <div className="container py-4 text-center">
                    <div className="text-uppercase fw-bold mb-2" style={{ letterSpacing: '5px', fontSize: '0.75rem', color: '#d4af37' }}>Policies</div>
                    <h1 className="display-5 fw-light mb-3" style={{ letterSpacing: '2px' }}>Shipping & Delivery</h1>
                    <p className="text-muted mb-0" style={{ fontSize: '0.9rem' }}>Last updated: March 2026</p>
                </div>
            </div>

            <div className="container py-5" style={{ maxWidth: '850px' }}>
                <div className="card border-0 p-4 p-md-5 rounded-4 shadow-lg" style={{ background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.05) !important' }}>

                    <div style={sectionStyle}>
                        <p style={textStyle}>
                            At <strong className="text-white">Couture Jewellery</strong>, we take utmost care in packaging and delivering your precious pieces. Every order is insured and shipped in our signature luxury packaging.
                        </p>
                    </div>

                    <div style={sectionStyle}>
                        <h5 style={headingStyle}><i className="bi bi-truck me-2 opacity-75"></i>Shipping Options</h5>
                        <div className="table-responsive">
                            <table className="table table-dark table-borderless mb-0" style={{ background: 'transparent' }}>
                                <thead>
                                    <tr style={{ borderBottom: '1px solid rgba(212,175,55,0.2)' }}>
                                        <th className="text-gold py-3" style={{ fontWeight: 600, fontSize: '0.85rem', letterSpacing: '1px' }}>SHIPPING TYPE</th>
                                        <th className="text-gold py-3" style={{ fontWeight: 600, fontSize: '0.85rem', letterSpacing: '1px' }}>DELIVERY TIME</th>
                                        <th className="text-gold py-3" style={{ fontWeight: 600, fontSize: '0.85rem', letterSpacing: '1px' }}>COST</th>
                                    </tr>
                                </thead>
                                <tbody style={textStyle}>
                                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                        <td className="py-3">Standard Delivery</td>
                                        <td className="py-3">5–7 business days</td>
                                        <td className="py-3"><span className="text-gold fw-bold">FREE</span></td>
                                    </tr>
                                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                        <td className="py-3">Express Delivery</td>
                                        <td className="py-3">2–3 business days</td>
                                        <td className="py-3">Rs. 199</td>
                                    </tr>
                                    <tr>
                                        <td className="py-3">Same Day Delivery*</td>
                                        <td className="py-3">Within 24 hours</td>
                                        <td className="py-3">Rs. 499</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        <p className="text-muted mt-3 mb-0" style={{ fontSize: '0.8rem' }}>
                            *Same Day Delivery available in select metro cities only (Mumbai, Delhi, Bangalore, Chennai, Hyderabad). Orders must be placed before 12:00 PM.
                        </p>
                    </div>

                    <div style={sectionStyle}>
                        <h5 style={headingStyle}><i className="bi bi-geo-alt me-2 opacity-75"></i>Delivery Areas</h5>
                        <ul style={textStyle}>
                            <li className="mb-2"><strong className="text-white">Domestic:</strong> We deliver across all states and union territories of India via our trusted courier partners.</li>
                            <li className="mb-2"><strong className="text-white">International:</strong> Currently, we ship to select international destinations. Contact us for availability and shipping charges.</li>
                            <li className="mb-2">Some remote areas may have extended delivery timelines of up to 10–14 business days.</li>
                        </ul>
                    </div>

                    <div style={sectionStyle}>
                        <h5 style={headingStyle}><i className="bi bi-box-seam me-2 opacity-75"></i>Packaging</h5>
                        <p style={textStyle}>
                            Every Couture Jewellery piece is carefully packaged in our <strong className="text-white">signature luxury box</strong>, wrapped in velvet, and placed in a tamper-proof sealed package. Gift wrapping is available at no additional charge.
                        </p>
                    </div>

                    <div style={sectionStyle}>
                        <h5 style={headingStyle}><i className="bi bi-search me-2 opacity-75"></i>Order Tracking</h5>
                        <ul style={textStyle}>
                            <li className="mb-2">Once your order is shipped, you will receive a tracking number via email and SMS.</li>
                            <li className="mb-2">Track your order through our website by visiting <Link to="/dashboard" className="text-gold text-decoration-none">My Orders</Link> in your dashboard.</li>
                            <li className="mb-2">For any tracking issues, contact our support team with your order number.</li>
                        </ul>
                    </div>

                    <div style={sectionStyle}>
                        <h5 style={headingStyle}><i className="bi bi-shield-check me-2 opacity-75"></i>Insurance & Security</h5>
                        <p style={textStyle}>
                            All shipments are <strong className="text-white">fully insured</strong> against loss, theft, and damage during transit. In the unlikely event that your package is lost or damaged during shipping, we will provide a full replacement or refund at no cost to you.
                        </p>
                    </div>

                    <div style={sectionStyle}>
                        <h5 style={headingStyle}><i className="bi bi-exclamation-circle me-2 opacity-75"></i>Important Notes</h5>
                        <ul style={textStyle}>
                            <li className="mb-2">Delivery timelines are estimated and may vary due to unforeseen circumstances such as weather, holidays, or carrier delays.</li>
                            <li className="mb-2">Someone must be available at the delivery address to receive the package. Two delivery attempts will be made.</li>
                            <li className="mb-2">For Cash on Delivery orders, the exact order amount must be paid to the delivery partner.</li>
                            <li className="mb-2">We are not responsible for delays caused by incorrect or incomplete delivery addresses.</li>
                        </ul>
                    </div>

                    <div style={{ ...sectionStyle, marginBottom: 0 }}>
                        <h5 style={headingStyle}><i className="bi bi-envelope me-2 opacity-75"></i>Contact Us</h5>
                        <p style={textStyle}>For shipping inquiries:</p>
                        <div className="p-3 rounded-3" style={{ background: 'rgba(212,175,55,0.05)', border: '1px solid rgba(212,175,55,0.15)' }}>
                            <p className="mb-1 text-white fw-medium">Couture Jewellery</p>
                            <p className="mb-1" style={textStyle}><i className="bi bi-envelope me-2 text-gold"></i>support@couturejewellery.com</p>
                            <p className="mb-1" style={textStyle}><i className="bi bi-telephone me-2 text-gold"></i>+91 98765 43210</p>
                            <p className="mb-0" style={textStyle}><i className="bi bi-geo-alt me-2 text-gold"></i>123, Jewellers Lane, Mumbai, Maharashtra 400001, India</p>
                        </div>
                    </div>
                </div>

                <div className="text-center mt-5">
                    <Link to="/" className="btn rounded-pill px-4 py-2 text-uppercase fw-bold" style={{ background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.3)', color: '#d4af37', letterSpacing: '1px', fontSize: '0.85rem' }}>
                        <i className="bi bi-arrow-left me-2"></i>Back to Home
                    </Link>
                </div>
            </div>
        </div>
    );
}
