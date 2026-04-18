"""
app.py — Application factory for ChasmaGallery.
"""
import os
from flask import Flask, render_template, session
from dotenv import load_dotenv

load_dotenv()

from extensions import csrf, limiter
from helpers import register_jinja
import db


def create_app():
    app = Flask(__name__)
    app.secret_key = os.getenv("SECRET_KEY", "change-me-in-production")
    app.config["SESSION_COOKIE_HTTPONLY"] = True
    app.config["SESSION_COOKIE_SAMESITE"] = "Lax"

    csrf.init_app(app)
    limiter.init_app(app)
    register_jinja(app)

    @app.context_processor
    def inject_globals():
        cart  = session.get("cart", {})
        count = sum(item.get("qty", 0) for item in cart.values())
        return {"cart_count": count, "current_user": session.get("user")}

    # Blueprints
    from routes.public   import bp as public_bp
    from routes.auth     import bp as auth_bp
    from routes.cart     import bp as cart_bp
    from routes.checkout import bp as checkout_bp

    app.register_blueprint(public_bp)
    app.register_blueprint(auth_bp)
    app.register_blueprint(cart_bp)
    app.register_blueprint(checkout_bp)

    # Admin routes (plain endpoint names — no blueprint prefix needed)
    from routes.admin import register as reg_admin
    reg_admin(app)

    @app.errorhandler(404)
    def not_found(e):
        return render_template("errors/404.html"), 404

    @app.errorhandler(500)
    def server_error(e):
        return render_template("errors/500.html"), 500

    return app


app = create_app()

try:
    db.migrate()
except Exception as _e:
    print(f"[db.migrate] {_e}")

if __name__ == "__main__":
    port  = int(os.getenv("PORT", 6000))
    debug = os.getenv("FLASK_ENV", "development") != "production"
    app.run(debug=debug, port=port, host="0.0.0.0")
