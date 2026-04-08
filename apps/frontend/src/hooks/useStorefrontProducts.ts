'use client';

import { useState, useEffect } from 'react';
import { Product } from '@ecommerce/shared-types';

export interface StorefrontProduct {
  id: string;
  name: string;
  sku: string;
  type: string;
  price: string;
  rawPrice: number;
  categories: { main: string; sub: string }[];
  categoryLabel: string;
  image: string;
  description: string;
  visible: boolean;
  stock_status: string;
}

export const useStorefrontProducts = () => {
  const [products, setProducts] = useState<StorefrontProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/products?limit=100');
        const json = await res.json();
        
        if (json.success) {
          const normalized = json.data.map((p: any) => ({
            id: p.id,
            name: p.name,
            sku: p.sku || '',
            type: p.type || 'simple',
            // Format price exactly as the template expects
            price: `₹${p.sale_price || p.price}`,
            rawPrice: Number(p.sale_price || p.price),
            categories: [{ main: p.category_name || 'General', sub: '' }],
            categoryLabel: p.category_name || 'General',
            image: p.image_url || 'https://via.placeholder.com/400',
            description: p.short_description || p.description || '',
            visible: p.is_active,
            stock_status: p.stock_status,
          }));
          
          setProducts(normalized);
        }
      } catch (error) {
        console.error("Failed to fetch products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return { products, loading };
};
