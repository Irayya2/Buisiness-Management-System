import os
from flask import Flask, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager

from config import Config

def create_app():
    app = Flask(__name__)

    # ── CORS ─────────────────────────────────────────────────────────────────
    # Allow origins from CORS_ORIGINS env-var (comma-separated).
    # supports_credentials=True lets the browser send cookies / Authorization.
    CORS(
        app,
        origins=Config.CORS_ORIGINS,
        supports_credentials=True,
        allow_headers=['Content-Type', 'Authorization'],
        methods=['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    )

    # Safety-net: guarantee CORS headers appear even on error responses
    @app.after_request
    def add_cors_headers(response):
        origin = None
        from flask import request as req
        req_origin = req.headers.get('Origin', '')
        # Check if request origin matches any allowed origin
        for allowed in Config.CORS_ORIGINS:
            if allowed == '*' or req_origin == allowed:
                origin = req_origin
                break
        if origin:
            response.headers['Access-Control-Allow-Origin'] = origin
            response.headers['Access-Control-Allow-Credentials'] = 'true'
            response.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization'
            response.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS'
        return response

    @app.route("/")
    def home():
        return "Backend is running 🚀"
        
    app.config['JWT_SECRET_KEY'] = Config.JWT_SECRET_KEY
    app.config['JWT_ACCESS_TOKEN_EXPIRES'] = Config.JWT_ACCESS_TOKEN_EXPIRES
    app.config['DEBUG'] = Config.DEBUG

    # JWT
    JWTManager(app)

    # ── Register blueprints ──────────────────────────────────────────────────
    from routes.auth        import auth_bp
    from routes.branches    import branches_bp
    from routes.clusters    import clusters_bp
    from routes.products    import products_bp
    from routes.orders      import orders_bp
    from routes.customers   import customers_bp
    from routes.suppliers   import suppliers_bp
    from routes.invoices    import invoices_bp
    from routes.sales       import sales_bp
    from routes.accounting  import accounting_bp
    from routes.dashboard   import dashboard_bp
    from routes.analytics   import analytics_bp

    app.register_blueprint(auth_bp,       url_prefix='/api/auth')
    app.register_blueprint(branches_bp,   url_prefix='/api/branches')
    app.register_blueprint(clusters_bp,   url_prefix='/api/clusters')
    app.register_blueprint(products_bp,   url_prefix='/api/products')
    app.register_blueprint(orders_bp,     url_prefix='/api/orders')
    app.register_blueprint(customers_bp,  url_prefix='/api/customers')
    app.register_blueprint(suppliers_bp,  url_prefix='/api/suppliers')
    app.register_blueprint(invoices_bp,   url_prefix='/api/invoices')
    app.register_blueprint(sales_bp,      url_prefix='/api/sales')
    app.register_blueprint(accounting_bp, url_prefix='/api/accounting')
    app.register_blueprint(dashboard_bp,  url_prefix='/api/dashboard')
    app.register_blueprint(analytics_bp,  url_prefix='/api/analytics')

    return app


if __name__ == '__main__':
    app = create_app()
    port = int(os.environ.get("PORT", 5001))
    app.run(host='0.0.0.0', port=port, debug=Config.DEBUG)
