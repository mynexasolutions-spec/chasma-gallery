"""
db.py — Connection pool, query helpers, and schema migrations.
"""
import os
import psycopg2
import psycopg2.extras
from psycopg2 import pool
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

_pool = None


def get_pool():
    global _pool
    if _pool is None:
        _pool = pool.ThreadedConnectionPool(2, 20, DATABASE_URL)
    return _pool


def get_conn():
    return get_pool().getconn()


def put_conn(conn):
    get_pool().putconn(conn)


def query(sql, params=None):
    conn = get_conn()
    try:
        with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:
            cur.execute(sql, params or ())
            return [dict(r) for r in cur.fetchall()]
    finally:
        put_conn(conn)


def query_one(sql, params=None):
    conn = get_conn()
    try:
        with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:
            cur.execute(sql, params or ())
            row = cur.fetchone()
            return dict(row) if row else None
    finally:
        put_conn(conn)


def execute(sql, params=None):
    conn = get_conn()
    try:
        with conn.cursor() as cur:
            cur.execute(sql, params or ())
            conn.commit()
            return cur.rowcount
    except Exception:
        conn.rollback()
        raise
    finally:
        put_conn(conn)


def execute_returning(sql, params=None):
    conn = get_conn()
    try:
        with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:
            cur.execute(sql, params or ())
            conn.commit()
            row = cur.fetchone()
            return dict(row) if row else None
    except Exception:
        conn.rollback()
        raise
    finally:
        put_conn(conn)


# ─── Schema migrations ────────────────────────────────────────────────────────

_MIGRATIONS = [
    """CREATE TABLE IF NOT EXISTS store_settings (
        key VARCHAR(100) PRIMARY KEY,
        value TEXT NOT NULL DEFAULT '',
        updated_at TIMESTAMP DEFAULT NOW()
    )""",
    """CREATE TABLE IF NOT EXISTS user_addresses (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL,
        label VARCHAR(50) DEFAULT 'Home',
        first_name VARCHAR(100) DEFAULT '',
        last_name VARCHAR(100) DEFAULT '',
        phone VARCHAR(20) DEFAULT '',
        address_line1 TEXT NOT NULL DEFAULT '',
        address_line2 TEXT DEFAULT '',
        city VARCHAR(100) DEFAULT '',
        state VARCHAR(100) DEFAULT '',
        pincode VARCHAR(20) DEFAULT '',
        country VARCHAR(100) DEFAULT 'India',
        is_default BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT NOW()
    )""",
    "ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_method VARCHAR(50) DEFAULT 'cod'",
    "ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_status VARCHAR(50) DEFAULT 'pending'",
    "ALTER TABLE orders ADD COLUMN IF NOT EXISTS order_number VARCHAR(50)",
    "ALTER TABLE orders ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMP",
    "ALTER TABLE orders ADD COLUMN IF NOT EXISTS cancel_reason TEXT DEFAULT ''",
    "ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_address_json TEXT DEFAULT ''",
    "ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_name VARCHAR(200) DEFAULT ''",
    "ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_email VARCHAR(200) DEFAULT ''",
    "ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_phone VARCHAR(20) DEFAULT ''",
    "ALTER TABLE orders ADD COLUMN IF NOT EXISTS notes TEXT DEFAULT ''",
    "ALTER TABLE order_items ADD COLUMN IF NOT EXISTS variation_id UUID",
    "ALTER TABLE order_items ADD COLUMN IF NOT EXISTS quantity INTEGER DEFAULT 1",
    "ALTER TABLE order_items ADD COLUMN IF NOT EXISTS unit_price NUMERIC(10,2) DEFAULT 0",
    "ALTER TABLE order_items ADD COLUMN IF NOT EXISTS total_price NUMERIC(10,2) DEFAULT 0",
    "ALTER TABLE order_items ADD COLUMN IF NOT EXISTS product_name_snapshot TEXT DEFAULT ''",
    "ALTER TABLE attribute_values DROP COLUMN IF EXISTS stock_quantity",
     """UPDATE orders
         SET order_number = 'ORD-' || UPPER(SUBSTRING(REPLACE(id::text, '-', '') FROM 1 FOR 12))
         WHERE order_number IS NULL OR order_number = ''""",
    """UPDATE products p
       SET price = v.variation_price
       FROM (
           SELECT product_id, MIN(NULLIF(price, 0)) AS variation_price
           FROM product_variations
           GROUP BY product_id
       ) v
       WHERE p.id = v.product_id
         AND COALESCE(NULLIF(p.price, 0), 0) = 0
         AND v.variation_price IS NOT NULL""",
    """UPDATE product_variations pv
       SET price = COALESCE(p.price, 0),
           sale_price = p.sale_price,
           stock_quantity = COALESCE(p.stock_quantity, 0)
       FROM products p
       WHERE p.id = pv.product_id""",
    """CREATE OR REPLACE FUNCTION sync_variation_pricing_from_product()
       RETURNS TRIGGER AS $$
       DECLARE parent_row RECORD;
       BEGIN
           SELECT price, sale_price, stock_quantity
           INTO parent_row
           FROM products
           WHERE id = NEW.product_id;

           IF FOUND THEN
               NEW.price = COALESCE(parent_row.price, 0);
               NEW.sale_price = parent_row.sale_price;
               NEW.stock_quantity = COALESCE(parent_row.stock_quantity, 0);
           END IF;

           RETURN NEW;
       END;
       $$ LANGUAGE plpgsql""",
    "DROP TRIGGER IF EXISTS trg_sync_variation_pricing ON product_variations",
    """CREATE TRIGGER trg_sync_variation_pricing
       BEFORE INSERT OR UPDATE ON product_variations
       FOR EACH ROW
       EXECUTE FUNCTION sync_variation_pricing_from_product()""",
    """CREATE OR REPLACE FUNCTION sync_variations_from_product()
       RETURNS TRIGGER AS $$
       BEGIN
           UPDATE product_variations
              SET price = COALESCE(NEW.price, 0),
                  sale_price = NEW.sale_price,
                  stock_quantity = COALESCE(NEW.stock_quantity, 0)
            WHERE product_id = NEW.id;

           RETURN NEW;
       END;
       $$ LANGUAGE plpgsql""",
    "DROP TRIGGER IF EXISTS trg_sync_variations_from_product ON products",
    """CREATE TRIGGER trg_sync_variations_from_product
       AFTER UPDATE OF price, sale_price, stock_quantity ON products
       FOR EACH ROW
       EXECUTE FUNCTION sync_variations_from_product()""",
     """CREATE OR REPLACE FUNCTION set_order_number_if_missing()
         RETURNS TRIGGER AS $$
         BEGIN
              IF NEW.order_number IS NULL OR NEW.order_number = '' THEN
                    NEW.order_number := 'ORD-' || UPPER(SUBSTRING(REPLACE(gen_random_uuid()::text, '-', '') FROM 1 FOR 12));
              END IF;
              RETURN NEW;
         END;
         $$ LANGUAGE plpgsql""",
     "DROP TRIGGER IF EXISTS trg_set_order_number_if_missing ON orders",
     """CREATE TRIGGER trg_set_order_number_if_missing
         BEFORE INSERT ON orders
         FOR EACH ROW
         EXECUTE FUNCTION set_order_number_if_missing()""",
    """INSERT INTO store_settings (key, value) VALUES
         ('cod_enabled','true'), ('online_payment_enabled','false'),
         ('upi_id',''), ('bank_name',''), ('bank_account',''), ('bank_ifsc',''),
         ('razorpay_key_id',''), ('razorpay_key_secret','')
       ON CONFLICT (key) DO NOTHING""",

    # ── Coupon usage tracking + order discount columns ─────────────────────
    "ALTER TABLE orders ADD COLUMN IF NOT EXISTS coupon_code VARCHAR(100) DEFAULT ''",
    "ALTER TABLE orders ADD COLUMN IF NOT EXISTS discount_amount NUMERIC(10,2) DEFAULT 0",
    """CREATE TABLE IF NOT EXISTS coupon_usages (
        id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        coupon_id  UUID NOT NULL,
        user_id    UUID NOT NULL,
        order_id   UUID NOT NULL,
        used_at    TIMESTAMP DEFAULT NOW()
    )""",
    "CREATE INDEX IF NOT EXISTS idx_coupon_usages_coupon_id ON coupon_usages(coupon_id)",
    "CREATE INDEX IF NOT EXISTS idx_coupon_usages_user_id   ON coupon_usages(user_id)",

    # ── Performance indexes ─────────────────────────────────────────────────
    "CREATE INDEX IF NOT EXISTS idx_products_is_active       ON products(is_active)",
    "CREATE INDEX IF NOT EXISTS idx_products_category_id     ON products(category_id)",
    "CREATE INDEX IF NOT EXISTS idx_products_brand_id        ON products(brand_id)",
    "CREATE INDEX IF NOT EXISTS idx_products_is_featured     ON products(is_featured) WHERE is_featured = TRUE",
    "CREATE INDEX IF NOT EXISTS idx_products_created_at      ON products(created_at DESC)",
    "CREATE INDEX IF NOT EXISTS idx_products_price           ON products(price)",
    "CREATE INDEX IF NOT EXISTS idx_products_active_created  ON products(is_active, created_at DESC)",
    "CREATE INDEX IF NOT EXISTS idx_product_images_prod_pri  ON product_images(product_id, is_primary)",
    "CREATE INDEX IF NOT EXISTS idx_product_variations_pid   ON product_variations(product_id)",
    "CREATE INDEX IF NOT EXISTS idx_vav_variation_id         ON variation_attribute_values(variation_id)",
    "CREATE INDEX IF NOT EXISTS idx_vav_value_id             ON variation_attribute_values(attribute_value_id)",
    "CREATE INDEX IF NOT EXISTS idx_attr_values_attr_id      ON attribute_values(attribute_id)",
    "CREATE INDEX IF NOT EXISTS idx_orders_user_id           ON orders(user_id)",
    "CREATE INDEX IF NOT EXISTS idx_orders_status            ON orders(status)",
    "CREATE INDEX IF NOT EXISTS idx_order_items_order_id     ON order_items(order_id)",
    "CREATE INDEX IF NOT EXISTS idx_user_addresses_user_id   ON user_addresses(user_id)",
    "CREATE INDEX IF NOT EXISTS idx_categories_slug          ON categories(slug)",
    "CREATE INDEX IF NOT EXISTS idx_brands_slug              ON brands(slug)",
    "CREATE INDEX IF NOT EXISTS idx_product_reviews_pid      ON product_reviews(product_id, is_approved)",
    "CREATE INDEX IF NOT EXISTS idx_attributes_slug          ON attributes(slug)",
]


def migrate():
    for sql in _MIGRATIONS:
        try:
            execute(sql, [])
        except Exception as e:
            print(f"[db.migrate] Warning: {e}")
