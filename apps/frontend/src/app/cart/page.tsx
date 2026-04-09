'use client';

import React, { useState } from 'react';
import { ShoppingCart, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/storefront/Navbar';
import { Footer } from '@/components/storefront/Footer';
import { useCart } from '@/components/storefront/CartProvider';
import '@/app/chasma.css';

export default function CartPage() {
  const router = useRouter();
  const { cart, cartTotal, removeFromCart, updateQuantity, clearCart } = useCart();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleCheckout = async () => {
    setIsProcessing(true);
    try {
      // Backend's processOrderItems expects items[].id and items[].quantity
      const orderItems = cart.map(item => ({
        id: item.id,
        quantity: item.quantity
      }));

      const response = await fetch('http://localhost:5000/api/payment/create-cod-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          items: orderItems,
          billing: {
            name: 'Guest Customer',
            email: 'guest@chasmagallery.com',
            phone: '',
            address: ''
          }
        }),
      });

      const data = await response.json();
      if (data.success) {
        alert(`Order Placed Successfully! Order #${data.data.orderNumber}`);
        clearCart();
        router.push('/');
      } else {
        alert('Order failed: ' + data.message);
      }
    } catch (error) {
      console.error('Checkout error:', error);
      alert("Checkout error. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };


  return (
    <div className="chasma-theme">
      <div className="liquid-bg">
        <div className="blob blob-1"></div>
        <div className="blob blob-2"></div>
      </div>
      <Navbar />

      <section className="section-padding">
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          {/* Header */}
          <div className="cart-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem', gap: '0' }}>
            <div>
              <h2 style={{ fontSize: 'clamp(1.8rem, 5vw, 3rem)', marginBottom: '0.5rem', background: 'linear-gradient(135deg, var(--primary), #60a5fa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Shopping Cart</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>Review and manage your items</p>
            </div>
            <Link href="/shop" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)', background: 'rgba(96, 165, 250, 0.1)', padding: '0.75rem 1.5rem', borderRadius: '999px', border: '1px solid var(--primary)', fontSize: '1rem', fontWeight: 600, transition: 'all 0.3s ease', whiteSpace: 'nowrap' }}>
              <ArrowLeft size={18} /> Continue Shopping
            </Link>
          </div>

          {cart.length === 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyItems: 'center', gap: '2rem', padding: 'clamp(2rem, 5vw, 4rem) 1rem' }}>
              <div className="glass" style={{ padding: 'clamp(2rem, 5vw, 4rem) clamp(1.5rem, 5vw, 3rem)', borderRadius: '2rem', textAlign: 'center', maxWidth: '600px', background: 'rgba(96, 165, 250, 0.05)', margin: "0 auto" }}>
                <ShoppingCart size={64} style={{ margin: '0 auto 1.5rem', color: 'var(--primary)', opacity: 0.6 }} />
                <h3 style={{ fontSize: 'clamp(1.3rem, 4vw, 1.8rem)', marginBottom: '0.5rem', color: 'var(--text-main)' }}>Your cart is empty</h3>
                <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', fontSize: '1.05rem' }}>Explore our collection and find the perfect eyewear for you</p>
                <Link href="/shop">
                  <button className="glass liquid-btn" style={{ padding: '0.75rem 2rem', borderRadius: '999px', background: 'linear-gradient(135deg, var(--primary), #3b82f6)', color: 'white', fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer', border: 'none', transition: 'all 0.3s ease', width: '100%', maxWidth: '300px' }}>
                    Browse Products
                  </button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="cart-container" style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '2rem', alignItems: 'start' }}>
              {/* Cart Items Section */}
              <div className="glass" style={{ padding: 'clamp(1.5rem, 3vw, 2rem)', borderRadius: '1.5rem', background: 'rgba(15, 23, 42, 0.95)' }}>
                <h3 style={{ fontSize: 'clamp(1.1rem, 3vw, 1.3rem)', marginBottom: '1.5rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <ShoppingCart size={24} style={{ color: 'var(--primary)', flexShrink: 0 }} />
                  Items ({cart.reduce((a, b) => a + b.quantity, 0)})
                </h3>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '600px', overflowY: 'auto', paddingRight: '0.5rem' }}>
                  {cart.map((item) => {
                    const itemPrice = Number(item.rawPrice) || 0;
                    const itemTotal = itemPrice * item.quantity;
                    return (
                      <div key={item.id} className="cart-item-wrapper" style={{ position: 'relative' }}>
                        <div className="cart-item glass" style={{ padding: 'clamp(1rem, 3vw, 1.5rem)', borderRadius: '1rem', display: 'flex', gap: 'clamp(0.75rem, 3vw, 1.5rem)', alignItems: 'flex-start', border: '1px solid rgba(96, 165, 250, 0.15)', transition: 'all 0.3s ease', background: 'rgba(30, 41, 59, 0.8)' }}>
                          <img src={item.image} className="cart-item-image bg-white" style={{ width: '100px', height: '100px', objectFit: 'contain', borderRadius: '0.75rem', flexShrink: 0, padding:"4px" }} alt={item.name} />
                          
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <h4 style={{ fontSize: 'clamp(0.95rem, 2vw, 1.05rem)', fontWeight: 600, marginBottom: '0.25rem', wordBreak: 'break-word', color: "white" }}>{item.name}</h4>
                            <p style={{ color: 'var(--text-muted)', fontSize: 'clamp(0.75rem, 2vw, 0.85rem)', marginBottom: '0.75rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.categoryLabel}</p>
                            
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                              <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', whiteSpace: 'nowrap' }}>Qty: {item.quantity}</span>
                            </div>
                            
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                              <div style={{ fontSize: 'clamp(0.8rem, 2vw, 0.9rem)', color: 'var(--text-muted)' }}>
                                ₹{itemPrice.toFixed(0)} <span style={{ color: 'var(--text-muted)', marginLeft: '0.25rem' }}>×</span> <span style={{ marginLeft: '0.25rem', fontWeight: 600, color: 'var(--text-main)' }}>{item.quantity}</span>
                              </div>
                              <span style={{ fontSize: 'clamp(1rem, 2vw, 1.1rem)', fontWeight: 700, color: 'var(--primary)' }}>₹{itemTotal.toFixed(0)}</span>
                            </div>
                          </div>
                          
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', background: 'rgba(255,255,255,0.05)', borderRadius: '0.5rem', padding: '0.25rem', border: '1px solid rgba(96, 165, 250, 0.2)' }}>
                            <button className="qty-control" onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))} style={{ width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(96, 165, 250, 0.3)', border: 'none', borderRadius: '4px', color: 'var(--primary)', cursor: 'pointer', fontSize: '1rem', fontWeight: 'bold', transition: 'all 0.2s ease' }}>−</button>
                            <span className="qty-display" style={{ minWidth: '24px', textAlign: 'center', fontWeight: 600 }}>{item.quantity}</span>
                            <button className="qty-control" onClick={() => updateQuantity(item.id, item.quantity + 1)} style={{ width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(96, 165, 250, 0.3)', border: 'none', borderRadius: '4px', color: 'var(--primary)', cursor: 'pointer', fontSize: '1rem', fontWeight: 'bold', transition: 'all 0.2s ease' }}>+</button>
                          </div>
                          <button className="remove-btn" onClick={() => removeFromCart(item.id)} style={{ width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(239, 68, 68, 0.2)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '0.5rem', color: '#ef4444', cursor: 'pointer', flexShrink: 0, transition: 'all 0.2s ease', fontSize: '1.2rem' }}>×</button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Order Summary Section */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div className="glass" style={{ padding: 'clamp(1.5rem, 3vw, 2rem)', borderRadius: '1.5rem', background: 'linear-gradient(135deg, rgba(96, 165, 250, 0.1), rgba(37, 99, 235, 0.1))', border: '1px solid rgba(96, 165, 250, 0.2)' }}>
                  <h3 style={{ fontSize: 'clamp(1.05rem, 3vw, 1.2rem)', marginBottom: '1.5rem', color: 'var(--text-main)' }}>Order Summary</h3>
                  
                  {(() => {
                    const subtotal = cartTotal;
                    const tax = subtotal * 0.08;
                    const shipping = subtotal > 2000 ? 0 : 150;
                    const total = subtotal + tax + shipping;
                    
                    return (
                      <>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', paddingBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)', fontSize: 'clamp(0.85rem, 2vw, 0.95rem)' }}>
                          <span style={{ color: 'var(--text-muted)' }}>Subtotal</span>
                          <span style={{ fontWeight: 600 }}>₹{subtotal.toFixed(0)}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', paddingBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)', fontSize: 'clamp(0.85rem, 2vw, 0.95rem)' }}>
                          <span style={{ color: 'var(--text-muted)' }}>Tax (8%)</span>
                          <span style={{ fontWeight: 600 }}>₹{tax.toFixed(0)}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', paddingBottom: '1.5rem', borderBottom: '1px solid rgba(96, 165, 250, 0.3)', fontSize: 'clamp(0.85rem, 2vw, 0.95rem)' }}>
                          <span style={{ color: 'var(--text-muted)' }}>Shipping {shipping === 0 && <span style={{ color: 'var(--primary)', fontSize: '0.75rem', marginLeft: '0.5rem' }}>(FREE)</span>}</span>
                          <span style={{ fontWeight: 600 }}>₹{shipping.toFixed(0)}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', fontSize: 'clamp(0.95rem, 2vw, 1.1rem)' }}>
                          <span style={{ fontWeight: 600 }}>Total</span>
                          <span style={{ fontSize: 'clamp(1.4rem, 4vw, 1.8rem)', fontWeight: 800, color: 'var(--primary)', background: 'linear-gradient(135deg, var(--primary), #3b82f6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>₹{total.toFixed(0)}</span>
                        </div>
                        
                        {shipping === 0 && (
                          <div style={{ background: 'rgba(34, 197, 94, 0.1)', border: '1px solid rgba(34, 197, 94, 0.3)', borderRadius: '0.75rem', padding: '0.75rem', marginBottom: '1.5rem', fontSize: '0.8rem', color: '#22c55e', textAlign: 'center' }}>
                          ✓ Free shipping applied (Order over ₹2000)
                          </div>
                        )}
                        
                        <button 
                          onClick={handleCheckout} 
                          disabled={isProcessing}
                          className="glass liquid-btn" 
                          style={{ width: '100%', padding: 'clamp(0.75rem, 2vw, 1rem)', borderRadius: '0.75rem', background: 'linear-gradient(135deg, var(--primary), #3b82f6)', color: 'white', fontWeight: 'bold', fontSize: 'clamp(0.9rem, 2vw, 1rem)', border: 'none', cursor: isProcessing ? 'not-allowed' : 'pointer', transition: 'all 0.3s ease', opacity: isProcessing ? 0.7 : 1 }}
                        >
                          {isProcessing ? 'Processing Order...' : 'Confirm COD Order'}
                        </button>
                      </>
                    );
                  })()}
                </div>

                <div className="info-icons glass" style={{ padding: 'clamp(1.25rem, 3vw, 1.5rem)', borderRadius: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', background: 'rgba(30, 41, 59, 0.8)', border: '1px solid rgba(96, 165, 250, 0.15)' }}>
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                    <div style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', background: 'rgba(96, 165, 250, 0.2)', color: 'var(--primary)', flexShrink: 0, fontSize: '1.2rem' }}>✓</div>
                    <div>
                      <h4 style={{ fontSize: 'clamp(0.85rem, 2vw, 0.95rem)', fontWeight: 600, marginBottom: '0.2rem', color: "white" }}>Cash on Delivery</h4>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Pay when it arrives at your door</p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                    <div style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', background: 'rgba(96, 165, 250, 0.2)', color: 'var(--primary)', flexShrink: 0, fontSize: '1.2rem' }}>🚚</div>
                    <div>
                      <h4 style={{ fontSize: 'clamp(0.85rem, 2vw, 0.95rem)', fontWeight: 600, marginBottom: '0.2rem', color: "white" }}>Fast Delivery</h4>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Delhi NCR: 1-2 days</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
