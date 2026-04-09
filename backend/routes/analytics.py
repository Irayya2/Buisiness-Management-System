from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt, get_jwt_identity

from database import get_db, query_all, query_one
from auth.rbac import PERMISSIONS, has_permission, build_branch_filter

analytics_bp = Blueprint('analytics', __name__)


def _user_from_jwt(claims, uid):
    return {
        'id': uid, 'role': claims.get('role'),
        'branch_id': claims.get('branch_id'),
        'accessible_branch_ids': claims.get('accessible_branch_ids', []),
    }


@analytics_bp.route('/revenue', methods=['GET'])
@jwt_required()
def revenue_trend():
    claims = get_jwt()
    user = _user_from_jwt(claims, get_jwt_identity())
    if not has_permission(user, PERMISSIONS.VIEW_ANALYTICS):
        return jsonify({'error': 'Permission denied'}), 403

    conn = get_db()
    try:
        all_ids = [r['id'] for r in query_all(conn, 'SELECT id FROM branches')]
        bf, params = build_branch_filter(user, all_ids, alias='o')
        # Monthly revenue for last 6 months using SQLite syntax
        rows = query_all(conn, f'''
            SELECT
                strftime('%Y-%m', o.created_at) AS month,
                COALESCE(SUM(o.total), 0) AS revenue,
                COUNT(*) AS order_count
            FROM orders o
            WHERE o.created_at >= date('now', '-6 months') {bf}
            GROUP BY strftime('%Y-%m', o.created_at)
            ORDER BY month ASC
        ''', params)
        return jsonify(rows), 200
    except Exception as e:
        return jsonify({'error': str(e), 'details': 'Failed to calculate revenue trend'}), 500
    finally:
        conn.close()


@analytics_bp.route('/top-products', methods=['GET'])
@jwt_required()
def top_products():
    claims = get_jwt()
    user = _user_from_jwt(claims, get_jwt_identity())
    if not has_permission(user, PERMISSIONS.VIEW_ANALYTICS):
        return jsonify({'error': 'Permission denied'}), 403

    conn = get_db()
    try:
        all_ids = [r['id'] for r in query_all(conn, 'SELECT id FROM branches')]
        bf, params = build_branch_filter(user, all_ids, alias='o')
        rows = query_all(conn, f'''
            SELECT
                oi.name AS product_name,
                SUM(oi.quantity * oi.price) AS revenue,
                SUM(oi.quantity) AS quantity_sold
            FROM order_items oi
            JOIN orders o ON o.id = oi.order_id
            WHERE 1=1 {bf}
            GROUP BY oi.name
            ORDER BY revenue DESC
            LIMIT 10
        ''', params)
        return jsonify(rows), 200
    except Exception as e:
        return jsonify({'error': str(e), 'details': 'Failed to fetch top products'}), 500
    finally:
        conn.close()


@analytics_bp.route('/order-status', methods=['GET'])
@jwt_required()
def order_status_distribution():
    claims = get_jwt()
    user = _user_from_jwt(claims, get_jwt_identity())
    if not has_permission(user, PERMISSIONS.VIEW_ANALYTICS):
        return jsonify({'error': 'Permission denied'}), 403

    conn = get_db()
    try:
        all_ids = [r['id'] for r in query_all(conn, 'SELECT id FROM branches')]
        bf, params = build_branch_filter(user, all_ids, alias='o')
        rows = query_all(conn, f'''
            SELECT o.status, COUNT(*) AS count
            FROM orders o WHERE 1=1 {bf} GROUP BY o.status
        ''', params)
        return jsonify(rows), 200
    except Exception as e:
        return jsonify({'error': str(e), 'details': 'Failed to fetch order status'}), 500
    finally:
        conn.close()


@analytics_bp.route('/stock-status', methods=['GET'])
@jwt_required()
def stock_status():
    claims = get_jwt()
    user = _user_from_jwt(claims, get_jwt_identity())
    if not has_permission(user, PERMISSIONS.VIEW_ANALYTICS):
        return jsonify({'error': 'Permission denied'}), 403

    conn = get_db()
    try:
        all_ids = [r['id'] for r in query_all(conn, 'SELECT id FROM branches')]
        bf, params = build_branch_filter(user, all_ids, alias='p')
        in_stock   = query_one(conn, f'SELECT COUNT(*) AS cnt FROM products p WHERE p.stock > p.min_stock {bf}', params)['cnt']
        low_stock  = query_one(conn, f'SELECT COUNT(*) AS cnt FROM products p WHERE p.stock <= p.min_stock AND p.stock > 0 {bf}', params)['cnt']
        out_stock  = query_one(conn, f'SELECT COUNT(*) AS cnt FROM products p WHERE p.stock = 0 {bf}', params)['cnt']
        return jsonify({
            'inStock':    int(in_stock),
            'lowStock':   int(low_stock),
            'outOfStock': int(out_stock),
        }), 200
    except Exception as e:
        return jsonify({'error': str(e), 'details': 'Failed to fetch stock status'}), 500
    finally:
        conn.close()
