import uuid
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt, get_jwt_identity

from database import get_db, query_all, query_one, execute, execute_many
from auth.rbac import PERMISSIONS, has_permission, build_branch_filter, get_accessible_branch_ids

orders_bp = Blueprint('orders', __name__)


def _user_from_jwt(claims, uid):
    return {
        'id': uid,
        'role': claims.get('role'),
        'branch_id': claims.get('branch_id'),
        'accessible_branch_ids': claims.get('accessible_branch_ids', []),
    }


def _serialize(row):
    if not row:
        return row
    for k, v in row.items():
        if hasattr(v, 'isoformat'):
            row[k] = v.isoformat()
    return row


def _attach_items(conn, orders):
    if not orders:
        return orders
    order_ids = [o['id'] for o in orders]
    if not order_ids:
        return orders
    placeholders = ','.join(['?'] * len(order_ids))
    items = query_all(
        conn,
        f'SELECT * FROM order_items WHERE order_id IN ({placeholders})',
        order_ids
    )
    items_map = {}
    for item in items:
        items_map.setdefault(item['order_id'], []).append(item)
    for o in orders:
        o['items'] = items_map.get(o['id'], [])
    return orders


@orders_bp.route('', methods=['GET'])
@jwt_required()
def get_orders():
    claims = get_jwt()
    user = _user_from_jwt(claims, get_jwt_identity())

    if not has_permission(user, PERMISSIONS.VIEW_ORDERS):
        return jsonify({'error': 'Permission denied'}), 403

    conn = get_db()
    try:
        all_ids = [r['id'] for r in query_all(conn, 'SELECT id FROM branches')]
        bf, params = build_branch_filter(user, all_ids, alias='o')
        orders = query_all(conn, f'''
            SELECT o.id, o.order_number, o.customer_id, o.customer_name,
                   o.subtotal, o.tax, o.total, o.status, o.branch_id,
                   o.created_by, o.delivery_date, o.shipping_date, o.created_at
            FROM orders o WHERE 1=1 {bf} ORDER BY o.created_at DESC
        ''', params)
        orders = _attach_items(conn, orders)
        return jsonify([_serialize(o) for o in orders]), 200
    finally:
        conn.close()


@orders_bp.route('/<order_id>', methods=['GET'])
@jwt_required()
def get_order(order_id):
    claims = get_jwt()
    user = _user_from_jwt(claims, get_jwt_identity())

    if not has_permission(user, PERMISSIONS.VIEW_ORDERS):
        return jsonify({'error': 'Permission denied'}), 403

    conn = get_db()
    try:
        order = query_one(conn, 'SELECT * FROM orders WHERE id = ?', (order_id,))
        if not order:
            return jsonify({'error': 'Order not found'}), 404

        all_ids = [r['id'] for r in query_all(conn, 'SELECT id FROM branches')]
        accessible = get_accessible_branch_ids(user, all_ids)
        if order.get('branch_id') and order['branch_id'] not in accessible:
            return jsonify({'error': 'Access denied'}), 403

        items = query_all(conn, 'SELECT * FROM order_items WHERE order_id = ?', (order_id,))
        order['items'] = items
        return jsonify(_serialize(order)), 200
    finally:
        conn.close()


@orders_bp.route('', methods=['POST'])
@jwt_required()
def create_order():
    claims = get_jwt()
    user = _user_from_jwt(claims, get_jwt_identity())

    if not has_permission(user, PERMISSIONS.CREATE_ORDERS):
        return jsonify({'error': 'Permission denied'}), 403

    data = request.get_json() or {}
    items = data.get('items', [])
    order_id = f'ORD-{int(__import__("time").time() * 1000)}'
    branch_id = user.get('branch_id') or data.get('branchId') or data.get('branch_id')

    # Calculate totals
    subtotal = sum(float(i.get('price', 0)) * int(i.get('quantity', 1)) for i in items)
    tax = round(subtotal * 0.1, 2)
    total = round(subtotal + tax, 2)
    subtotal = round(subtotal, 2)

    conn = get_db()
    try:
        execute(conn, '''
            INSERT INTO orders
              (id, order_number, customer_id, customer_name,
               subtotal, tax, total, status, branch_id, created_by)
            VALUES (?,?,?,?,?,?,?,?,?,?)
        ''', (
            order_id, order_id,
            data.get('customerId') or data.get('customer_id'),
            data.get('customerName') or data.get('customer_name', ''),
            subtotal, tax, total,
            data.get('status', 'pending'),
            branch_id, user['id'],
        ))

        if items:
            execute_many(conn, '''
                INSERT INTO order_items (order_id, product_id, name, quantity, price)
                VALUES (?,?,?,?,?)
            ''', [
                (order_id, i.get('productId') or i.get('product_id'),
                 i.get('name', ''), int(i.get('quantity', 1)), float(i.get('price', 0)))
                for i in items
            ])

        # Deduct stock
        for item in items:
            pid = item.get('productId') or item.get('product_id')
            qty = int(item.get('quantity', 1))
            if pid:
                execute(conn, 'UPDATE products SET stock = stock - ? WHERE id = ?', (qty, pid))

        conn.commit()
        order = query_one(conn, 'SELECT * FROM orders WHERE id = ?', (order_id,))
        order['items'] = query_all(conn, 'SELECT * FROM order_items WHERE order_id = ?', (order_id,))
        return jsonify(_serialize(order)), 201
    finally:
        conn.close()


@orders_bp.route('/<order_id>', methods=['PUT'])
@jwt_required()
def update_order(order_id):
    claims = get_jwt()
    user = _user_from_jwt(claims, get_jwt_identity())

    if not has_permission(user, PERMISSIONS.EDIT_ORDERS):
        return jsonify({'error': 'Permission denied'}), 403

    conn = get_db()
    try:
        order = query_one(conn, 'SELECT * FROM orders WHERE id = ?', (order_id,))
        if not order:
            return jsonify({'error': 'Order not found'}), 404

        all_ids = [r['id'] for r in query_all(conn, 'SELECT id FROM branches')]
        accessible = get_accessible_branch_ids(user, all_ids)
        if order.get('branch_id') and order['branch_id'] not in accessible:
            return jsonify({'error': 'Access denied'}), 403

        data = request.get_json() or {}
        execute(conn, '''
            UPDATE orders SET status=? WHERE id=?
        ''', (data.get('status', order['status']), order_id))
        conn.commit()
        updated = query_one(conn, 'SELECT * FROM orders WHERE id = ?', (order_id,))
        updated['items'] = query_all(conn, 'SELECT * FROM order_items WHERE order_id = ?', (order_id,))
        return jsonify(_serialize(updated)), 200
    finally:
        conn.close()


@orders_bp.route('/<order_id>', methods=['DELETE'])
@jwt_required()
def delete_order(order_id):
    claims = get_jwt()
    user = _user_from_jwt(claims, get_jwt_identity())

    if not has_permission(user, PERMISSIONS.DELETE_ORDERS):
        return jsonify({'error': 'Permission denied'}), 403

    conn = get_db()
    try:
        order = query_one(conn, 'SELECT * FROM orders WHERE id = ?', (order_id,))
        if not order:
            return jsonify({'error': 'Order not found'}), 404

        all_ids = [r['id'] for r in query_all(conn, 'SELECT id FROM branches')]
        accessible = get_accessible_branch_ids(user, all_ids)
        if order.get('branch_id') and order['branch_id'] not in accessible:
            return jsonify({'error': 'Access denied'}), 403

        execute(conn, 'DELETE FROM orders WHERE id = ?', (order_id,))
        conn.commit()
        return jsonify({'message': 'Order deleted'}), 200
    finally:
        conn.close()
