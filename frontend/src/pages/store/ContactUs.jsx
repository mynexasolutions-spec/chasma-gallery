import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

export default function ContactUs() {
    useEffect(() => { window.scrollTo(0, 0); }, []);

    const [formData, setFormData] = useState({ name: '', email: '', phone: '', subject: '', message: '' });
    const [submitted, setSubmitted] = useState(false);

    const handleChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));

    const handleSubmit = (e) => {
        e.preventDefault();
        setSubmitted(true);
        // Reset after 3 seconds
        setTimeout(() => { setSubmitted(false); setFormData({ name: '', email: '', phone: '', subject: '', message: '' }); }, 3000);
    };

    const textStyle = { color: 'rgba(255,255,255,0.75)', lineHeight: 1.9, fontSize: '0.95rem' };
    const inputStyle = 'form-control bg-transparent text-white border-secondary border-opacity-25 rounded-0 shadow-none px-3 py-2';

    return (
        <div className="store-theme" style={{ background: '#050505', minHeight: '100vh', color: '#fff', paddingBottom: '5rem' }}>
            {/* Hero Banner */}
            <div className="position-relative py-5" style={{ background: 'linear-gradient(135deg, rgba(212,175,55,0.08) 0%, rgba(0,0,0,0.9) 50%, rgba(212,175,55,0.05) 100%)', borderBottom: '1px solid rgba(212,175,55,0.15)' }}>
                <div className="container py-4 text-center">
                    <div className="text-uppercase fw-bold mb-2" style={{ letterSpacing: '5px', fontSize: '0.75rem', color: '#d4af37' }}>Get In Touch</div>
                    <h1 className="display-5 fw-light mb-3" style={{ letterSpacing: '2px' }}>Contact Us</h1>
                    <p className="text-muted mb-0" style={{ fontSize: '0.9rem' }}>We'd love to hear from you</p>
                </div>
            </div>

            <div className="container py-5">
                <div className="row g-5">
                    {/* Contact Info Cards */}
                    <div className="col-lg-5">
                        <div className="d-flex flex-column gap-4">
                            {/* Phone */}
                            <div className="p-4 rounded-4 d-flex align-items-start gap-3" style={{ background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.05)' }}>
                                <div className="d-flex align-items-center justify-content-center flex-shrink-0" style={{ width: 50, height: 50, borderRadius: '50%', background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.2)' }}>
                                    <i className="bi bi-telephone fs-5" style={{ color: '#d4af37' }}></i>
                                </div>
                                <div>
                                    <h6 className="text-white fw-bold mb-1">Call Us</h6>
                                    <p className="mb-1" style={textStyle}>+91 98765 43210</p>
                                    <p className="mb-0 text-muted" style={{ fontSize: '0.8rem' }}>Mon – Sat, 10 AM – 7 PM IST</p>
                                </div>
                            </div>

                            {/* Email */}
                            <div className="p-4 rounded-4 d-flex align-items-start gap-3" style={{ background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.05)' }}>
                                <div className="d-flex align-items-center justify-content-center flex-shrink-0" style={{ width: 50, height: 50, borderRadius: '50%', background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.2)' }}>
                                    <i className="bi bi-envelope fs-5" style={{ color: '#d4af37' }}></i>
                                </div>
                                <div>
                                    <h6 className="text-white fw-bold mb-1">Email Us</h6>
                                    <p className="mb-1" style={textStyle}>support@couturejewellery.com</p>
                                    <p className="mb-0 text-muted" style={{ fontSize: '0.8rem' }}>We respond within 24 hours</p>
                                </div>
                            </div>

                            {/* Address */}
                            <div className="p-4 rounded-4 d-flex align-items-start gap-3" style={{ background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.05)' }}>
                                <div className="d-flex align-items-center justify-content-center flex-shrink-0" style={{ width: 50, height: 50, borderRadius: '50%', background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.2)' }}>
                                    <i className="bi bi-geo-alt fs-5" style={{ color: '#d4af37' }}></i>
                                </div>
                                <div>
                                    <h6 className="text-white fw-bold mb-1">Visit Our Store</h6>
                                    <p className="mb-1" style={textStyle}>123, Jewellers Lane,<br />Mumbai, Maharashtra 400001,<br />India</p>
                                    <p className="mb-0 text-muted" style={{ fontSize: '0.8rem' }}>Walk-ins welcome</p>
                                </div>
                            </div>

                            {/* WhatsApp */}
                            <div className="p-4 rounded-4 d-flex align-items-start gap-3" style={{ background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.05)' }}>
                                <div className="d-flex align-items-center justify-content-center flex-shrink-0" style={{ width: 50, height: 50, borderRadius: '50%', background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.2)' }}>
                                    <i className="bi bi-whatsapp fs-5" style={{ color: '#d4af37' }}></i>
                                </div>
                                <div>
                                    <h6 className="text-white fw-bold mb-1">WhatsApp</h6>
                                    <p className="mb-1" style={textStyle}>+91 98765 43210</p>
                                    <p className="mb-0 text-muted" style={{ fontSize: '0.8rem' }}>Chat with us for quick assistance</p>
                                </div>
                            </div>

                            {/* Social Media */}
                            <div className="p-4 rounded-4" style={{ background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.05)' }}>
                                <h6 className="text-white fw-bold mb-3">Follow Us</h6>
                                <div className="d-flex gap-3">
                                    {[
                                        { icon: 'bi-instagram', link: 'https://instagram.com' },
                                        { icon: 'bi-facebook', link: 'https://facebook.com' },
                                        { icon: 'bi-twitter-x', link: 'https://twitter.com' },
                                        { icon: 'bi-pinterest', link: 'https://pinterest.com' },
                                        { icon: 'bi-youtube', link: 'https://youtube.com' }
                                    ].map((social, i) => (
                                        <a key={i} href={social.link} target="_blank" rel="noreferrer"
                                            className="d-flex align-items-center justify-content-center"
                                            style={{
                                                width: 42, height: 42, borderRadius: '50%',
                                                background: 'rgba(212,175,55,0.08)', border: '1px solid rgba(212,175,55,0.2)',
                                                color: '#d4af37', transition: 'all 0.3s ease', textDecoration: 'none'
                                            }}>
                                            <i className={`bi ${social.icon}`}></i>
                                        </a>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Contact Form */}
                    <div className="col-lg-7">
                        <div className="card border-0 p-4 p-md-5 rounded-4 shadow-lg h-100" style={{ background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.05) !important' }}>
                            <h4 className="mb-4 fw-light text-white" style={{ letterSpacing: '0.5px' }}>
                                <i className="bi bi-chat-dots me-2 opacity-75" style={{ color: '#d4af37' }}></i>
                                Send Us A Message
                            </h4>

                            {submitted ? (
                                <div className="text-center py-5 my-5">
                                    <div className="d-flex align-items-center justify-content-center mx-auto mb-4" style={{ width: 80, height: 80, borderRadius: '50%', background: 'rgba(212,175,55,0.1)', border: '2px solid rgba(212,175,55,0.3)' }}>
                                        <i className="bi bi-check-lg fs-1" style={{ color: '#d4af37' }}></i>
                                    </div>
                                    <h4 className="text-white fw-light mb-2">Thank You!</h4>
                                    <p style={textStyle}>Your message has been received. We'll get back to you within 24 hours.</p>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit}>
                                    <div className="row g-4">
                                        <div className="col-md-6">
                                            <label className="form-label text-white opacity-75 small text-uppercase" style={{ letterSpacing: '1px' }}>Full Name</label>
                                            <input type="text" className={inputStyle} name="name" value={formData.name} onChange={handleChange} required />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label text-white opacity-75 small text-uppercase" style={{ letterSpacing: '1px' }}>Email Address</label>
                                            <input type="email" className={inputStyle} name="email" value={formData.email} onChange={handleChange} required />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label text-white opacity-75 small text-uppercase" style={{ letterSpacing: '1px' }}>Phone Number</label>
                                            <input type="tel" className={inputStyle} name="phone" value={formData.phone} onChange={handleChange} />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label text-white opacity-75 small text-uppercase" style={{ letterSpacing: '1px' }}>Subject</label>
                                            <select className={inputStyle} name="subject" value={formData.subject} onChange={handleChange} required>
                                                <option value="" disabled>Select a topic</option>
                                                <option value="order">Order Inquiry</option>
                                                <option value="product">Product Question</option>
                                                <option value="return">Return / Refund</option>
                                                <option value="custom">Custom Jewellery</option>
                                                <option value="feedback">Feedback</option>
                                                <option value="other">Other</option>
                                            </select>
                                        </div>
                                        <div className="col-12">
                                            <label className="form-label text-white opacity-75 small text-uppercase" style={{ letterSpacing: '1px' }}>Your Message</label>
                                            <textarea className={inputStyle} name="message" value={formData.message} onChange={handleChange} rows="5" required style={{ resize: 'none' }}></textarea>
                                        </div>
                                    </div>
                                    <div className="mt-4">
                                        <button type="submit" className="btn w-100 py-3 fw-bold rounded-0 text-uppercase d-flex align-items-center justify-content-center"
                                            style={{ background: '#d4af37', color: '#000', letterSpacing: '1px', border: 'none' }}>
                                            <i className="bi bi-send me-2"></i> Send Message
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
