from flask import Blueprint, render_template, request, redirect, url_for, session, flash, jsonify
import db
from queries import PRODUCTS_SELECT

bp = Blueprint("cart", __name__)


@bp.route("/cart")
def view_cart():
    cart_items = session.get("cart", {})
    subtotal   = sum(
        float(item.get("price", 0)) * int(item.get("qty", 0))
        for item in cart_items.values()
    )
    shipping = 0 if subtotal >= 999 else 99
    return render_template(
        "cart.html",
        cart_items=cart_items,
        subtotal=subtotal,
        shipping=shipping,
        total=subtotal + shipping,
    )


@bp.route("/cart/add", methods=["POST"])
def cart_add():
    product_id   = str(request.form.get("product_id", "")).strip()
    variation_id = str(request.form.get("variation_id", "")).strip()
    qty          = max(1, int(request.form.get("qty", 1)))

    if not product_id:
        flash("Invalid product.", "error")
        return redirect(request.referrer or url_for("public.shop"))

    try:
        product = db.query_one(f"{PRODUCTS_SELECT} WHERE p.id = %s", [product_id])
        if not product:
            flash("Product not found.", "error")
            return redirect(request.referrer or url_for("public.shop"))

        item_key     = variation_id if variation_id else product_id
        display_name = product["name"]
        price        = float(product.get("sale_price") or product.get("price") or 0)
        sku          = product.get("sku", "")
        img          = product.get("image_url", "")

        if variation_id:
            var = db.query_one("SELECT * FROM product_variations WHERE id = %s", [variation_id])
            if var:
                price = float(var.get("sale_price") or var["price"] or price)
                sku   = var.get("sku", sku)
                opts  = db.query("""
                    SELECT av.value FROM attribute_values av
                    JOIN variation_attribute_values vav ON vav.attribute_value_id = av.id
                    WHERE vav.variation_id = %s
                """, [variation_id])
                if opts:
                    display_name += f" ({' / '.join(o['value'] for o in opts)})"

        cart = session.get("cart", {})
        if item_key in cart:
            cart[item_key]["qty"] += qty
        else:
            cart[item_key] = {
                "product_id": product_id, "variation_id": variation_id or None,
                "name": display_name, "price": price, "qty": qty, "image": img, "sku": sku,
            }
        session["cart"] = cart
        flash(f"'{display_name}' added to cart!", "success")
    except Exception as e:
        flash(f"Error adding to cart: {e}", "error")

    if request.headers.get("X-Requested-With") == "XMLHttpRequest":
        count = sum(i["qty"] for i in session.get("cart", {}).values())
        return jsonify({"success": True, "cart_count": count})
    return redirect(request.referrer or url_for("public.shop"))


@bp.route("/cart/remove", methods=["POST"])
def cart_remove():
    cart = session.get("cart", {})
    cart.pop(str(request.form.get("product_id", "")), None)
    session["cart"] = cart
    flash("Item removed from cart.", "info")
    return redirect(url_for("cart.view_cart"))


@bp.route("/cart/update", methods=["POST"])
def cart_update():
    cart = session.get("cart", {})
    for key in list(cart.keys()):
        new_qty = int(request.form.get(f"qty_{key}", 0))
        if new_qty <= 0:
            del cart[key]
        else:
            cart[key]["qty"] = new_qty
    session["cart"] = cart
    flash("Cart updated.", "success")
    return redirect(url_for("cart.view_cart"))
