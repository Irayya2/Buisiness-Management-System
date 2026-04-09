from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt, get_jwt_identity

from database import get_db, query_one, query_all
from auth.rbac import PERMISSIONS, has_permission, build_branch_filter

dashboard_bp = Blueprint('dashboard', __name__)


def _user_from_jwt(claims, uid):
    return {
        'id': uid, 'role': claims.get('role'),
        'branch_id': claims.get('branch_id'),
        'accessible_branch_ids': claims.get('accessible_branch_ids', []),
    }


@dashboard_bp.route('/stats', methods=['GET'])
@jwt_required()
def get_stats():
    claims = get_jwt()
    user = _user_from_jwt(claims, get_jwt_identity())

    if not has_permission(user, PERMISSIONS.VIEW_DASHBOARD):
        return jsonify({'error': 'Permission denied'}), 403

    conn = get_db()
    try:
        all_ids = [r['id'] for r in query_all(conn, 'SELECT id FROM branches')]

        # Products
        bf_p, pp = build_branch_filter(user, all_ids, alias='p')
        total_products = query_one(conn, f'SELECT COUNT(*) AS cnt FROM products p WHERE 1=1 {bf_p}', pp)['cnt']
        low_stock = query_one(conn, f'SELECT COUNT(*) AS cnt FROM products p WHERE p.stock <= p.min_stock {bf_p}', pp)['cnt']
        total_stock_value = query_one(conn, f'SELECT COALESCE(SUM(p.price * p.stock),0) AS val FROM products p WHERE 1=1 {bf_p}', pp)['val']

        # Orders
        bf_o, po = build_branch_filter(user, all_ids, alias='o')
        total_orders = query_one(conn, f'SELECT COUNT(*) AS cnt FROM orders o WHERE 1=1 {bf_o}', po)['cnt']
        pending_orders = query_one(conn, f"SELECT COUNT(*) AS cnt FROM orders o WHERE o.status='pending' {bf_o}", po)['cnt']
        total_revenue_orders = query_one(conn, f"SELECT COALESCE(SUM(o.total),0) AS val FROM orders o WHERE o.status='delivered' {bf_o}", po)['val']

        # Customers
        bf_c, pc = build_branch_filter(user, all_ids, alias='c')
        total_customers = query_one(conn, f'SELECT COUNT(*) AS cnt FROM customers c WHERE 1=1 {bf_c}', pc)['cnt']

        # Invoices
        bf_i, pi = build_branch_filter(user, all_ids, alias='i')
        total_invoices = query_one(conn, f'SELECT COUNT(*) AS cnt FROM invoices i WHERE 1=1 {bf_i}', pi)['cnt']
        paid_invoices = query_one(conn, f"SELECT COUNT(*) AS cnt FROM invoices i WHERE i.status='paid' {bf_i}", pi)['cnt']
        pending_invoices = query_one(conn, f"SELECT COUNT(*) AS cnt FROM invoices i WHERE i.status='pending' {bf_i}", pi)['cnt']
        total_invoice_revenue = query_one(conn, f"SELECT COALESCE(SUM(i.total),0) AS val FROM invoices i WHERE i.status='paid' {bf_i}", pi)['val']

        # Recent orders (last 5)
        recent_orders = query_all(conn, f'''
            SELECT o.id, o.order_number, o.customer_name, o.total, o.status, o.created_at
            FROM orders o WHERE 1=1 {bf_o} ORDER BY o.created_at DESC LIMIT 5
        ''', po)
        for r in recent_orders:
            if r.get('created_at'):
                r['created_at'] = r['created_at'].isoformat() if hasattr(r['created_at'], "isoformat") else r['created_at']

        return jsonify({
            'totalProducts': int(total_products),
            'lowStockProducts': int(low_stock),
            'totalStockValue': float(total_stock_value),
            'totalOrders': int(total_orders),
            'pendingOrders': int(pending_orders),
            'totalRevenue': float(total_revenue_orders),
            'totalCustomers': int(total_customers),
            'totalInvoices': int(total_invoices),
            'paidInvoices': int(paid_invoices),
            'pendingInvoices': int(pending_invoices),
            'totalInvoiceRevenue': float(total_invoice_revenue),
            'recentOrders': recent_orders,
        }), 200
    finally:
        conn.close()
