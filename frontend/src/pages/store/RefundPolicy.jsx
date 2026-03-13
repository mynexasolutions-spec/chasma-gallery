import { useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function RefundPolicy() {
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
                    <h1 className="display-5 fw-light mb-3" style={{ letterSpacing: '2px' }}>Refund & Cancellation Policy</h1>
                    <p className="text-muted mb-0" style={{ fontSize: '0.9rem' }}>Last updated: March 2026</p>
                </div>
            </div>

            <div className="container py-5" style={{ maxWidth: '850px' }}>
                <div className="card border-0 p-4 p-md-5 rounded-4 shadow-lg" style={{ background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.05) !important' }}>

                    <div style={sectionStyle}>
                        <p style={textStyle}>
                            At <strong className="text-white">Couture Jewellery</strong>, we want you to be completely satisfied with your purchase. If for any reason you are not happy with your order, we offer a straightforward refund and cancellation process.
                        </p>
                    </div>

                    <div style={sectionStyle}>
                        <h5 style={headingStyle}><i className="bi bi-x-circle me-2 opacity-75"></i>Order Cancellation</h5>
                        <ul style={textStyle}>
                            <li className="mb-2">Orders can be cancelled within <strong className="text-white">24 hours</strong> of placing the order, provided the item has not been shipped.</li>
                            <li className="mb-2">To cancel an order, contact our support team at <strong className="text-white">support@couturejewellery.com</strong> with your order number.</li>
                            <li className="mb-2">Once an order has been shipped, it cannot be cancelled. You may request a return instead.</li>
                            <li className="mb-2">Custom-made or personalized jewellery orders cannot be cancelled once production has started.</li>
                        </ul>
                    </div>

                    <div style={sectionStyle}>
                        <h5 style={headingStyle}><i className="bi bi-arrow-return-left me-2 opacity-75"></i>Return Policy</h5>
                        <ul style={textStyle}>
                            <li className="mb-2">We accept returns within <strong className="text-white">7 days</strong> of delivery for most products.</li>
                            <li className="mb-2">Items must be unused, unworn, and in their original packaging with all tags intact.</li>
                            <li className="mb-2">Custom-made, engraved, or personalized items are <strong className="text-white">non-returnable</strong>.</li>
                            <li className="mb-2">Earrings and pierced jewellery are <strong className="text-white">non-returnable</strong> due to hygiene reasons.</li>
                            <li className="mb-2">To initiate a return, contact us at <strong className="text-white">support@couturejewellery.com</strong> with your order number and reason for return.</li>
                        </ul>
                    </div>

                    <div style={sectionStyle}>
                        <h5 style={headingStyle}><i className="bi bi-currency-rupee me-2 opacity-75"></i>Refund Process</h5>
                        <ul style={textStyle}>
                            <li className="mb-2">Once we receive and inspect the returned item, we will notify you of the refund status.</li>
                            <li className="mb-2">Approved refunds will be processed within <strong className="text-white">5–10 business days</strong> to the original payment method.</li>
                            <li className="mb-2">For online payments (UPI, card, net banking), refunds will be credited to the same account/card used for payment.</li>
                            <li className="mb-2">For Cash on Delivery orders, refunds will be processed via bank transfer. You will need to provide your bank account details.</li>
                            <li className="mb-2">Shipping charges are <strong className="text-white">non-refundable</strong> unless the return is due to our error (wrong/defective item).</li>
                        </ul>
                    </div>

                    <div style={sectionStyle}>
                        <h5 style={headingStyle}><i className="bi bi-tools me-2 opacity-75"></i>Damaged or Defective Items</h5>
                        <p style={textStyle}>
                            If you receive a damaged, defective, or incorrect item, please contact us within <strong className="text-white">48 hours</strong> of delivery with photographs of the product. We will arrange for a free replacement or full refund at no additional cost to you.
                        </p>
                    </div>

                    <div style={sectionStyle}>
                        <h5 style={headingStyle}><i className="bi bi-arrow-repeat me-2 opacity-75"></i>Exchange Policy</h5>
                        <p style={textStyle}>
                            We offer exchanges within <strong className="text-white">7 days</strong> of delivery for items of equal or greater value. The customer shall bear any price difference for upgraded products. Exchange requests follow the same return process.
                        </p>
                    </div>

                    {/* Refund Timeline Table */}
                    <div style={sectionStyle}>
                        <h5 style={headingStyle}><i className="bi bi-clock-history me-2 opacity-75"></i>Refund Timeline</h5>
                        <div className="table-responsive">
                            <table className="table table-dark table-borderless mb-0" style={{ background: 'transparent' }}>
                                <thead>
                                    <tr style={{ borderBottom: '1px solid rgba(212,175,55,0.2)' }}>
                                        <th className="text-gold py-3" style={{ fontWeight: 600, fontSize: '0.85rem', letterSpacing: '1px' }}>PAYMENT METHOD</th>
                                        <th className="text-gold py-3" style={{ fontWeight: 600, fontSize: '0.85rem', letterSpacing: '1px' }}>REFUND TIME</th>
                                    </tr>
                                </thead>
                                <tbody style={textStyle}>
                                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                        <td className="py-3">UPI</td>
                                        <td className="py-3">3–5 business days</td>
                                    </tr>
                                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                        <td className="py-3">Credit / Debit Card</td>
                                        <td className="py-3">5–10 business days</td>
                                    </tr>
                                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                        <td className="py-3">Net Banking</td>
                                        <td className="py-3">5–7 business days</td>
                                    </tr>
                                    <tr>
                                        <td className="py-3">Cash on Delivery</td>
                                        <td className="py-3">7–10 business days (via bank transfer)</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div style={{ ...sectionStyle, marginBottom: 0 }}>
                        <h5 style={headingStyle}><i className="bi bi-envelope me-2 opacity-75"></i>Contact Us</h5>
                        <p style={textStyle}>For refund or cancellation requests:</p>
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
