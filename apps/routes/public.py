from flask import Blueprint, render_template, request, redirect, url_for, flash, abort
import db
from queries import get_products, get_categories, get_brands, get_product_detail, get_related_products

bp = Blueprint("public", __name__)


@bp.route("/")
def index():
    try:
        featured            = get_products(featured=True, limit=10)
        latest              = get_products(sort="created_at_desc", limit=10)
        popular             = get_products(sort="name_asc", limit=10)
        promo1              = get_products(limit=2)
        promo2              = get_products(sort="price_asc", limit=2)
        trending_shapes     = db.query("""
            SELECT av.value as label, av.image_url as img, av.id
            FROM attribute_values av
            JOIN attributes a ON a.id = av.attribute_id
            WHERE a.slug = 'frame-shape' AND av.image_url IS NOT NULL LIMIT 6
        """)
        featured_categories = db.query("""
            SELECT name as label, image_url as img, slug
            FROM categories WHERE parent_id IS NULL ORDER BY name ASC
        """)
    except Exception as e:
        featured = latest = popular = promo1 = promo2 = []
        trending_shapes = featured_categories = []
        flash(f"Data loading error: {e}", "error")
    return render_template(
        "index.html",
        featured=featured, latest=latest, popular=popular,
        promo1=promo1, promo2=promo2,
        trending_shapes=trending_shapes,
        featured_categories=featured_categories,
    )


@bp.route("/shop")
def shop():
    search   = request.args.get("search", "").strip()
    category = request.args.get("category", "").strip()
    brand    = request.args.get("brand", "").strip()
    sort     = request.args.get("sort", "created_at_desc")
    shape    = request.args.get("shape", "").strip()
    page     = max(1, int(request.args.get("page", 1)))
    try:
        products, total, total_pages = get_products(
            search=search, category=category, brand=brand,
            shape=shape, sort=sort, page=page, per_page=16
        )
        categories = get_categories()
        brands     = get_brands()
    except Exception as e:
        products, total, total_pages = [], 0, 1
        categories = brands = []
        flash(f"Database error: {e}", "error")
    return render_template(
        "shop.html",
        products=products, total_count=total, total_pages=total_pages,
        current_page=page, categories=categories, brands=brands,
        search=search, current_category=category, current_brand=brand,
        current_sort=sort, current_shape=shape,
    )


@bp.route("/product/<product_id>")
def product_detail(product_id):
    try:
        product, images, variations, reviews, attributes = get_product_detail(product_id)
    except Exception as e:
        flash(f"Error loading product: {e}", "error")
        return redirect(url_for("public.shop"))
    if not product:
        abort(404)
    try:
        related = get_related_products(product.get("category_slug", ""), product_id)
    except Exception:
        related = []
    return render_template(
        "product.html",
        product=product, images=images, variations=variations,
        reviews=reviews, attributes=attributes, related=related,
    )


@bp.route("/category/<slug>")
def category_page(slug):
    return redirect(url_for("public.shop", category=slug))


@bp.route("/brand/<slug>")
def brand_page(slug):
    return redirect(url_for("public.shop", brand=slug))


@bp.route("/about")
def about():
    return render_template("about.html")


@bp.route("/contact", methods=["GET", "POST"])
def contact():
    if request.method == "POST":
        name    = request.form.get("name", "").strip()
        email   = request.form.get("email", "").strip()
        message = request.form.get("message", "").strip()
        if not all([name, email, message]):
            flash("Please fill in all required fields.", "error")
        else:
            flash("Thank you for your message! We'll get back to you soon.", "success")
            return redirect(url_for("public.contact"))
    return render_template("contact.html")
