import uuid
import json
from flask import Blueprint, render_template, request, redirect, url_for, session, flash, jsonify, abort
import db
from helpers import get_store_settings

bp = Blueprint("checkout", __name__)


@bp.route("/razorpay/create_order", methods=["POST"])
def rzp_create_order():
    if "user" not in session:
        return jsonify({"success": False, "message": "Login required."}), 401
    settings   = get_store_settings()
    key_id     = settings.get("razorpay_key_id")
    key_secret = settings.get("razorpay_key_secret")
    if not key_id or not key_secret:
        return jsonify({"success": False, "message": "Razorpay not configured."}), 400
    try:
        cart = session.get("cart", {})
        if not cart:
            return jsonify({"success": False, "message": "Cart is empty."}), 400
        subtotal     = sum(float(i.get("price", 0)) * int(i.get("qty", 0)) for i in cart.values())
        shipping     = 0 if subtotal >= 999 else 99
        amount_paisa = int((subtotal + shipping) * 100)
        import razorpay
        client = razorpay.Client(auth=(key_id, key_secret))
        order  = client.order.create({"amount": amount_paisa, "currency": "INR", "payment_capture": 1})
        return jsonify({"success": True, "order": order})
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500


@bp.route("/checkout", methods=["GET", "POST"])
def checkout():
    if "user" not in session:
        flash("Please log in to continue.", "error")
        return redirect(url_for("auth.login", next=request.url))
    cart = session.get("cart", {})
    if not cart:
        flash("Your cart is empty.", "error")
        return redirect(url_for("cart.view_cart"))

    uid      = session["user"]["id"]
    subtotal = 0
    for pid, item in cart.items():
        p_row = db.query_one("SELECT price, sale_price FROM products WHERE id=%s", [pid])
        if p_row:
            cur_p           = float(p_row["sale_price"]) if p_row["sale_price"] else float(p_row["price"])
            subtotal       += cur_p * int(item.get("qty", 0))
            cart[pid]["price"] = cur_p
    shipping = 0 if subtotal >= 999 else 99
    total    = subtotal + shipping
    session["cart"] = cart

    settings       = get_store_settings()
    cod_enabled    = settings.get("cod_enabled", "true") == "true"
    online_enabled = settings.get("online_payment_enabled", "false") == "true"

    try:
        addresses = db.query(
            "SELECT * FROM user_addresses WHERE user_id=%s ORDER BY is_default DESC, created_at DESC", [uid]
        )
    except Exception:
        addresses = []

    if request.method == "POST":
        payment_method = request.form.get("payment_method", "cod")
        notes          = request.form.get("notes", "").strip()
        save_address   = request.form.get("save_address") == "on"
        addr_first     = request.form.get("addr_first_name", "").strip()
        addr_last      = request.form.get("addr_last_name", "").strip()
        addr_phone     = request.form.get("addr_phone", "").strip()
        addr_line1     = request.form.get("addr_line1", "").strip()
        addr_line2     = request.form.get("addr_line2", "").strip()
        addr_city      = request.form.get("addr_city", "").strip()
        addr_state     = request.form.get("addr_state", "").strip()
        addr_pin       = request.form.get("addr_pincode", "").strip()
        addr_country   = request.form.get("addr_country", "India").strip()

        if not addr_line1 or not addr_city or not addr_pin or not addr_phone:
            flash("Please fill in all required address fields.", "error")
            return render_template(
                "checkout.html", cart=cart, subtotal=subtotal, shipping=shipping, total=total,
                settings=settings, cod_enabled=cod_enabled, online_enabled=online_enabled,
                addresses=addresses,
            )

        payment_status = "pending"
        if payment_method == "razorpay":
            try:
                import razorpay
                client = razorpay.Client(auth=(
                    settings.get("razorpay_key_id"), settings.get("razorpay_key_secret")
                ))
                client.utility.verify_payment_signature({
                    "razorpay_order_id":   request.form.get("razorpay_order_id"),
                    "razorpay_payment_id": request.form.get("razorpay_payment_id"),
                    "razorpay_signature":  request.form.get("razorpay_signature"),
                })
                payment_status = "paid"
            except Exception as e:
                flash(f"Payment verification failed: {e}", "error")
                return redirect(url_for("checkout.checkout"))

        shipping_addr  = {
            "first_name": addr_first, "last_name": addr_last, "phone": addr_phone,
            "address_line1": addr_line1, "address_line2": addr_line2,
            "city": addr_city, "state": addr_state, "pincode": addr_pin, "country": addr_country,
        }
        customer_name  = session["user"].get("name", f"{addr_first} {addr_last}").strip()
        customer_email = session["user"].get("email", "")

        try:
            order_id = str(uuid.uuid4())
            db.execute(
                """INSERT INTO orders
                   (id, user_id, total_amount, status, payment_method, payment_status,
                    shipping_address_json, customer_name, customer_email, customer_phone, notes)
                   VALUES (%s,%s,%s,'pending',%s,%s,%s,%s,%s,%s,%s)""",
                [order_id, uid, total, payment_method, payment_status,
                 json.dumps(shipping_addr), customer_name, customer_email, addr_phone, notes]
            )
            for item_key, item in cart.items():
                unit_price = float(item.get("price", 0))
                qty        = int(item.get("qty", 1))
                db.execute(
                    """INSERT INTO order_items
                       (id, order_id, product_id, variation_id, quantity,
                        unit_price, total_price, product_name_snapshot)
                       VALUES (%s,%s,%s,%s,%s,%s,%s,%s)""",
                    [str(uuid.uuid4()), order_id, item.get("product_id"),
                     item.get("variation_id") or None, qty, unit_price,
                     unit_price * qty, item.get("name", "")]
                )
            if save_address:
                try:
                    is_default = len(addresses) == 0
                    if is_default:
                        db.execute("UPDATE user_addresses SET is_default=FALSE WHERE user_id=%s", [uid])
                    db.execute(
                        """INSERT INTO user_addresses
                           (id, user_id, label, first_name, last_name, phone,
                            address_line1, address_line2, city, state, pincode, country, is_default)
                           VALUES (%s,%s,'Home',%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)""",
                        [str(uuid.uuid4()), uid, addr_first, addr_last, addr_phone,
                         addr_line1, addr_line2, addr_city, addr_state, addr_pin,
                         addr_country, is_default]
                    )
                except Exception:
                    pass
            session.pop("cart", None)
            flash("Order placed successfully!", "success")
            return redirect(url_for("checkout.order_success", order_id=order_id))
        except Exception as e:
            flash(f"Error placing order: {e}", "error")

    return render_template(
        "checkout.html",
        cart=cart, subtotal=subtotal, shipping=shipping, total=total,
        settings=settings, cod_enabled=cod_enabled, online_enabled=online_enabled,
        addresses=addresses,
    )


@bp.route("/order/<order_id>/success")
def order_success(order_id):
    if "user" not in session:
        return redirect(url_for("auth.login"))
    uid = session["user"]["id"]
    try:
        order = db.query_one("SELECT * FROM orders WHERE id=%s AND user_id=%s", [order_id, uid])
        if not order:
            abort(404)
        items = db.query(
            """SELECT oi.*, p.name AS product_name, m.file_url AS image_url
               FROM order_items oi
               LEFT JOIN products p ON p.id = oi.product_id
               LEFT JOIN product_images pi ON pi.product_id = oi.product_id AND pi.is_primary=TRUE
               LEFT JOIN media m ON m.id = pi.media_id
               WHERE oi.order_id=%s""",
            [order_id]
        )
        shipping_address = {}
        if order.get("shipping_address_json"):
            try:
                shipping_address = json.loads(order["shipping_address_json"])
            except Exception:
                pass
    except Exception as e:
        flash(f"Error loading order: {e}", "error")
        return redirect(url_for("auth.account"))
    return render_template("order_success.html", order=order, items=items, shipping_address=shipping_address)


@bp.route("/order/<order_id>")
def order_detail(order_id):
    if "user" not in session:
        return redirect(url_for("auth.login"))
    uid = session["user"]["id"]
    try:
        order = db.query_one("SELECT * FROM orders WHERE id=%s AND user_id=%s", [order_id, uid])
        if not order:
            abort(404)
        items = db.query("SELECT * FROM order_items WHERE order_id=%s", [order_id])
    except Exception as e:
        flash(f"Error fetching order: {e}", "error")
        return redirect(url_for("auth.account"))
    return render_template("order_detail.html", order=order, items=items)


@bp.route("/product/<product_id>/review", methods=["POST"])
def submit_review(product_id):
    if "user" not in session:
        return redirect(url_for("auth.login"))
    uid = session["user"]["id"]
    try:
        rating_str = request.form.get("rating", "").strip()
        comment    = request.form.get("comment", "").strip()
        if not rating_str or not rating_str.isdigit():
            flash("Please select a star rating.", "error")
            return redirect(url_for("public.product_detail", product_id=product_id))
        rating = int(rating_str)
        if not (1 <= rating <= 5):
            flash("Rating must be between 1 and 5.", "error")
            return redirect(url_for("public.product_detail", product_id=product_id))
        if len(comment) < 10:
            flash("Review must be at least 10 characters long.", "error")
            return redirect(url_for("public.product_detail", product_id=product_id))
        if db.query_one(
            "SELECT id FROM product_reviews WHERE product_id=%s AND user_id=%s", [product_id, uid]
        ):
            flash("You have already submitted a review for this product.", "info")
            return redirect(url_for("public.product_detail", product_id=product_id))
        db.execute(
            "INSERT INTO product_reviews (product_id, user_id, rating, comment, is_approved) VALUES (%s,%s,%s,%s,TRUE)",
            [product_id, uid, rating, comment]
        )
        flash("Thank you! Your review has been submitted.", "success")
    except Exception as e:
        flash(f"Error submitting review: {e}", "error")
    return redirect(url_for("public.product_detail", product_id=product_id))
