'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const defaultHeroImages = [
  {
    url: 'https://images.unsplash.com/photo-1509695507497-903c140c43b0?q=80&w=2070&auto=format&fit=crop',
    text: 'Classic & Modern Glasses for Every Face.',
  },
  {
    url: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?q=80&w=2070&auto=format&fit=crop',
    text: 'See the World Through Perfect Clarity.',
  },
  {
    url: 'https://images.unsplash.com/photo-1509695507497-903c140c43b0?q=80&w=2070&auto=format&fit=crop',
    text: 'Designer Eyewear Collections.',
  },
  {
    url: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?q=80&w=2070&auto=format&fit=crop',
    text: 'Step Out in Style.',
  }
];

export const Hero = () => {
  const [heroIndex, setHeroIndex] = useState(0);

  const changeHeroIndex = (direction: number) => {
    setHeroIndex((prev) => {
      const next = prev + direction;
      if (next < 0) return defaultHeroImages.length - 1;
      return next % defaultHeroImages.length;
    });
  };

  useEffect(() => {
    const interval = setInterval(() => changeHeroIndex(1), 5200);
    return () => clearInterval(interval);
  }, []);

  return (
    <section style={{ height: '100vh', position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: 0, width: '100vw', marginLeft: 'calc(50% - 50vw)' }}>
      <AnimatePresence initial={false} mode="popLayout">
        <motion.div
          key={heroIndex}
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '-100%' }}
          transition={{ duration: 1.2, ease: [0.43, 0.13, 0.23, 0.96] }}
          style={{ position: 'absolute', inset: 0 }}
        >
          <div className="hero-slide" style={{ backgroundImage: `url(${defaultHeroImages[heroIndex].url})` }}></div>
          <div className="hero-overlay"></div>

          {/* Hero nav arrows */}
          <button
            type="button"
            onClick={() => changeHeroIndex(-1)}
            style={{
              position: 'absolute',
              left: '1.5rem',
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'rgba(0,0,0,0.35)',
              border: 'none',
              borderRadius: '999px',
              padding: '0.8rem',
              cursor: 'pointer',
              color: 'white',
              zIndex: 2,
            }}
          >
            <ArrowLeft size={22} />
          </button>
          <button
            type="button"
            onClick={() => changeHeroIndex(1)}
            style={{
              position: 'absolute',
              right: '1.5rem',
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'rgba(0,0,0,0.35)',
              border: 'none',
              borderRadius: '999px',
              padding: '0.8rem',
              cursor: 'pointer',
              color: 'white',
              zIndex: 2,
            }}
          >
            <ArrowRight size={22} />
          </button>
        </motion.div>
      </AnimatePresence>

      <div style={{ position: 'relative', zIndex: 1, maxWidth: '800px' }}>
        <motion.h1
          key={`text-${heroIndex}`}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8 }}
          style={{ fontSize: 'clamp(2.5rem, 8vw, 4.5rem)', fontWeight: 800, color: 'var(--text-main)', marginBottom: '1.5rem', lineHeight: 1.1 }}
        >
          {defaultHeroImages[heroIndex].text}
        </motion.h1>
        <Link href="/shop" passHref>
          <motion.button
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="glass-btn-professional"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            style={{ padding: '1.2rem 2.5rem', fontWeight: 600, fontSize: '1.1rem', borderRadius: '50px', color: 'white', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
          >
            See Collection <ArrowRight size={20} style={{ marginLeft: '8px' }} />
          </motion.button>
        </Link>
      </div>
    </section>
  );
};
