import { useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function TermsConditions() {
    useEffect(() => { window.scrollTo(0, 0); }, []);

    const sectionStyle = { marginBottom: '2.5rem' };
    const headingStyle = { color: '#d4af37', fontWeight: 600, letterSpacing: '0.5px', marginBottom: '1rem', fontSize: '1.2rem' };
    const textStyle = { color: 'rgba(255,255,255,0.75)', lineHeight: 1.9, fontSize: '0.95rem' };

    return (
        <div className="store-theme" style={{ background: '#050505', minHeight: '100vh', color: '#fff', paddingBottom: '5rem' }}>
            {/* Hero Banner */}
            <div className="position-relative py-5" style={{ background: 'linear-gradient(135deg, rgba(212,175,55,0.08) 0%, rgba(0,0,0,0.9) 50%, rgba(212,175,55,0.05) 100%)', borderBottom: '1px solid rgba(212,175,55,0.15)' }}>
                <div className="container py-4 text-center">
                    <div className="text-uppercase fw-bold mb-2" style={{ letterSpacing: '5px', fontSize: '0.75rem', color: '#d4af37' }}>Legal</div>
                    <h1 className="display-5 fw-light mb-3" style={{ letterSpacing: '2px' }}>Terms & Conditions</h1>
                    <p className="text-muted mb-0" style={{ fontSize: '0.9rem' }}>Last updated: March 2026</p>
                </div>
            </div>

            <div className="container py-5" style={{ maxWidth: '850px' }}>
                <div className="card border-0 p-4 p-md-5 rounded-4 shadow-lg" style={{ background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.05) !important' }}>

                    <div style={sectionStyle}>
                        <p style={textStyle}>
                            Welcome to <strong className="text-white">Couture Jewellery</strong>. By accessing and using this website, you agree to be bound by these Terms and Conditions. Please read them carefully before using our services.
                        </p>
                    </div>

                    <div style={sectionStyle}>
                        <h5 style={headingStyle}><i className="bi bi-check-circle me-2 opacity-75"></i>Acceptance of Terms</h5>
                        <p style={textStyle}>
                            By accessing this website, you acknowledge that you have read, understood, and agree to be bound by these terms. If you do not agree with any part of these terms, you must not use our website. We reserve the right to modify these terms at any time without prior notice.
                        </p>
                    </div>

                    <div style={sectionStyle}>
                        <h5 style={headingStyle}><i className="bi bi-person me-2 opacity-75"></i>User Accounts</h5>
                        <ul style={textStyle}>
                            <li className="mb-2">You must be at least 18 years old to create an account or make a purchase.</li>
                            <li className="mb-2">You are responsible for maintaining the confidentiality of your account credentials.</li>
                            <li className="mb-2">You agree to provide accurate, current, and complete information during registration.</li>
                            <li className="mb-2">We reserve the right to suspend or terminate accounts that violate these terms.</li>
                        </ul>
                    </div>

                    <div style={sectionStyle}>
                        <h5 style={headingStyle}><i className="bi bi-gem me-2 opacity-75"></i>Products & Pricing</h5>
                        <ul style={textStyle}>
                            <li className="mb-2">All jewellery products are displayed with accurate descriptions to the best of our knowledge. Slight variations in color may occur due to screen settings.</li>
                            <li className="mb-2">Prices are listed in Indian Rupees (INR) and include applicable taxes unless stated otherwise.</li>
                            <li className="mb-2">We reserve the right to modify prices without prior notice. The price at the time of order placement will be honored.</li>
                            <li className="mb-2">Products are subject to availability. We reserve the right to discontinue any product at any time.</li>
                        </ul>
                    </div>

                    <div style={sectionStyle}>
                        <h5 style={headingStyle}><i className="bi bi-bag-check me-2 opacity-75"></i>Orders & Payments</h5>
                        <ul style={textStyle}>
                            <li className="mb-2">Placing an order constitutes an offer to purchase. We reserve the right to accept or reject any order.</li>
                            <li className="mb-2">Payments are processed securely through Razorpay. We accept UPI, credit/debit cards, net banking, and Cash on Delivery (COD) for eligible orders.</li>
                            <li className="mb-2">An order confirmation will be sent to your registered email address upon successful placement.</li>
                            <li className="mb-2">For COD orders, the full amount must be paid to the delivery partner at the time of delivery.</li>
                        </ul>
                    </div>

                    <div style={sectionStyle}>
                        <h5 style={headingStyle}><i className="bi bi-c-circle me-2 opacity-75"></i>Intellectual Property</h5>
                        <p style={textStyle}>
                            All content on this website, including but not limited to text, graphics, logos, images, product designs, and software, is the property of Couture Jewellery and is protected by copyright and trademark laws. Unauthorized reproduction, distribution, or modification of any content is strictly prohibited.
                        </p>
                    </div>

                    <div style={sectionStyle}>
                        <h5 style={headingStyle}><i className="bi bi-exclamation-triangle me-2 opacity-75"></i>Limitation of Liability</h5>
                        <p style={textStyle}>
                            Couture Jewellery shall not be liable for any indirect, incidental, special, or consequential damages arising from the use of our website or products. Our total liability shall not exceed the amount you paid for the specific product in question. We are not responsible for delays caused by shipping carriers or force majeure events.
                        </p>
                    </div>

                    <div style={sectionStyle}>
                        <h5 style={headingStyle}><i className="bi bi-x-circle me-2 opacity-75"></i>Prohibited Activities</h5>
                        <ul style={textStyle}>
                            <li className="mb-2">Using the website for any unlawful purpose or fraudulent activity.</li>
                            <li className="mb-2">Attempting to interfere with the website's security or functionality.</li>
                            <li className="mb-2">Scraping, data mining, or extracting data from the website without permission.</li>
                            <li className="mb-2">Impersonating another person or entity.</li>
                        </ul>
                    </div>

                    <div style={sectionStyle}>
                        <h5 style={headingStyle}><i className="bi bi-building me-2 opacity-75"></i>Governing Law</h5>
                        <p style={textStyle}>
                            These Terms and Conditions are governed by and construed in accordance with the laws of India. Any disputes arising from these terms shall be subject to the exclusive jurisdiction of the courts in Mumbai, Maharashtra.
                        </p>
                    </div>

                    <div style={{ ...sectionStyle, marginBottom: 0 }}>
                        <h5 style={headingStyle}><i className="bi bi-envelope me-2 opacity-75"></i>Contact Us</h5>
                        <p style={textStyle}>For any questions regarding these terms, please reach out to us:</p>
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
