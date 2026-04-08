'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Hero } from '@/components/storefront/Hero';
import { Navbar } from '@/components/storefront/Navbar';
import { Footer } from '@/components/storefront/Footer';
import '@/app/chasma.css'; // Load namespaced storefront css

const brands = [
  { name: 'Ray-Ban' },
  { name: 'Oakley' },
  { name: 'Gucci' },
  { name: 'Prada' },
  { name: 'Vogue' },
  { name: 'Armani' },
];

export default function StorefrontHome() {
  const router = useRouter();

  return (
    <div className="chasma-theme landing-page">
      <div className="liquid-bg">
        <div className="blob blob-1"></div>
        <div className="blob blob-2"></div>
      </div>

      <Navbar />

      {/* Hero Section */}
      <Hero />

      {/* Features Section */}
      <motion.section
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="section-padding" style={{ background: 'var(--bg-glass)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="features-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem', textAlign: 'center', maxWidth: '1200px', margin: '0 auto' }}>
          {[
            { title: 'Free Shipping', desc: 'On all orders over ₹999', icon: '🚚' },
            { title: '14-Day Returns', desc: 'Hassle-free return policy', icon: '🔁' },
            { title: '1 Year Warranty', desc: 'On all frames and lenses', icon: '🛡️' },
            { title: 'Certified Opticians', desc: 'Expert advice available', icon: '⚕️' },
          ].map((feature, idx) => (
            <motion.div whileHover={{ y: -5 }} key={idx} className="glass" style={{ padding: '2rem', borderRadius: '1.5rem', background: 'rgba(255,255,255,0.02)' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>{feature.icon}</div>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>{feature.title}</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Brands Section */}
      <motion.section
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="section-padding" style={{ background: 'var(--accent-light)', overflow: 'hidden' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '3rem' }}>We sell trusted brands</h2>
        <div style={{ position: 'relative', width: '200%' }}>
          <div className="brand-carousel" style={{ display: 'flex', gap: '4rem', animationDuration: '20s' }}>
            {[...brands, ...brands].map((brand, idx) => (
              <div key={idx} className="glass" style={{ minWidth: '200px', height: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '1rem', fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-muted)' }}>
                {brand.name}
              </div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Trending Shapes Section */}
      <motion.section
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="section-padding" style={{ background: 'var(--bg-main)' }}>
        <h2 style={{ textAlign: 'center', fontSize: '2.5rem', marginBottom: '3.5rem' }}>Trending Shapes</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '2rem', textAlign: 'center', maxWidth: '1100px', margin: '0 auto', padding: '0 1rem' }}>
          {[
            { name: "Rectangle", img: "https://images.unsplash.com/photo-1574258495973-f010dfbb5371?auto=format&fit=crop&w=400&q=80" },
            { name: "Cateye", img: "https://images.unsplash.com/photo-1509695507497-903c140c43b0?auto=format&fit=crop&w=400&q=80" },
            { name: "Aviator", img: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&w=400&q=80" },
            { name: "Geometric", img: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=400&q=80" },
            { name: "Round", img: "https://images.unsplash.com/photo-1508296695146-257a814070b4?auto=format&fit=crop&w=400&q=80" },
            { name: "Clubmaster", img: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=400&q=80" }
          ].map((shape, idx) => (
            <motion.div
              whileHover={{ scale: 1.08 }}
              key={idx}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer' }}
              onClick={() => router.push('/shop')}
            >
              <div className="trending-circle" style={{ width: '150px', height: '150px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.08)', display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '1.2rem', overflow: 'hidden', boxShadow: '0 4px 15px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <img src={shape.img} alt={shape.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <h4 style={{ fontWeight: 700, fontSize: '1.15rem', color: 'var(--text-main)' }}>{shape.name}</h4>
            </motion.div>
          ))}
        </div>
      </motion.section>

      <Footer />
    </div>
  );
}
