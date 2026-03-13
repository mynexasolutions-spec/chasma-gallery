import { useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function PrivacyPolicy() {
    useEffect(() => { window.scrollTo(0, 0); }, []);

    const sectionStyle = {
        marginBottom: '2.5rem'
    };
    const headingStyle = {
        color: '#d4af37',
        fontWeight: 600,
        letterSpacing: '0.5px',
        marginBottom: '1rem',
        fontSize: '1.2rem'
    };
    const textStyle = {
        color: 'rgba(255,255,255,0.75)',
        lineHeight: 1.9,
        fontSize: '0.95rem'
    };

    return (
        <div className="store-theme" style={{ background: '#050505', minHeight: '100vh', color: '#fff', paddingBottom: '5rem' }}>
            {/* Hero Banner */}
            <div className="position-relative py-5" style={{ background: 'linear-gradient(135deg, rgba(212,175,55,0.08) 0%, rgba(0,0,0,0.9) 50%, rgba(212,175,55,0.05) 100%)', borderBottom: '1px solid rgba(212,175,55,0.15)' }}>
                <div className="container py-4 text-center">
                    <div className="text-uppercase fw-bold mb-2" style={{ letterSpacing: '5px', fontSize: '0.75rem', color: '#d4af37' }}>Legal</div>
                    <h1 className="display-5 fw-light mb-3" style={{ letterSpacing: '2px' }}>Privacy Policy</h1>
                    <p className="text-muted mb-0" style={{ fontSize: '0.9rem' }}>Last updated: March 2026</p>
                </div>
            </div>

            <div className="container py-5" style={{ maxWidth: '850px' }}>
                <div className="card border-0 p-4 p-md-5 rounded-4 shadow-lg" style={{ background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.05) !important' }}>

                    <div style={sectionStyle}>
                        <p style={textStyle}>
                            At <strong className="text-white">Couture Jewellery</strong>, we are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy outlines how we collect, use, disclose, and safeguard your data when you visit our website or make a purchase.
                        </p>
                    </div>

                    <div style={sectionStyle}>
                        <h5 style={headingStyle}><i className="bi bi-collection me-2 opacity-75"></i>Information We Collect</h5>
                        <p style={textStyle}>We may collect the following types of information when you interact with our website:</p>
                        <ul style={textStyle}>
                            <li className="mb-2"><strong className="text-white">Personal Information:</strong> Name, email address, phone number, shipping and billing addresses when you place an order or create an account.</li>
                            <li className="mb-2"><strong className="text-white">Payment Information:</strong> Payment details are processed securely through Razorpay. We do not store your credit/debit card numbers on our servers.</li>
                            <li className="mb-2"><strong className="text-white">Usage Data:</strong> Browser type, IP address, pages visited, time and date of visits, and other diagnostic data.</li>
                            <li className="mb-2"><strong className="text-white">Cookies:</strong> We use cookies and similar tracking technologies to enhance your browsing experience and analyze site traffic.</li>
                        </ul>
                    </div>

                    <div style={sectionStyle}>
                        <h5 style={headingStyle}><i className="bi bi-gear me-2 opacity-75"></i>How We Use Your Information</h5>
                        <ul style={textStyle}>
                            <li className="mb-2">To process and fulfill your orders, including shipping and delivery.</li>
                            <li className="mb-2">To communicate with you regarding order status, inquiries, and customer support.</li>
                            <li className="mb-2">To personalize your shopping experience and recommend products.</li>
                            <li className="mb-2">To send promotional emails and newsletters (with your consent).</li>
                            <li className="mb-2">To improve our website, products, and services.</li>
                            <li className="mb-2">To detect, prevent, and address fraud or technical issues.</li>
                        </ul>
                    </div>

                    <div style={sectionStyle}>
                        <h5 style={headingStyle}><i className="bi bi-share me-2 opacity-75"></i>Information Sharing & Disclosure</h5>
                        <p style={textStyle}>We do not sell, trade, or rent your personal information to third parties. We may share your data with:</p>
                        <ul style={textStyle}>
                            <li className="mb-2"><strong className="text-white">Payment Processors:</strong> Razorpay, for secure payment processing.</li>
                            <li className="mb-2"><strong className="text-white">Shipping Partners:</strong> To deliver your orders.</li>
                            <li className="mb-2"><strong className="text-white">Legal Authorities:</strong> When required by law or to protect our rights.</li>
                        </ul>
                    </div>

                    <div style={sectionStyle}>
                        <h5 style={headingStyle}><i className="bi bi-shield-lock me-2 opacity-75"></i>Data Security</h5>
                        <p style={textStyle}>
                            We implement industry-standard security measures including SSL encryption, secure payment gateways (Razorpay), and restricted access to personal data. While we strive to protect your information, no method of transmission over the internet is 100% secure.
                        </p>
                    </div>

                    <div style={sectionStyle}>
                        <h5 style={headingStyle}><i className="bi bi-cookie me-2 opacity-75"></i>Cookies</h5>
                        <p style={textStyle}>
                            Our website uses cookies to remember your preferences, maintain your session, and understand how you interact with our site. You can manage cookie preferences through your browser settings. Disabling cookies may affect certain features of the website.
                        </p>
                    </div>

                    <div style={sectionStyle}>
                        <h5 style={headingStyle}><i className="bi bi-person-check me-2 opacity-75"></i>Your Rights</h5>
                        <ul style={textStyle}>
                            <li className="mb-2">Access, update, or delete your personal information at any time through your account dashboard.</li>
                            <li className="mb-2">Opt out of marketing communications by clicking the unsubscribe link in our emails.</li>
                            <li className="mb-2">Request a copy of the data we hold about you by contacting us.</li>
                        </ul>
                    </div>

                    <div style={sectionStyle}>
                        <h5 style={headingStyle}><i className="bi bi-people me-2 opacity-75"></i>Third-Party Links</h5>
                        <p style={textStyle}>
                            Our website may contain links to third-party websites. We are not responsible for the privacy practices of these external sites. We encourage you to read their privacy policies.
                        </p>
                    </div>

                    <div style={{ ...sectionStyle, marginBottom: 0 }}>
                        <h5 style={headingStyle}><i className="bi bi-envelope me-2 opacity-75"></i>Contact Us</h5>
                        <p style={textStyle}>
                            If you have any questions about this Privacy Policy, please contact us at:
                        </p>
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
