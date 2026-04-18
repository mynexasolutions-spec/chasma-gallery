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
        _pool = pool.ThreadedConnectionPool(1, 10, DATABASE_URL)
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
    """INSERT INTO store_settings (key, value) VALUES
         ('cod_enabled','true'), ('online_payment_enabled','false'),
         ('upi_id',''), ('bank_name',''), ('bank_account',''), ('bank_ifsc',''),
         ('razorpay_key_id',''), ('razorpay_key_secret','')
       ON CONFLICT (key) DO NOTHING""",
]


def migrate():
    for sql in _MIGRATIONS:
        try:
            execute(sql, [])
        except Exception as e:
            print(f"[db.migrate] Warning: {e}")
