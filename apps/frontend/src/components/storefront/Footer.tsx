'use client';

import React from 'react';
import { MapPin, Phone, Mail, Camera, Share2, MessageCircle } from 'lucide-react';
import Link from 'next/link';

export const Footer = () => {
  return (
    <>
      {/* Newsletter */}
      <section className="section-padding" style={{ display: 'flex', justifyContent: 'center' }}>
        <div className="glass newsletter-box" style={{ maxWidth: '900px', width: '100%', padding: '4rem 2rem', borderRadius: '2rem', textAlign: 'center', background: 'linear-gradient(135deg, var(--bg-main), var(--accent-light))' }}>
          <h2 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>Stay Clear, Stay Stylish</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '2.5rem' }}>Subscribe to our newsletter for exclusive offers and vision tips.</p>
          <div style={{ display: 'flex', gap: '1rem', maxWidth: '500px', margin: '0 auto', flexWrap: 'wrap', justifyContent: 'center' }}>
            <input type="email" placeholder="Enter your email" className="glass" style={{ flex: 1, padding: '1rem 1.5rem', borderRadius: '1rem', minWidth: '200px', color: 'var(--text-main)' }} />
            <button style={{ padding: '1rem 2rem', background: 'var(--primary)', color: 'white', borderRadius: '1rem', fontWeight: 600, border: 'none', cursor: 'pointer', fontSize: '1rem' }}>Subscribe</button>
          </div>
        </div>
      </section>

      <footer className="glass" style={{ padding: '4rem 2% 2rem', borderTopLeftRadius: '3rem', borderTopRightRadius: '3rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '3rem', marginBottom: '4rem' }}>
          <div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--primary)', marginBottom: '1.5rem' }}>ChasmaGallery</div>
            <p style={{ color: 'var(--text-muted)' }}>Quality eyewear for the modern vision. Perfect clarity, perfect style.</p>
          </div>
          <div>
            <h4 style={{ marginBottom: '1.5rem' }}>Shop</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', color: 'var(--text-muted)' }}>
              <Link href="/shop">Eyewear</Link>
              <Link href="/shop">Sunglasses</Link>
              <Link href="/shop">Contact Lenses</Link>
              <Link href="/shop">Accessories</Link>
            </div>
          </div>
          <div>
            <h4 style={{ marginBottom: '1.5rem' }}>Company</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', color: 'var(--text-muted)' }}>
              <Link href="/about">About Us</Link>
              <Link href="/contact">Contact Us</Link>
              <Link href="/careers">Careers</Link>
            </div>
          </div>
          <div>
            <h4 style={{ marginBottom: '1.5rem' }}>Contact Info</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', color: 'var(--text-muted)' }}>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}><MapPin size={18} /> 123 Vision St, Clear City</div>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}><Phone size={18} /> +1 (555) 000-0000</div>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}><Mail size={18} /> hello@chasmagallery.com</div>
            </div>
          </div>
        </div>
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          <p>© 2026 ChasmaGallery. All rights reserved.</p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', marginTop: '1rem' }}>
            <Camera size={20} className="cursor-pointer" />
            <Share2 size={20} className="cursor-pointer" />
            <MessageCircle size={20} className="cursor-pointer" />
          </div>
        </div>
      </footer>
    </>
  );
};
