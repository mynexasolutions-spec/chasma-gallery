'use client';
import { AuthProvider } from '../context/AuthContext';
import { CartProvider } from './storefront/CartProvider';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <CartProvider>
        {children}
      </CartProvider>
    </AuthProvider>
  );
}
