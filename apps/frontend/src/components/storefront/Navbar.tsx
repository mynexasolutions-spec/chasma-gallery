'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShoppingCart, Menu, X, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from './CartProvider';
import { useAuth } from '@/context/AuthContext';

export const Navbar = () => {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { cartCount } = useCart();
  const { user, logout } = useAuth();

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
          {user ? (
            <div className="flex items-center gap-4 relative group cursor-pointer">
              <span className="text-white text-sm font-medium">Hi, {user.first_name}</span>
              <User size={26} />
              <div className="absolute right-0 top-10 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-all duration-200">
                <button
                  onClick={() => logout()}
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                >
                  Sign Out
                </button>
              </div>
            </div>
          ) : (
            <Link href="/login" className="flex items-center gap-2 cursor-pointer text-white/80 hover:text-white transition-colors">
              <span className="hidden md:inline text-sm font-medium">Sign In</span>
              <User size={26} />
            </Link>
          )}
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
            
            <div className="w-full border-t border-white/10 pt-6 flex flex-col justify-center items-center gap-4">
              <Link 
                href="/cart" 
                onClick={() => setIsMenuOpen(false)} 
                className="bg-blue-500/20 border border-blue-500/50 text-blue-400 px-6 py-3 rounded-lg flex items-center justify-center gap-2 text-base font-semibold w-full"
              >
                <ShoppingCart size={20} />
                Cart ({cartCount})
              </Link>
              
              {user ? (
                <button 
                  onClick={() => { setIsMenuOpen(false); logout(); }} 
                  className="bg-red-500/20 border border-red-500/50 text-red-400 px-6 py-3 rounded-lg flex items-center justify-center gap-2 text-base font-semibold w-full"
                >
                  <User size={20} />
                  Sign Out ({user.first_name})
                </button>
              ) : (
                <Link 
                  href="/login" 
                  onClick={() => setIsMenuOpen(false)} 
                  className="bg-white/10 border border-white/30 text-white px-6 py-3 rounded-lg flex items-center justify-center gap-2 text-base font-semibold w-full"
                >
                  <User size={20} />
                  Sign In
                </Link>
              )}
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
