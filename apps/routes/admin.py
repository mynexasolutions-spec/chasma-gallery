import csv
import io
import uuid
import itertools
import uuid
from functools import wraps
from flask import render_template, request, redirect, url_for, flash, abort, session
import db
from helpers import slugify, get_store_settings, get_unique_slug
from queries import get_products, get_categories, get_brands, get_admin_stats, PRODUCTS_SELECT


def generate_variations(product_id):
    rows = db.query("""
        SELECT av.attribute_id, av.id as value_id, av.stock_quantity
        FROM product_attribute_values pav
        JOIN attribute_values av ON av.id = pav.attribute_value_id
        WHERE pav.product_id = %s
    """, [product_id])
    grouped = {}
    value_stocks = {}
    for r in rows:
        grouped.setdefault(r["attribute_id"], []).append(r["value_id"])
        value_stocks[r["value_id"]] = r["stock_quantity"]
    
    if not grouped:
        return
    
    combinations = list(itertools.product(*grouped.values()))
    existing_vars = db.query("SELECT id FROM product_variations WHERE product_id = %s", [product_id])
    existing_combos = []
    for ev in existing_vars:
        vals = db.query("SELECT attribute_value_id FROM variation_attribute_values WHERE variation_id = %s", [ev["id"]])
        existing_combos.append(set(v["attribute_value_id"] for v in vals))
    
    product = db.query_one("SELECT price, sku FROM products WHERE id = %s", [product_id])
    base_price = product["price"] if product else 0
    base_sku = product["sku"] if product and product["sku"] else "VAR"
    
    for combo in combinations:
        if any(set(combo) == ec for ec in existing_combos):
            continue
        
        # Default stock is the minimum stock among the selected attribute values
        default_stock = min([value_stocks.get(vid, 0) for vid in combo]) if combo else 0
        
        var_id = str(uuid.uuid4())
        var_sku = f"{base_sku}-{uuid.uuid4().hex[:6].upper()}"
        db.execute(
            "INSERT INTO product_variations (id, product_id, sku, price, stock_quantity) VALUES (%s,%s,%s,%s,%s)",
            [var_id, product_id, var_sku, base_price, default_stock]
        )
        for val_id in combo:
            db.execute(
                "INSERT INTO variation_attribute_values (id, variation_id, attribute_value_id) VALUES (%s,%s,%s)",
                [str(uuid.uuid4()), var_id, val_id]
            )

def require_admin(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        user = session.get("user")
        if not user:
            flash("Please log in to continue.", "error")
            return redirect(url_for("auth.login", next=request.url))
        if user.get("role") not in ("admin", "manager"):
            flash("You do not have permission to access this page.", "error")
            return redirect(url_for("public.index"))
        return f(*args, **kwargs)
    return decorated


def register(app):

    # ── Dashboard ──────────────────────────────────────────────────────────────

    @app.route("/admin/")
    @app.route("/admin")
    @require_admin
    def admin_dashboard():
        try:
            stats           = get_admin_stats()
            recent_orders   = db.query(
                """SELECT o.id, o.created_at, o.total_amount, o.status,
                          (u.first_name || ' ' || u.last_name) AS customer_name, u.email AS customer_email
                   FROM orders o LEFT JOIN users u ON u.id = o.user_id
                   ORDER BY o.created_at DESC LIMIT 10"""
            )
            recent_products = db.query(
                f"{PRODUCTS_SELECT} WHERE p.is_active=TRUE ORDER BY p.created_at DESC LIMIT 8"
            )
            chart_rows      = db.query("""
                SELECT TO_CHAR(created_at, 'Mon DD') as day, SUM(total_amount) as amount
                FROM orders
                WHERE created_at >= CURRENT_DATE - INTERVAL '7 days' AND status != 'cancelled'
                GROUP BY day, DATE(created_at) ORDER BY DATE(created_at)
            """)
            chart_data = {
                "labels": [r["day"] for r in chart_rows],
                "values": [float(r["amount"]) for r in chart_rows],
            }
        except Exception as e:
            stats, recent_orders, recent_products = {}, [], []
            chart_data = {"labels": [], "values": []}
            flash(f"Error: {e}", "error")
        return render_template(
            "admin/dashboard.html",
            stats=stats, recent_orders=recent_orders,
            recent_products=recent_products, chart_data=chart_data,
        )

    # ── Products ───────────────────────────────────────────────────────────────

    @app.route("/admin/products")
    @require_admin
    def admin_products():
        search   = request.args.get("search", "").strip()
        category = request.args.get("category", "").strip()
        brand    = request.args.get("brand", "").strip()
        page     = max(1, int(request.args.get("page", 1)))
        try:
            products, total, total_pages = get_products(
                search=search, category=category, brand=brand, page=page, per_page=20
            )
            if products:
                print(f"DEBUG: First product '{products[0]['name']}' price: {products[0]['price']}")
            categories = get_categories()
            brands     = get_brands()
        except Exception as e:
            products, total, total_pages = [], 0, 1
            categories = brands = []
            flash(f"Error: {e}", "error")
        return render_template(
            "admin/products.html",
            products=products, total=total, total_pages=total_pages, page=page,
            categories=categories, brands=brands,
            search=search, selected_category=category, selected_brand=brand,
        )

    @app.route("/admin/products/new", methods=["GET", "POST"])
    @require_admin
    def admin_product_new():
        categories     = get_categories()
        brands         = get_brands()
        all_attributes = db.query("SELECT * FROM attributes ORDER BY name ASC")
        for attr in all_attributes:
            attr["options"] = db.query(
                "SELECT * FROM attribute_values WHERE attribute_id = %s ORDER BY value ASC", [attr["id"]]
            )
        if request.method == "POST":
            f = request.form
            if f.get("type") == "variable":
                attr_ids = request.form.getlist("attribute_ids")
                val_ids = request.form.getlist("attribute_value_ids")
                
                if not attr_ids:
                    flash("Variable products must have at least one attribute selected.", "error")
                    return redirect(url_for("admin_product_new"))
                
                # Check if each selected attribute has at least one value
                for aid in attr_ids:
                    # Get values for this specific attribute from the database
                    valid_vals = db.query("SELECT id FROM attribute_values WHERE attribute_id = %s", [aid])
                    valid_val_ids = [v["id"] for v in valid_vals]
                    # Check if any of the selected val_ids belong to this attribute
                    if not any(vid in valid_val_ids for vid in val_ids):
                        flash(f"Please select at least one value for the selected attributes.", "error")
                        return redirect(url_for("admin_product_new"))
            try:
                stock_qty = int(f.get("stock_quantity") or 0)
                stock_status = f.get("stock_status", "in_stock")
                if stock_qty <= 0:
                    stock_status = "out_of_stock"
                elif stock_status == "out_of_stock" and stock_qty > 0:
                    stock_status = "in_stock"

                name = f.get("name")
                slug = get_unique_slug("products", f.get("slug") or slugify(name))
                sku  = f.get("sku", "").strip() or None

                product_id = db.execute_returning(
                    """INSERT INTO products
                       (id, name, slug, sku, type, description, short_description,
                        price, sale_price, stock_quantity, stock_status, manage_stock,
                        category_id, brand_id, is_featured, is_active)
                       VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s) RETURNING id""",
                    [
                        str(uuid.uuid4()), name, slug, sku,
                        f.get("type", "simple"), f.get("description"), f.get("short_description"),
                        float(f.get("price") or 0), float(f.get("sale_price") or 0) or None,
                        stock_qty, stock_status, True,
                        f.get("category_id") or None, f.get("brand_id") or None,
                        f.get("is_featured") == "on", f.get("is_active", "on") == "on",
                    ]
                )["id"]
                for attr_id in request.form.getlist("attribute_ids"):
                    db.execute(
                        "INSERT INTO product_attributes (id, product_id, attribute_id) VALUES (%s,%s,%s)",
                        [str(uuid.uuid4()), product_id, attr_id]
                    )
                for val_id in request.form.getlist("attribute_value_ids"):
                    db.execute(
                        "INSERT INTO product_attribute_values (id, product_id, attribute_value_id) VALUES (%s,%s,%s)",
                        [str(uuid.uuid4()), product_id, val_id]
                    )
                if f.get("type") == "variable":
                    generate_variations(product_id)
                flash("Product created successfully.", "success")
                return redirect(url_for("admin_products"))
            except Exception as e:
                flash(f"Error creating product: {e}", "error")
        return render_template(
            "admin/product_form.html",
            product=None, categories=categories, brands=brands,
            all_attributes=all_attributes, action="new",
        )

    @app.route("/admin/products/<product_id>/edit", methods=["GET", "POST"])
    @require_admin
    def admin_product_edit(product_id):
        product = db.query_one("SELECT * FROM products WHERE id=%s", [product_id])
        if not product:
            abort(404)
        categories     = get_categories()
        brands         = get_brands()
        all_attributes = db.query("SELECT * FROM attributes ORDER BY name ASC")
        for attr in all_attributes:
            attr["options"] = db.query(
                "SELECT * FROM attribute_values WHERE attribute_id = %s ORDER BY value ASC", [attr["id"]]
            )
        if request.method == "POST":
            f = request.form
            if f.get("type") == "variable":
                attr_ids = request.form.getlist("attribute_ids")
                val_ids = request.form.getlist("attribute_value_ids")
                
                if not attr_ids:
                    flash("Variable products must have at least one attribute selected.", "error")
                    return redirect(url_for("admin_product_edit", product_id=product_id))
                
                for aid in attr_ids:
                    valid_vals = db.query("SELECT id FROM attribute_values WHERE attribute_id = %s", [aid])
                    valid_val_ids = [v["id"] for v in valid_vals]
                    if not any(vid in valid_val_ids for vid in val_ids):
                        flash(f"Please select at least one value for the selected attributes.", "error")
                        return redirect(url_for("admin_product_edit", product_id=product_id))
            try:
                stock_qty = int(f.get("stock_quantity") or 0)
                stock_status = f.get("stock_status", "in_stock")
                if stock_qty <= 0:
                    stock_status = "out_of_stock"
                elif stock_status == "out_of_stock" and stock_qty > 0:
                    stock_status = "in_stock"

                name = f.get("name")
                slug = get_unique_slug("products", f.get("slug") or slugify(name), exclude_id=product_id)
                sku  = f.get("sku", "").strip() or None

                db.execute(
                    """UPDATE products SET
                       name=%s, slug=%s, sku=%s, type=%s, description=%s,
                       short_description=%s, price=%s, sale_price=%s,
                       stock_quantity=%s, stock_status=%s, category_id=%s,
                       brand_id=%s, is_featured=%s, is_active=%s WHERE id=%s""",
                    [
                        name, slug, sku, f.get("type", "simple"),
                        f.get("description"), f.get("short_description"),
                        float(f.get("price") or 0), float(f.get("sale_price") or 0) or None,
                        stock_qty, stock_status,
                        f.get("category_id") or None, f.get("brand_id") or None,
                        f.get("is_featured") == "on", f.get("is_active") == "on", product_id,
                    ]
                )
                image_url = f.get("image_url", "").strip()
                if image_url:
                    media = db.query_one("SELECT id FROM media WHERE file_url=%s", [image_url])
                    if not media:
                        media_id = str(uuid.uuid4())
                        db.execute("INSERT INTO media (id, file_url) VALUES (%s,%s)", [media_id, image_url])
                    else:
                        media_id = media["id"]
                    existing_pi = db.query_one(
                        "SELECT id FROM product_images WHERE product_id=%s AND is_primary=TRUE", [product_id]
                    )
                    if existing_pi:
                        db.execute("UPDATE product_images SET media_id=%s WHERE id=%s", [media_id, existing_pi["id"]])
                    else:
                        db.execute(
                            "INSERT INTO product_images (id, product_id, media_id, is_primary) VALUES (%s,%s,%s,TRUE)",
                            [str(uuid.uuid4()), product_id, media_id]
                        )
                db.execute("DELETE FROM product_attributes WHERE product_id = %s", [product_id])
                for attr_id in request.form.getlist("attribute_ids"):
                    db.execute(
                        "INSERT INTO product_attributes (id, product_id, attribute_id) VALUES (%s,%s,%s)",
                        [str(uuid.uuid4()), product_id, attr_id]
                    )
                db.execute("DELETE FROM product_attribute_values WHERE product_id = %s", [product_id])
                for val_id in request.form.getlist("attribute_value_ids"):
                    db.execute(
                        "INSERT INTO product_attribute_values (id, product_id, attribute_value_id) VALUES (%s,%s,%s)",
                        [str(uuid.uuid4()), product_id, val_id]
                    )
                if f.get("type") == "variable":
                    generate_variations(product_id)
                flash("Product updated successfully.", "success")
                return redirect(url_for("admin_products"))
            except Exception as e:
                flash(f"Error updating product: {e}", "error")
        img = db.query_one(
            "SELECT m.file_url FROM product_images pi JOIN media m ON m.id = pi.media_id "
            "WHERE pi.product_id=%s AND pi.is_primary=TRUE LIMIT 1",
            [product_id]
        )
        product["image_url"] = img["file_url"] if img else ""
        product_attribute_ids = [
            a["attribute_id"] for a in db.query(
                "SELECT attribute_id FROM product_attributes WHERE product_id = %s", [product_id]
            )
        ]
        selected_value_ids = [
            v["attribute_value_id"] for v in db.query(
                "SELECT attribute_value_id FROM product_attribute_values WHERE product_id = %s", [product_id]
            )
        ]
        variations = []
        if product["type"] == "variable":
            variations = db.query("""
                SELECT v.*,
                       (SELECT string_agg(av.value, ' / ')
                        FROM variation_attribute_values vav
                        JOIN attribute_values av ON av.id = vav.attribute_value_id
                        WHERE vav.variation_id = v.id) as option_names
                FROM product_variations v WHERE v.product_id = %s ORDER BY v.sku ASC
            """, [product_id])

        return render_template(
            "admin/product_form.html",
            product=product, categories=categories, brands=brands,
            all_attributes=all_attributes,
            product_attribute_ids=product_attribute_ids,
            selected_value_ids=selected_value_ids, action="edit",
            variations=variations
        )

    @app.route("/admin/products/<product_id>/delete", methods=["POST"])
    @require_admin
    def admin_product_delete(product_id):
        try:
            db.execute("UPDATE products SET is_active=FALSE WHERE id=%s", [product_id])
            flash("Product deleted (deactivated).", "success")
        except Exception as e:
            flash(f"Error: {e}", "error")
        return redirect(url_for("admin_products"))

    # ── Categories ─────────────────────────────────────────────────────────────

    @app.route("/admin/categories")
    @require_admin
    def admin_categories():
        try:
            categories = get_categories()
        except Exception as e:
            categories = []
            flash(f"Error: {e}", "error")
        return render_template("admin/categories.html", categories=categories)

    @app.route("/admin/categories/new", methods=["GET", "POST"])
    @require_admin
    def admin_category_new():
        if request.method == "POST":
            name       = request.form.get("name")
            slug       = request.form.get("slug") or slugify(name)
            parent_id  = request.form.get("parent_id") or None
            image_url  = request.form.get("image_url") or None
            is_featured = request.form.get("is_featured") == "on"
            try:
                db.execute(
                    "INSERT INTO categories (id, name, slug, parent_id, image_url, is_featured) VALUES (%s,%s,%s,%s,%s,%s)",
                    [str(uuid.uuid4()), name, slug, parent_id, image_url, is_featured]
                )
                flash("Category created", "success")
                return redirect(url_for("admin_categories"))
            except Exception as e:
                flash(f"Error: {e}", "error")
        return render_template("admin/category_form.html", category=None, categories=get_categories())

    @app.route("/admin/categories/<cat_id>/edit", methods=["GET", "POST"])
    @require_admin
    def admin_category_edit(cat_id):
        category = db.query_one("SELECT * FROM categories WHERE id = %s", [cat_id])
        if not category:
            abort(404)
        if request.method == "POST":
            try:
                db.execute(
                    "UPDATE categories SET name=%s, slug=%s, parent_id=%s, image_url=%s, is_featured=%s WHERE id=%s",
                    [request.form.get("name"), request.form.get("slug"),
                     request.form.get("parent_id") or None, request.form.get("image_url") or None,
                     request.form.get("is_featured") == "on", cat_id]
                )
                flash("Category updated", "success")
                return redirect(url_for("admin_categories"))
            except Exception as e:
                flash(f"Error: {e}", "error")
        return render_template("admin/category_form.html", category=category, categories=get_categories())

    @app.route("/admin/categories/<cat_id>/delete", methods=["POST"])
    @require_admin
    def admin_category_delete(cat_id):
        try:
            db.execute("DELETE FROM categories WHERE id=%s", [cat_id])
            flash("Category deleted.", "success")
        except Exception as e:
            flash(f"Error: {e}", "error")
        return redirect(url_for("admin_categories"))

    # ── Brands ─────────────────────────────────────────────────────────────────

    @app.route("/admin/brands")
    @require_admin
    def admin_brands():
        try:
            brands = get_brands()
        except Exception as e:
            brands = []
            flash(f"Error: {e}", "error")
        return render_template("admin/brands.html", brands=brands)

    @app.route("/admin/brands/new", methods=["GET", "POST"])
    @require_admin
    def admin_brand_new():
        if request.method == "POST":
            f = request.form
            try:
                db.execute("INSERT INTO brands (name, slug) VALUES (%s,%s)", [f.get("name"), f.get("slug")])
                flash("Brand created.", "success")
                return redirect(url_for("admin_brands"))
            except Exception as e:
                flash(f"Error: {e}", "error")
        return render_template("admin/brand_form.html", brand=None)

    @app.route("/admin/brands/<brand_id>/delete", methods=["POST"])
    @require_admin
    def admin_brand_delete(brand_id):
        try:
            db.execute("DELETE FROM brands WHERE id=%s", [brand_id])
            flash("Brand deleted.", "success")
        except Exception as e:
            flash(f"Error: {e}", "error")
        return redirect(url_for("admin_brands"))

    # ── Orders ─────────────────────────────────────────────────────────────────

    @app.route("/admin/orders")
    @require_admin
    def admin_orders():
        import math
        page     = max(1, int(request.args.get("page", 1)))
        per_page = 20
        offset   = (page - 1) * per_page
        try:
            orders = db.query(
                """SELECT o.id, o.created_at, o.total_amount, o.status,
                          (u.first_name || ' ' || u.last_name) AS customer_name,
                          u.email AS customer_email, COUNT(oi.id) AS item_count
                   FROM orders o
                   LEFT JOIN users u  ON u.id = o.user_id
                   LEFT JOIN order_items oi ON oi.order_id = o.id
                   GROUP BY o.id, o.created_at, o.total_amount, o.status, u.first_name, u.last_name, u.email
                   ORDER BY o.created_at DESC LIMIT %s OFFSET %s""",
                [per_page, offset]
            )
            total       = (db.query_one("SELECT COUNT(*) AS cnt FROM orders") or {}).get("cnt", 0)
            total_pages = max(1, math.ceil(total / per_page))
        except Exception as e:
            orders, total, total_pages = [], 0, 1
            flash(f"Error: {e}", "error")
        return render_template(
            "admin/orders.html", orders=orders, total=total, total_pages=total_pages, page=page
        )

    @app.route("/admin/orders/<order_id>")
    @require_admin
    def admin_order_detail(order_id):
        try:
            order = db.query_one(
                """SELECT o.*, (u.first_name || ' ' || u.last_name) AS customer_name, u.email AS customer_email
                   FROM orders o LEFT JOIN users u ON u.id = o.user_id WHERE o.id=%s""",
                [order_id]
            )
            if not order:
                abort(404)
            items = db.query(
                "SELECT oi.*, p.name AS product_name, p.sku FROM order_items oi "
                "LEFT JOIN products p ON p.id = oi.product_id WHERE oi.order_id=%s",
                [order_id]
            )
        except Exception as e:
            flash(f"Error: {e}", "error")
            return redirect(url_for("admin_orders"))
        return render_template("admin/order_detail.html", order=order, items=items)

    @app.route("/admin/orders/<order_id>/status", methods=["POST"])
    @require_admin
    def admin_order_status(order_id):
        status = request.form.get("status")
        valid  = ("pending", "processing", "shipped", "delivered", "cancelled", "refunded")
        if status not in valid:
            flash("Invalid status.", "error")
            return redirect(url_for("admin_order_detail", order_id=order_id))
        try:
            db.execute("UPDATE orders SET status=%s WHERE id=%s", [status, order_id])
            flash(f"Order status updated to '{status}'.", "success")
        except Exception as e:
            flash(f"Error: {e}", "error")
        return redirect(url_for("admin_order_detail", order_id=order_id))

    # ── Customers ──────────────────────────────────────────────────────────────

    @app.route("/admin/customers")
    @require_admin
    def admin_customers():
        try:
            customers = db.query("SELECT * FROM users WHERE role='customer' ORDER BY created_at DESC")
        except Exception as e:
            customers = []
            flash(f"Error: {e}", "error")
        return render_template("admin/customers.html", customers=customers)

    # ── Attributes ─────────────────────────────────────────────────────────────

    @app.route("/admin/attributes")
    @require_admin
    def admin_attributes():
        try:
            attributes = db.query("""
                SELECT a.*, (SELECT COUNT(*) FROM attribute_values v WHERE v.attribute_id = a.id) as value_count
                FROM attributes a ORDER BY a.name ASC
            """)
        except Exception as e:
            attributes = []
            flash(f"Error: {e}", "error")
        return render_template("admin/attributes.html", attributes=attributes)

    @app.route("/admin/attributes/new", methods=["GET", "POST"])
    @require_admin
    def admin_attribute_new():
        if request.method == "POST":
            name       = request.form.get("name")
            slug       = request.form.get("slug") or slugify(name)
            image_url  = request.form.get("image_url") or None
            is_featured = request.form.get("is_featured") == "on"
            if not name:
                flash("Name is required", "error")
            else:
                try:
                    db.execute(
                        "INSERT INTO attributes (id, name, slug, image_url, is_featured) VALUES (%s,%s,%s,%s,%s)",
                        [str(uuid.uuid4()), name, slug, image_url, is_featured]
                    )
                    flash("Attribute created", "success")
                    return redirect(url_for("admin_attributes"))
                except Exception as e:
                    flash(f"Error: {e}", "error")
        return render_template("admin/attribute_form.html", attribute=None)

    @app.route("/admin/attributes/<attr_id>/edit", methods=["GET", "POST"])
    @require_admin
    def admin_attribute_edit(attr_id):
        attribute = db.query_one("SELECT * FROM attributes WHERE id = %s", [attr_id])
        if not attribute:
            abort(404)
        if request.method == "POST":
            try:
                db.execute(
                    "UPDATE attributes SET name=%s, slug=%s, image_url=%s, is_featured=%s WHERE id=%s",
                    [request.form.get("name"), request.form.get("slug"),
                     request.form.get("image_url") or None,
                     request.form.get("is_featured") == "on", attr_id]
                )
                flash("Attribute updated", "success")
                return redirect(url_for("admin_attributes"))
            except Exception as e:
                flash(f"Error: {e}", "error")
        return render_template("admin/attribute_form.html", attribute=attribute)

    @app.route("/admin/attributes/<attr_id>/delete", methods=["POST"])
    @require_admin
    def admin_attribute_delete(attr_id):
        try:
            db.execute("DELETE FROM attributes WHERE id = %s", [attr_id])
            flash("Attribute deleted", "success")
        except Exception as e:
            flash(f"Error: {e}", "error")
        return redirect(url_for("admin_attributes"))

    @app.route("/admin/attributes/<attr_id>/values", methods=["GET", "POST"])
    @require_admin
    def admin_attribute_values(attr_id):
        attribute = db.query_one("SELECT * FROM attributes WHERE id = %s", [attr_id])
        if not attribute:
            flash("Attribute not found", "error")
            return redirect(url_for("admin_attributes"))
        if request.method == "POST":
            value     = request.form.get("value")
            stock     = request.form.get("stock_quantity") or 0
            image_url = request.form.get("image_url") or None
            if value:
                try:
                    db.execute(
                        "INSERT INTO attribute_values (id, attribute_id, value, image_url, stock_quantity) VALUES (%s,%s,%s,%s,%s)",
                        [str(uuid.uuid4()), attr_id, value, image_url, int(stock)]
                    )
                    flash("Value added", "success")
                except Exception as e:
                    flash(f"Error: {e}", "error")
        values = db.query(
            "SELECT * FROM attribute_values WHERE attribute_id = %s ORDER BY value ASC", [attr_id]
        )
        return render_template("admin/attribute_values.html", attribute=attribute, values=values)

    @app.route("/admin/attributes/<attr_id>/values/bulk_update", methods=["POST"])
    @require_admin
    def admin_attribute_values_bulk_update(attr_id):
        f = request.form
        try:
            values = db.query("SELECT id FROM attribute_values WHERE attribute_id = %s", [attr_id])
            for v in values:
                v_id = v["id"]
                stock = f.get(f"stock_{v_id}")
                if stock is not None:
                    db.execute("UPDATE attribute_values SET stock_quantity=%s WHERE id=%s", [int(stock or 0), v_id])
            flash("Attribute values updated.", "success")
        except Exception as e:
            flash(f"Error updating values: {e}", "error")
        return redirect(url_for("admin_attribute_values", attr_id=attr_id))

    @app.route("/admin/attributes/values/<val_id>/delete", methods=["POST"])
    @require_admin
    def admin_attribute_value_delete(val_id):
        attr_id = request.form.get("attribute_id")
        try:
            db.execute("DELETE FROM attribute_values WHERE id = %s", [val_id])
            flash("Value deleted", "success")
        except Exception as e:
            flash(f"Error: {e}", "error")
        return redirect(url_for("admin_attribute_values", attr_id=attr_id))

    # ── Variations ─────────────────────────────────────────────────────────────

    @app.route("/admin/products/<product_id>/variations")
    @require_admin
    def admin_product_variations(product_id):
        product = db.query_one("SELECT id, name, type FROM products WHERE id = %s", [product_id])
        if not product:
            abort(404)
        variations = db.query("""
            SELECT v.*,
                   (SELECT string_agg(av.value, ' / ')
                    FROM variation_attribute_values vav
                    JOIN attribute_values av ON av.id = vav.attribute_value_id
                    WHERE vav.variation_id = v.id) as option_names
            FROM product_variations v WHERE v.product_id = %s ORDER BY v.sku ASC
        """, [product_id])
        linked_attributes = db.query("""
            SELECT a.id, a.name FROM attributes a
            JOIN product_attributes pa ON pa.attribute_id = a.id
            WHERE pa.product_id = %s ORDER BY pa.display_order ASC
        """, [product_id])
        for attr in linked_attributes:
            attr["options"] = db.query("""
                SELECT av.* FROM attribute_values av
                JOIN product_attribute_values pav ON pav.attribute_value_id = av.id
                WHERE av.attribute_id = %s AND pav.product_id = %s ORDER BY av.value ASC
            """, [attr["id"], product_id])
            if not attr["options"]:
                attr["options"] = db.query(
                    "SELECT * FROM attribute_values WHERE attribute_id = %s ORDER BY value ASC", [attr["id"]]
                )
        return render_template(
            "admin/variations.html", product=product, variations=variations, attributes=linked_attributes
        )

    @app.route("/admin/products/<product_id>/variations/new", methods=["POST"])
    @require_admin
    def admin_variation_new(product_id):
        f = request.form
        try:
            var_id = str(uuid.uuid4())
            db.execute(
                "INSERT INTO product_variations (id, product_id, sku, price, sale_price, stock_quantity) "
                "VALUES (%s,%s,%s,%s,%s,%s)",
                [var_id, product_id, f.get("sku"),
                 float(f.get("price") or 0), float(f.get("sale_price") or 0) or None,
                 int(f.get("stock_quantity") or 0)]
            )
            for key, val_id in f.items():
                if key.startswith("attr_") and val_id:
                    db.execute(
                        "INSERT INTO variation_attribute_values (id, variation_id, attribute_value_id) VALUES (%s,%s,%s)",
                        [str(uuid.uuid4()), var_id, val_id]
                    )
            flash("Variation created", "success")
        except Exception as e:
            flash(f"Error: {e}", "error")
        return redirect(url_for("admin_product_variations", product_id=product_id))

    @app.route("/admin/variations/<var_id>/delete", methods=["POST"])
    @require_admin
    def admin_variation_delete(var_id):
        product_id = request.form.get("product_id")
        try:
            db.execute("DELETE FROM product_variations WHERE id = %s", [var_id])
            flash("Variation deleted", "success")
        except Exception as e:
            flash(f"Error: {e}", "error")
        return redirect(url_for("admin_product_variations", product_id=product_id))

    @app.route("/admin/products/<product_id>/variations/bulk_update", methods=["POST"])
    @require_admin
    def admin_variations_bulk_update(product_id):
        try:
            # First, fetch all variation IDs for this product to validate
            rows = db.query("SELECT id FROM product_variations WHERE product_id = %s", [product_id])
            var_ids = [r["id"] for r in rows]
            
            for vid in var_ids:
                sku = request.form.get(f"sku_{vid}")
                price = request.form.get(f"price_{vid}")
                stock = request.form.get(f"stock_{vid}")
                
                if sku is not None and price is not None and stock is not None:
                    db.execute(
                        "UPDATE product_variations SET sku=%s, price=%s, stock_quantity=%s WHERE id=%s",
                        [sku, float(price), int(stock), vid]
                    )
            flash("All variations updated successfully.", "success")
        except Exception as e:
            flash(f"Error during bulk update: {e}", "error")
        return redirect(url_for("admin_product_variations", product_id=product_id))

    # ── Reviews ────────────────────────────────────────────────────────────────

    @app.route("/admin/reviews")
    @require_admin
    def admin_reviews():
        try:
            reviews = db.query("""
                SELECT r.*, p.name AS product_name, p.id AS product_id,
                       (u.first_name || ' ' || u.last_name) AS reviewer_name
                FROM product_reviews r 
                LEFT JOIN products p ON p.id = r.product_id
                LEFT JOIN users u ON u.id = r.user_id
                ORDER BY r.created_at DESC
            """)
        except Exception as e:
            reviews = []
            flash(f"Error loading reviews: {e}", "error")
        return render_template("admin/reviews.html", reviews=reviews)

    @app.route("/admin/reviews/<review_id>/approve", methods=["POST"])
    @require_admin
    def admin_review_approve(review_id):
        action = request.form.get("action", "approve")
        try:
            approved = action == "approve"
            db.execute("UPDATE product_reviews SET is_approved=%s WHERE id=%s", [approved, review_id])
            flash("Review " + ("approved." if approved else "rejected."), "success")
        except Exception as e:
            flash(f"Error: {e}", "error")
        return redirect(url_for("admin_reviews"))

    @app.route("/admin/reviews/<review_id>/delete", methods=["POST"])
    @require_admin
    def admin_review_delete(review_id):
        try:
            db.execute("DELETE FROM product_reviews WHERE id=%s", [review_id])
            flash("Review deleted.", "success")
        except Exception as e:
            flash(f"Error: {e}", "error")
        return redirect(url_for("admin_reviews"))

    # ── Settings ───────────────────────────────────────────────────────────────

    @app.route("/admin/settings", methods=["GET", "POST"])
    @require_admin
    def admin_settings():
        if request.method == "POST":
            keys = ["cod_enabled", "online_payment_enabled", "upi_id", "bank_name", "bank_account", "bank_ifsc"]
            try:
                for key in keys:
                    value = ("true" if request.form.get(key) == "on" else "false") \
                        if key in ("cod_enabled", "online_payment_enabled") \
                        else request.form.get(key, "").strip()
                    db.execute(
                        "INSERT INTO store_settings (key, value) VALUES (%s,%s) "
                        "ON CONFLICT (key) DO UPDATE SET value=%s, updated_at=NOW()",
                        [key, value, value]
                    )
                flash("Settings saved successfully.", "success")
            except Exception as e:
                flash(f"Error saving settings: {e}", "error")
            return redirect(url_for("admin_settings"))
        return render_template("admin/settings.html", settings=get_store_settings())

    # ── Coupons (placeholder) ──────────────────────────────────────────────────

    @app.route("/admin/coupons")
    @require_admin
    def admin_coupons():
        return render_template("admin/placeholder.html", title="Coupons")

    # ── CSV Import ─────────────────────────────────────────────────────────────

    @app.route("/admin/import", methods=["GET", "POST"])
    @require_admin
    def admin_import():
        results = None
        if request.method == "POST":
            csv_file = request.files.get("csv_file")
            if not csv_file or csv_file.filename == "":
                flash("Please select a CSV file.", "error")
                return render_template("admin/import.html", results=None)
            try:
                content  = csv_file.read().decode("utf-8-sig")
                reader   = csv.DictReader(io.StringIO(content))
                imported = skipped = 0
                errors   = []
                for i, row in enumerate(reader, 1):
                    try:
                        name  = (row.get("post_title") or row.get("name") or "").strip()
                        sku   = (row.get("sku") or "").strip()
                        price = float(row.get("regular_price") or row.get("price") or 0)
                        sale  = float(row.get("sale_price") or 0) or None
                        stock = int(row.get("stock") or row.get("stock_quantity") or 0)
                        desc  = (row.get("description") or row.get("post_content") or "").strip()
                        short = (row.get("short_description") or row.get("post_excerpt") or "").strip()
                        img   = (row.get("images") or row.get("image") or "").strip().split("|")[0].strip()
                        slug  = (row.get("post_name") or row.get("slug") or name.lower().replace(" ", "-")).strip()
                        if not name:
                            skipped += 1
                            continue
                        if db.query_one("SELECT id FROM products WHERE sku=%s OR slug=%s", [sku, slug]):
                            skipped += 1
                            continue
                        result = db.execute_returning(
                            """INSERT INTO products (name, slug, sku, price, sale_price,
                               stock_quantity, stock_status, description, short_description, is_active)
                               VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,TRUE) RETURNING id""",
                            [name, slug, sku or None, price, sale, stock,
                             "in_stock" if stock > 0 else "out_of_stock", desc, short]
                        )
                        if result and img:
                            db.execute(
                                "INSERT INTO product_images (product_id, image_url, is_primary) VALUES (%s,%s,TRUE)",
                                [result["id"], img]
                            )
                        imported += 1
                    except Exception as row_err:
                        errors.append(f"Row {i}: {row_err}")
                results = {"imported": imported, "skipped": skipped, "errors": errors}
                flash(f"Import complete: {imported} imported, {skipped} skipped.", "success")
            except Exception as e:
                flash(f"CSV parse error: {e}", "error")
        return render_template("admin/import.html", results=results)
