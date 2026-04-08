'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useStorefrontProducts, StorefrontProduct } from '@/hooks/useStorefrontProducts';
import { useCart } from '@/components/storefront/CartProvider';
import { Navbar } from '@/components/storefront/Navbar';
import { Footer } from '@/components/storefront/Footer';
import '@/app/chasma.css';

const buildCategoryTree = (products: StorefrontProduct[]) => {
  const tree: Record<string, { count: number; subs: Record<string, number> }> = {};

  products.forEach((product) => {
    const seen = new Set<string>();
    product.categories.forEach(({ main, sub }) => {
      if (!main) return;
      const key = `${main}||${sub}`;
      if (seen.has(key)) return;
      seen.add(key);

      if (!tree[main]) {
        tree[main] = { count: 0, subs: {} };
      }
      tree[main].count += 1;
      if (sub) {
        tree[main].subs[sub] = (tree[main].subs[sub] || 0) + 1;
      }
    });
  });

  return tree;
};

export default function ShopPage() {
  const router = useRouter();
  const { products, loading } = useStorefrontProducts();
  const { addToCart } = useCart();

  const [selectedMainCategory, setSelectedMainCategory] = useState<string | null>(null);
  const [selectedSubCategory, setSelectedSubCategory] = useState<string | null>(null);
  const [sortOption, setSortOption] = useState('default');
  const [shopPage, setShopPage] = useState(1);
  const productsPerPage = 12;

  const categoryTree = useMemo(() => buildCategoryTree(products), [products]);
  const categoryList = useMemo(
    () =>
      Object.entries(categoryTree).map(([main, data]) => ({
        main,
        count: data.count,
        subs: Object.entries(data.subs).map(([sub, count]) => ({ sub, count })),
      })),
    [categoryTree]
  );

  const filteredProducts = useMemo(() => {
    let result = products;
    if (selectedMainCategory) {
      result = products.filter((product) => {
        const hasMain = product.categories.some((c) => c.main === selectedMainCategory);
        if (!hasMain) return false;
        if (!selectedSubCategory) return true;
        return product.categories.some(
          (c) => c.main === selectedMainCategory && c.sub === selectedSubCategory
        );
      });
    }

    if (sortOption !== 'default') {
      result = [...result].sort((a, b) => {
        if (sortOption === 'low-high') return a.rawPrice - b.rawPrice;
        if (sortOption === 'high-low') return b.rawPrice - a.rawPrice;
        if (sortOption === 'a-z') return a.name.localeCompare(b.name);
        if (sortOption === 'z-a') return b.name.localeCompare(a.name);
        return 0;
      });
    }

    return result;
  }, [products, selectedMainCategory, selectedSubCategory, sortOption]);

  const totalShopPages = Math.max(1, Math.ceil(filteredProducts.length / productsPerPage));
  const pagedProducts = useMemo(() => {
    const start = (shopPage - 1) * productsPerPage;
    return filteredProducts.slice(start, start + productsPerPage);
  }, [filteredProducts, shopPage]);

  const handleProductClick = (product: StorefrontProduct) => {
    // Navigate to product details - to be implemented
    // router.push(`/product/${product.id}`);
  };

  const setMainCategory = (main: string) => {
    if (selectedMainCategory === main) {
      setSelectedMainCategory(null);
      setSelectedSubCategory(null);
    } else {
      setSelectedMainCategory(main);
      setSelectedSubCategory(null);
    }
    setShopPage(1);
  };

  const setSubCategory = (sub: string) => {
    if (selectedSubCategory === sub) {
      setSelectedSubCategory(null);
    } else {
      setSelectedSubCategory(sub);
    }
    setShopPage(1);
  };

  if (loading) {
    return (
      <div className="chasma-theme min-h-screen flex items-center justify-center">
        <h2 className="text-2xl text-white">Loading products...</h2>
      </div>
    );
  }

  return (
    <div className="chasma-theme">
      <div className="liquid-bg">
        <div className="blob blob-1"></div>
        <div className="blob blob-2"></div>
      </div>
      <Navbar />

      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="section-padding"
      >
        <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', gap: '2.5rem', alignItems: 'flex-start' }} className="shop-layout">
          <style dangerouslySetInnerHTML={{
            __html: `
              @media (max-width: 768px) {
                .shop-layout { flex-direction: column !important; }
                .shop-sidebar { width: 100% !important; margin-bottom: 2rem !important; }
                .shop-sidebar .glass { max-height: 300px; overflow-y: auto; }
              }
            `
          }} />

          {/* Sidebar */}
          <aside className="shop-sidebar" style={{ width: '280px', flexShrink: 0, position: 'sticky', top: '100px' }}>
            <div className="glass" style={{ padding: '1.5rem', borderRadius: '1.5rem' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '1.5rem', color: 'var(--text-main)', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.8rem' }}>
                Categories
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedMainCategory(null);
                    setSelectedSubCategory(null);
                    setShopPage(1);
                  }}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '0.8rem 1rem',
                    borderRadius: '0.8rem',
                    background: selectedMainCategory === null ? 'rgba(37, 99, 235, 0.4)' : 'transparent',
                    color: selectedMainCategory === null ? 'white' : 'var(--text-main)',
                    border: 'none',
                    cursor: 'pointer',
                    fontWeight: 600,
                    transition: 'all 0.2s',
                  }}
                >
                  <span>All Categories</span>
                  <span style={{ background: 'rgba(255,255,255,0.1)', padding: '0.1rem 0.5rem', borderRadius: '999px', fontSize: '0.8rem' }}>
                    {products.length}
                  </span>
                </button>

                {categoryList.map((cat) => {
                  const isMainSelected = selectedMainCategory === cat.main;
                  return (
                    <div key={cat.main} style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                      <button
                        type="button"
                        onClick={() => setMainCategory(cat.main)}
                        className="cat-main-btn"
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          padding: '0.8rem 1rem',
                          borderRadius: '0.8rem',
                          background: isMainSelected ? 'rgba(37, 99, 235, 0.4)' : 'transparent',
                          color: isMainSelected ? 'white' : 'var(--text-main)',
                          border: 'none',
                          cursor: 'pointer',
                          fontWeight: 500,
                          transition: 'all 0.2s',
                        }}
                      >
                        <span>{cat.main}</span>
                        <span style={{ background: 'rgba(255,255,255,0.1)', padding: '0.1rem 0.5rem', borderRadius: '999px', fontSize: '0.8rem' }}>
                          {cat.count}
                        </span>
                      </button>

                      {isMainSelected && cat.subs.length > 0 && (
                        <div style={{ display: 'flex', flexDirection: 'column', paddingLeft: '1rem', marginTop: '0.3rem', borderLeft: '2px solid rgba(255,255,255,0.05)', marginLeft: '1rem' }}>
                          {cat.subs.map((sub) => (
                            <button
                              key={sub.sub}
                              type="button"
                              onClick={() => setSubCategory(sub.sub)}
                              style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                padding: '0.5rem 1rem',
                                borderRadius: '0.6rem',
                                border: 'none',
                                background:
                                  selectedSubCategory === sub.sub && isMainSelected
                                    ? 'rgba(37, 99, 235, 0.2)'
                                    : 'transparent',
                                color: 'var(--text-main)',
                                cursor: 'pointer',
                              }}
                            >
                              <span style={{ fontSize: '0.95rem' }}>{sub.sub}</span>
                              <span style={{ color: 'var(--text-muted)' }}>{sub.count}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main style={{ flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem', color: "white" }}>
                  {selectedMainCategory || 'All Products'}
                </h1>
                <p style={{ color: 'var(--text-muted)' }}>
                  {selectedSubCategory
                    ? `Showing ${filteredProducts.length} items in ${selectedSubCategory}`
                    : `Showing ${filteredProducts.length} items`}
                </p>
              </div>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
                <select
                  className="glass"
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value)}
                  style={{
                    padding: '0.75rem 1.2rem',
                    borderRadius: '1rem',
                    color: 'var(--text-main)',
                    outline: 'none',
                    cursor: 'pointer',
                    border: '1px solid rgba(255,255,255,0.1)'
                  }}
                >
                  <option value="default" style={{ color: 'black' }}>Sort by: Default</option>
                  <option value="low-high" style={{ color: 'black' }}>Price: Low to High</option>
                  <option value="high-low" style={{ color: 'black' }}>Price: High to Low</option>
                  <option value="a-z" style={{ color: 'black' }}>Name: A to Z</option>
                  <option value="z-a" style={{ color: 'black' }}>Name: Z to A</option>
                </select>
                <button
                  type="button"
                  onClick={() => router.push('/')}
                  style={{
                    padding: '0.75rem 1.2rem',
                    borderRadius: '1rem',
                    border: 'none',
                    background: 'rgba(255,255,255,0.08)',
                    color: 'var(--text-main)',
                    cursor: 'pointer',
                  }}
                >
                  Back to Home
                </button>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1.5rem' }}>
              {pagedProducts.length === 0 ? (
                <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '4rem 2rem', color: 'var(--text-muted)' }}>
                  No products found.
                </div>
              ) : (
                pagedProducts.map((product) => (
                  <motion.div
                    key={product.id}
                    className="glass product-card"
                    style={{ padding: '1rem', borderRadius: '1.5rem', cursor: 'pointer', display: 'flex', flexDirection: 'column' }}
                    onClick={() => handleProductClick(product)}
                  >
                    <div style={{ height: '200px', borderRadius: '1rem', overflow: 'hidden', marginBottom: '1rem', background: "white", padding: "10px" }}>
                      <img
                        src={product.image}
                        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                        alt={product.name}
                      />
                    </div>
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                      <h4 style={{ fontSize: '1.2rem', fontWeight: 600, color: "white" }}>{product.name}</h4>
                      <p style={{ color: 'var(--text-muted)', marginBottom: '0.75rem' }}>{product.categoryLabel}</p>
                      
                      <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontWeight: 700, fontSize: '1.2rem', color: "white" }}>{product.price}</span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            addToCart(product as any);
                          }}
                          className="glass"
                          style={{ padding: '0.5rem 1rem', borderRadius: '0.8rem', background: 'var(--accent-light)', color: 'var(--primary)', fontWeight: 'bold' }}
                        >
                          Add to Cart
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>

            {/* Pagination */}
            {totalShopPages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', marginTop: '2.5rem' }}>
                <button
                  type="button"
                  onClick={() => setShopPage((prev) => Math.max(1, prev - 1))}
                  disabled={shopPage === 1}
                  style={{
                    padding: '0.75rem 1rem',
                    borderRadius: '999px',
                    border: '1px solid rgba(255,255,255,0.15)',
                    background: shopPage === 1 ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.12)',
                    color: 'var(--text-main)',
                    cursor: shopPage === 1 ? 'not-allowed' : 'pointer',
                  }}
                >
                  Prev
                </button>

                {Array.from({ length: totalShopPages }, (_, idx) => idx + 1).map((pageNum) => (
                  <button
                    key={pageNum}
                    type="button"
                    onClick={() => setShopPage(pageNum)}
                    style={{
                      padding: '0.7rem 0.9rem',
                      borderRadius: '999px',
                      border: pageNum === shopPage ? '1px solid var(--primary)' : '1px solid rgba(255,255,255,0.15)',
                      background: pageNum === shopPage ? 'rgba(37, 99, 235, 0.25)' : 'transparent',
                      color: 'var(--text-main)',
                      cursor: 'pointer',
                    }}
                  >
                    {pageNum}
                  </button>
                ))}

                <button
                  type="button"
                  onClick={() => setShopPage((prev) => Math.min(totalShopPages, prev + 1))}
                  disabled={shopPage === totalShopPages}
                  style={{
                    padding: '0.75rem 1rem',
                    borderRadius: '999px',
                    border: '1px solid rgba(255,255,255,0.15)',
                    background: shopPage === totalShopPages ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.12)',
                    color: 'var(--text-main)',
                    cursor: shopPage === totalShopPages ? 'not-allowed' : 'pointer',
                  }}
                >
                  Next
                </button>
              </div>
            )}
          </main>
        </div>
      </motion.section>

      <Footer />
    </div>
  );
}
