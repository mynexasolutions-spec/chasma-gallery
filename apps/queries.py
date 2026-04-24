import math
import db

PRODUCTS_SELECT = """
    SELECT
        p.id, p.name, p.slug, p.sku, p.type, p.short_description, p.description,
        COALESCE(
            CASE WHEN p.type = 'variable' THEN (
                SELECT MIN(price) FROM product_variations pv 
                WHERE pv.product_id = p.id AND pv.price > 0
            ) END, 
            p.price
        ) AS price, 
        p.sale_price, p.stock_quantity, p.stock_status,
        p.is_featured, p.is_active, p.created_at,
        c.name  AS category_name, c.slug AS category_slug,
        b.name  AS brand_name,    b.slug AS brand_slug,
        m.file_url AS image_url
    FROM products p
    LEFT JOIN categories c ON c.id = p.category_id
    LEFT JOIN brands b      ON b.id = p.brand_id
    LEFT JOIN product_images pi ON pi.product_id = p.id AND pi.is_primary = TRUE
    LEFT JOIN media m ON m.id = pi.media_id
"""

PRODUCTS_MINIMAL_SELECT = """
    SELECT
        p.id, p.name, p.slug, p.sku, p.type, 
        COALESCE(
            CASE WHEN p.type = 'variable' THEN (
                SELECT MIN(price) FROM product_variations pv 
                WHERE pv.product_id = p.id AND pv.price > 0
            ) END, 
            p.price
        ) AS price, 
        p.sale_price, p.stock_status,
        c.name AS category_name, c.slug AS category_slug,
        m.file_url AS image_url
    FROM products p
    LEFT JOIN categories c ON c.id = p.category_id
    LEFT JOIN product_images pi ON pi.product_id = p.id AND pi.is_primary = TRUE
    LEFT JOIN media m ON m.id = pi.media_id
"""


def get_products(search=None, category=None, brand=None, shape=None,
                 sort="created_at_desc", page=1, per_page=16,
                 featured=False, limit=None):
    # Base conditions
    conditions = ["p.is_active = TRUE"]
    
    # Calculate display price for filtering if needed (same logic as above)
    price_subquery = "COALESCE(CASE WHEN p.type = 'variable' THEN (SELECT MIN(price) FROM product_variations pv WHERE pv.product_id = p.id AND pv.price > 0) END, p.price)"
    
    # Allow 0 price for testing, but ensure we don't crash
    conditions.append(f"{price_subquery} >= 0")
    
    params = []

    if search:
        conditions.append("(p.name ILIKE %s OR p.sku ILIKE %s OR p.description ILIKE %s)")
        params += [f"%{search}%", f"%{search}%", f"%{search}%"]
    if category:
        conditions.append("(c.slug = %s OR c.id::text = %s)")
        params += [category, category]
    if brand:
        conditions.append("(b.slug = %s OR b.id::text = %s)")
        params += [brand, brand]
    if featured:
        conditions.append("p.is_featured = TRUE")
    if shape:
        conditions.append(f"""
            (EXISTS (
                SELECT 1 FROM product_variations pv
                JOIN variation_attribute_values vav ON vav.variation_id = pv.id
                JOIN attribute_values av ON av.id = vav.attribute_value_id
                WHERE pv.product_id = p.id AND av.value ILIKE %s
            ) OR p.name ILIKE %s OR p.short_description ILIKE %s)
        """)
        params += [f"%{shape}%", f"%{shape}%", f"%{shape}%"]

    where = "WHERE " + " AND ".join(conditions)
    order_map = {
        "created_at_desc": "p.created_at DESC",
        "created_at_asc":  "p.created_at ASC",
        "price_asc":       "p.price ASC",
        "price_desc":      "p.price DESC",
        "name_asc":        "p.name ASC",
    }
    glasses_priority = "CASE WHEN c.slug IN ('eyeglasses', 'sunglasses') THEN 0 ELSE 1 END"
    order = f"{glasses_priority}, {order_map.get(sort, 'p.created_at DESC')}"
    base_select = PRODUCTS_MINIMAL_SELECT if limit or per_page <= 20 else PRODUCTS_SELECT

    if limit:
        return db.query(f"{base_select} {where} ORDER BY {order} LIMIT %s", params + [limit])

    count_sql = (
        "SELECT COUNT(*) AS cnt FROM products p "
        "LEFT JOIN categories c ON c.id = p.category_id "
        "LEFT JOIN brands b ON b.id = p.brand_id "
        f"{where}"
    )
    total_row = db.query_one(count_sql, params)
    total = total_row["cnt"] if total_row else 0
    total_pages = max(1, math.ceil(total / per_page))
    offset = (page - 1) * per_page
    products = db.query(
        f"{PRODUCTS_SELECT} {where} ORDER BY {order} LIMIT %s OFFSET %s",
        params + [per_page, offset]
    )
    return products, total, total_pages


def get_product_detail(product_id):
    product = db.query_one(f"{PRODUCTS_SELECT} WHERE p.id = %s", [product_id])
    if not product:
        return None, [], [], [], []
    images = db.query(
        """SELECT m.file_url AS image_url, pi.is_primary,
                  COALESCE(m.alt_text, '') AS alt_text
           FROM product_images pi
           JOIN media m ON m.id = pi.media_id
           WHERE pi.product_id=%s ORDER BY pi.is_primary DESC, pi.display_order""",
        [product_id]
    )
    variations = db.query(
        "SELECT * FROM product_variations WHERE product_id=%s", [product_id]
    )
    for v in variations:
        v["attribute_value_ids"] = [
            row["attribute_value_id"] for row in db.query(
                "SELECT attribute_value_id FROM variation_attribute_values WHERE variation_id = %s",
                [v["id"]]
            )
        ]
    reviews = db.query(
        """SELECT r.*, (u.first_name || ' ' || u.last_name) AS reviewer_name
           FROM product_reviews r LEFT JOIN users u ON u.id = r.user_id
           WHERE r.product_id=%s AND r.is_approved=TRUE ORDER BY r.created_at DESC""",
        [product_id]
    )
    attributes = db.query("""
        SELECT a.id, a.name, a.slug
        FROM attributes a
        JOIN product_attributes pa ON pa.attribute_id = a.id
        WHERE pa.product_id = %s
        ORDER BY pa.display_order ASC
    """, [product_id])
    if not attributes:
        attributes = db.query("""
            SELECT DISTINCT a.id, a.name, a.slug
            FROM attributes a
            JOIN attribute_values av ON av.attribute_id = a.id
            JOIN variation_attribute_values vav ON vav.attribute_value_id = av.id
            JOIN product_variations pv ON pv.id = vav.variation_id
            WHERE pv.product_id = %s
        """, [product_id])
    for attr in attributes:
        attr["values"] = db.query("""
            SELECT DISTINCT av.id, av.value
            FROM attribute_values av
            JOIN variation_attribute_values vav ON vav.attribute_value_id = av.id
            JOIN product_variations pv ON pv.id = vav.variation_id
            WHERE av.attribute_id = %s AND pv.product_id = %s
            ORDER BY av.value ASC
        """, [attr["id"], product_id])
    return product, images, variations, reviews, attributes


def get_related_products(category_slug, exclude_id, limit=4):
    return db.query(
        f"{PRODUCTS_SELECT} WHERE p.is_active=TRUE AND c.slug=%s AND p.id != %s ORDER BY RANDOM() LIMIT %s",
        [category_slug, exclude_id, limit]
    )


def get_categories():
    return db.query("""
        SELECT c.id, c.name, c.slug, c.parent_id, cp.name AS parent_name, c.image_url as img,
               COUNT(p.id) AS product_count
        FROM categories c
        LEFT JOIN categories cp ON cp.id = c.parent_id
        LEFT JOIN products p ON p.category_id = c.id AND p.is_active=TRUE
        GROUP BY c.id, c.name, c.slug, c.parent_id, cp.name, c.image_url
        ORDER BY
            CASE WHEN c.slug = 'eyeglasses' THEN 0
                 WHEN c.slug = 'contacts' THEN 1
                 WHEN c.slug = 'sunglasses' THEN 2
                 ELSE 3 END ASC,
            c.name ASC
    """)


def get_brands():
    return db.query("""
        SELECT b.id, b.name, b.slug, COUNT(p.id) AS product_count
        FROM brands b
        LEFT JOIN products p ON p.brand_id = b.id AND p.is_active=TRUE
        GROUP BY b.id, b.name, b.slug
        ORDER BY b.name
    """)


def get_admin_stats():
    stats = {}
    stats["total_products"] = (db.query_one("SELECT COUNT(*) AS cnt FROM products WHERE is_active=TRUE") or {}).get("cnt", 0)
    stats["total_orders"] = (db.query_one("SELECT COUNT(*) AS cnt FROM orders") or {}).get("cnt", 0)
    stats["total_revenue"] = float((db.query_one("SELECT COALESCE(SUM(total_amount),0) AS rev FROM orders WHERE status != 'cancelled'") or {}).get("rev", 0))
    stats["total_customers"] = (db.query_one("SELECT COUNT(*) AS cnt FROM users WHERE role='customer'") or {}).get("cnt", 0)
    stats["pending_orders"] = (db.query_one("SELECT COUNT(*) AS cnt FROM orders WHERE status='pending'") or {}).get("cnt", 0)
    stats["low_stock"] = (db.query_one("SELECT COUNT(*) AS cnt FROM products WHERE stock_quantity <= 5 AND is_active=TRUE") or {}).get("cnt", 0)
    return stats
