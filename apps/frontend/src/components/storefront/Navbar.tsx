'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShoppingCart, Menu, X, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from './CartProvider';

export const Navbar = () => {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { cartCount } = useCart();

  const links = [
    { name: 'Home', href: '/' },
    { name: 'Shop', href: '/shop' },
    { name: 'About Us', href: '/about' },
    { name: 'Contact Us', href: '/contact' },
  ];

  return (
    <>
      <nav className="glass navbar-desktop-layout sticky top-0 w-full z-50 px-8 py-3 flex justify-between items-center rounded-b-2xl border-b border-white/5">
        <div className="mobile-menu-icon hidden cursor-pointer" onClick={() => setIsMenuOpen(!isMenuOpen)}>
          {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
        </div>
        
        <Link href="/" className="navbar-logo mr-8">
          <img
            src="/logo.png"
            alt="Chasma Gallery Logo"
            className="h-14 w-auto object-contain rounded-xl"
          />
        </Link>

        {/* Desktop Links */}
        <div className="nav-links hidden md:flex items-center gap-10 absolute left-1/2 -translate-x-1/2">
          {links.map(link => (
            <Link key={link.href} href={link.href} className={`nav-link ${pathname === link.href ? 'active' : ''}`}>
              {link.name}
            </Link>
          ))}
        </div>

        {/* Right Buttons */}
        <div className="navbar-right-buttons flex items-center gap-6 ml-auto">
          <Link href="/cart" className="relative cursor-pointer">
            <ShoppingCart size={24} />
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-blue-500 text-white rounded-full px-2 text-xs font-bold">
                {cartCount}
              </span>
            )}
          </Link>
          <Link href="/admin/login" className="mobile-user-icon cursor-pointer flex items-center">
            <User size={26} />
          </Link>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="glass mobile-menu-container fixed top-[70px] left-[4%] right-[4%] p-8 z-[999] rounded-2xl flex flex-col gap-6 items-center"
          >
            {links.map(link => (
              <Link key={link.href} href={link.href} onClick={() => setIsMenuOpen(false)} className={`nav-link ${pathname === link.href ? 'active' : ''}`}>
                {link.name}
              </Link>
            ))}
            
            <div className="w-full border-t border-white/10 pt-6 flex justify-center">
              <Link 
                href="/cart" 
                onClick={() => setIsMenuOpen(false)} 
                className="bg-blue-500/20 border border-blue-500/50 text-blue-400 px-6 py-3 rounded-lg flex items-center gap-2 text-base font-semibold"
              >
                <ShoppingCart size={20} />
                Cart ({cartCount})
              </Link>
            </div>
            
            <button className="nav-link text-red-400 mt-4" onClick={() => setIsMenuOpen(false)}>
               Close
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
