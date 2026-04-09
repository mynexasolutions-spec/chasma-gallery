-- ============================================================
-- E-Commerce Dashboard — Full Database Seed
-- Run: psql -U postgres -d ecommerce_db -f seed.sql
-- ============================================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── Drop existing tables (order matters for FK) ──────────────────────────────
DROP TABLE IF EXISTS settings CASCADE;
DROP TABLE IF EXISTS reviews CASCADE;
DROP TABLE IF EXISTS coupon_usages CASCADE;
DROP TABLE IF EXISTS coupons CASCADE;
DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS cart_items CASCADE;
DROP TABLE IF EXISTS carts CASCADE;
DROP TABLE IF EXISTS variation_attribute_values CASCADE;
DROP TABLE IF EXISTS product_variations CASCADE;
DROP TABLE IF EXISTS attribute_values CASCADE;
DROP TABLE IF EXISTS attributes CASCADE;
DROP TABLE IF EXISTS product_images CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS brands CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS user_addresses CASCADE;
DROP TABLE IF EXISTS media CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- ── USERS ────────────────────────────────────────────────────────────────────
CREATE TABLE users (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  first_name    VARCHAR(100) NOT NULL,
  last_name     VARCHAR(100) NOT NULL,
  email         VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT,
  provider      VARCHAR(50) DEFAULT 'local',
  provider_id   VARCHAR(255),
  avatar_url    TEXT,
  role          VARCHAR(50)  NOT NULL DEFAULT 'customer',
  status        VARCHAR(50)  NOT NULL DEFAULT 'active',
  created_at    TIMESTAMP DEFAULT NOW(),
  updated_at    TIMESTAMP DEFAULT NOW()
);

CREATE TABLE user_addresses (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id       UUID REFERENCES users(id) ON DELETE CASCADE,
  type          VARCHAR(50),
  address_line1 VARCHAR(255),
  address_line2 VARCHAR(255),
  city          VARCHAR(100),
  state         VARCHAR(100),
  postal_code   VARCHAR(20),
  country       VARCHAR(100),
  created_at    TIMESTAMP DEFAULT NOW()
);

-- ── MEDIA ─────────────────────────────────────────────────────────────────────
CREATE TABLE media (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  file_url    TEXT NOT NULL,
  file_name   VARCHAR(255),
  mime_type   VARCHAR(100),
  file_size   BIGINT,
  alt_text    VARCHAR(255),
  title       VARCHAR(255),
  description TEXT,
  created_at  TIMESTAMP DEFAULT NOW()
);

-- ── CATEGORIES ───────────────────────────────────────────────────────────────
CREATE TABLE categories (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  parent_id   UUID REFERENCES categories(id),
  name        VARCHAR(150) NOT NULL,
  slug        VARCHAR(150) UNIQUE NOT NULL,
  description TEXT,
  image_id    UUID REFERENCES media(id),
  created_at  TIMESTAMP DEFAULT NOW(),
  updated_at  TIMESTAMP DEFAULT NOW()
);

-- ── BRANDS ───────────────────────────────────────────────────────────────────
CREATE TABLE brands (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name       VARCHAR(150) NOT NULL,
  slug       VARCHAR(150) UNIQUE NOT NULL,
  logo_id    UUID REFERENCES media(id),
  created_at TIMESTAMP DEFAULT NOW()
);

-- ── PRODUCTS ─────────────────────────────────────────────────────────────────
CREATE TABLE products (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name              VARCHAR(255) NOT NULL,
  slug              VARCHAR(255) UNIQUE NOT NULL,
  sku               VARCHAR(100) UNIQUE NOT NULL,
  type              VARCHAR(50) DEFAULT 'simple',
  description       TEXT,
  short_description TEXT,
  price             NUMERIC(12,2) NOT NULL,
  sale_price        NUMERIC(12,2),
  stock_quantity    INTEGER DEFAULT 0,
  stock_status      VARCHAR(50) DEFAULT 'in_stock',
  manage_stock      BOOLEAN DEFAULT true,
  category_id       UUID REFERENCES categories(id),
  brand_id          UUID REFERENCES brands(id),
  is_featured       BOOLEAN DEFAULT false,
  is_active         BOOLEAN DEFAULT true,
  created_at        TIMESTAMP DEFAULT NOW(),
  updated_at        TIMESTAMP DEFAULT NOW()
);

CREATE TABLE product_images (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id    UUID REFERENCES products(id) ON DELETE CASCADE,
  media_id      UUID REFERENCES media(id),
  is_primary    BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0
);

-- ── ATTRIBUTES ───────────────────────────────────────────────────────────────
CREATE TABLE attributes (
  id   UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL
);

CREATE TABLE attribute_values (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  attribute_id UUID REFERENCES attributes(id) ON DELETE CASCADE,
  value        VARCHAR(100) NOT NULL
);

CREATE TABLE product_variations (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id     UUID REFERENCES products(id) ON DELETE CASCADE,
  sku            VARCHAR(100) UNIQUE NOT NULL,
  price          NUMERIC(12,2) NOT NULL,
  sale_price     NUMERIC(12,2),
  stock_quantity INTEGER DEFAULT 0,
  image_id       UUID REFERENCES media(id),
  created_at     TIMESTAMP DEFAULT NOW()
);

CREATE TABLE variation_attribute_values (
  id                 UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  variation_id       UUID REFERENCES product_variations(id) ON DELETE CASCADE,
  attribute_value_id UUID REFERENCES attribute_values(id)
);

-- ── CART ─────────────────────────────────────────────────────────────────────
CREATE TABLE carts (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    UUID REFERENCES users(id),
  session_id VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE cart_items (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cart_id      UUID REFERENCES carts(id) ON DELETE CASCADE,
  product_id   UUID REFERENCES products(id),
  variation_id UUID REFERENCES product_variations(id),
  quantity     INTEGER NOT NULL DEFAULT 1
);

-- ── ORDERS ───────────────────────────────────────────────────────────────────
CREATE TABLE orders (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id          UUID REFERENCES users(id),
  order_number     VARCHAR(100) UNIQUE NOT NULL,
  status           VARCHAR(50) DEFAULT 'pending',
  subtotal         NUMERIC(12,2) NOT NULL,
  tax_amount       NUMERIC(12,2) DEFAULT 0,
  shipping_amount  NUMERIC(12,2) DEFAULT 0,
  discount_amount  NUMERIC(12,2) DEFAULT 0,
  total_amount     NUMERIC(12,2) NOT NULL,
  payment_status   VARCHAR(50) DEFAULT 'unpaid',
  payment_method   VARCHAR(100),
  billing_address  JSONB,
  shipping_address JSONB,
  created_at       TIMESTAMP DEFAULT NOW()
);

CREATE TABLE order_items (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id     UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id   UUID REFERENCES products(id),
  variation_id UUID REFERENCES product_variations(id),
  product_name VARCHAR(255),
  quantity     INTEGER NOT NULL,
  unit_price   NUMERIC(12,2) NOT NULL,
  total_price  NUMERIC(12,2) NOT NULL
);

-- ── PAYMENTS ─────────────────────────────────────────────────────────────────
CREATE TABLE payments (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id       UUID REFERENCES orders(id),
  transaction_id VARCHAR(255),
  provider       VARCHAR(100),
  amount         NUMERIC(12,2),
  currency       VARCHAR(10) DEFAULT 'USD',
  status         VARCHAR(50),
  paid_at        TIMESTAMP
);

-- ── COUPONS ──────────────────────────────────────────────────────────────────
CREATE TABLE coupons (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code        VARCHAR(100) UNIQUE NOT NULL,
  type        VARCHAR(50) NOT NULL,
  value       NUMERIC(12,2) NOT NULL,
  usage_limit INTEGER,
  expires_at  TIMESTAMP,
  is_active   BOOLEAN DEFAULT true,
  created_at  TIMESTAMP DEFAULT NOW()
);

CREATE TABLE coupon_usages (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  coupon_id  UUID REFERENCES coupons(id),
  user_id    UUID REFERENCES users(id),
  order_id   UUID REFERENCES orders(id)
);

-- ── REVIEWS ──────────────────────────────────────────────────────────────────
CREATE TABLE reviews (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id  UUID REFERENCES products(id) ON DELETE CASCADE,
  user_id     UUID REFERENCES users(id),
  rating      INTEGER CHECK (rating BETWEEN 1 AND 5),
  title       VARCHAR(255),
  comment     TEXT,
  is_approved BOOLEAN DEFAULT false,
  created_at  TIMESTAMP DEFAULT NOW()
);

-- ── SETTINGS ─────────────────────────────────────────────────────────────────
CREATE TABLE settings (
  id    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key   VARCHAR(150) UNIQUE NOT NULL,
  value TEXT
);

-- ============================================================
-- SEED DATA
-- Password for all users: Admin@1234  (bcrypt hash below)
-- ============================================================

INSERT INTO users (id, first_name, last_name, email, password_hash, role, status) VALUES
  ('11111111-0000-0000-0000-000000000001', 'Admin',   'User',    'admin@store.com',   '$2b$10$VR2E50n82k7rFGOOVc/OwussbBS.b4jnX63k2xpuGefhPsqhvIqYW', 'admin',    'active');
