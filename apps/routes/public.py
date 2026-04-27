from flask import Blueprint, render_template, request, redirect, url_for, flash, abort
import db
from queries import (
    get_products, get_categories, get_brands,
    get_product_detail, get_related_products,
    get_homepage_products, get_trending_shapes, get_featured_categories,
)

bp = Blueprint("public", __name__)


@bp.route("/")
def index():
    try:
        featured, latest, popular, promo1, promo2 = get_homepage_products()
        trending_shapes     = get_trending_shapes()
        featured_categories = get_featured_categories()
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
    search          = request.args.get("search", "").strip()
    selected_cats   = tuple(s for s in request.args.getlist("category") if s)
    selected_brands = tuple(s for s in request.args.getlist("brand")    if s)
    sort            = request.args.get("sort", "created_at_desc")
    shape           = request.args.get("shape", "").strip()
    page            = max(1, int(request.args.get("page", 1)))
    try:
        products, total, total_pages = get_products(
            search=search, categories=selected_cats, brands=selected_brands,
            shape=shape, sort=sort, page=page, per_page=16,
        )
        all_categories = get_categories()
        all_brands     = get_brands()
    except Exception as e:
        products, total, total_pages = [], 0, 1
        all_categories = all_brands = []
        flash(f"Database error: {e}", "error")

    # Build parent → children tree for the sidebar accordion
    parent_cats  = [c for c in all_categories if not c.get("parent_id")]
    children_map = {}
    for c in all_categories:
        pid = c.get("parent_id")
        if pid:
            children_map.setdefault(str(pid), []).append(c)

    return render_template(
        "shop.html",
        products=products, total_count=total, total_pages=total_pages,
        current_page=page,
        categories=all_categories, brands=all_brands,
        parent_cats=parent_cats, children_map=children_map,
        search=search,
        current_categories=selected_cats,
        current_brands=selected_brands,
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
