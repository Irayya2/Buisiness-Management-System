import uuid
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt, get_jwt_identity

from database import get_db, query_all, query_one, execute, execute_many
from auth.rbac import PERMISSIONS, has_permission, build_branch_filter

sales_bp = Blueprint('sales', __name__)


def _user_from_jwt(claims, uid):
    return {
        'id': uid, 'role': claims.get('role'),
        'branch_id': claims.get('branch_id'),
        'accessible_branch_ids': claims.get('accessible_branch_ids', []),
        'sales_id': claims.get('sales_id'),
    }


def _serialize(row):
    if not row:
        return row
    for k, v in row.items():
        if hasattr(v, 'isoformat'):
            row[k] = v.isoformat()
    return row


def _attach_items(conn, sales_list):
    if not sales_list:
        return sales_list
    ids = [s['id'] for s in sales_list]
    placeholders = ','.join(['?'] * len(ids))
    items = query_all(conn, f'SELECT * FROM sale_items WHERE sale_id IN ({placeholders})', ids)
    items_map = {}
    for item in items:
        items_map.setdefault(item['sale_id'], []).append(item)
    for s in sales_list:
        s['items'] = items_map.get(s['id'], [])
    return sales_list


@sales_bp.route('', methods=['GET'])
@jwt_required()
def get_sales():
    claims = get_jwt()
    user = _user_from_jwt(claims, get_jwt_identity())
    if not has_permission(user, PERMISSIONS.VIEW_SALES):
        return jsonify({'error': 'Permission denied'}), 403
    conn = get_db()
    try:
        all_ids = [r['id'] for r in query_all(conn, 'SELECT id FROM branches')]
        bf, params = build_branch_filter(user, all_ids, alias='s')
        rows = query_all(conn, f'''
            SELECT s.id, s.sales_id, s.customer_id, s.customer_name,
                   s.total, s.branch_id, s.salesman_name, s.created_by, s.created_at
            FROM sales s WHERE 1=1 {bf} ORDER BY s.created_at DESC
        ''', params)
        rows = _attach_items(conn, rows)
        return jsonify([_serialize(r) for r in rows]), 200
    finally:
        conn.close()


@sales_bp.route('/<sale_id>', methods=['GET'])
@jwt_required()
def get_sale(sale_id):
    claims = get_jwt()
    user = _user_from_jwt(claims, get_jwt_identity())
    if not has_permission(user, PERMISSIONS.VIEW_SALES):
        return jsonify({'error': 'Permission denied'}), 403
    conn = get_db()
    try:
        row = query_one(conn, 'SELECT * FROM sales WHERE id=?', (sale_id,))
        if not row:
            return jsonify({'error': 'Not found'}), 404
        row['items'] = query_all(conn, 'SELECT * FROM sale_items WHERE sale_id=?', (sale_id,))
        return jsonify(_serialize(row)), 200
    finally:
        conn.close()


@sales_bp.route('', methods=['POST'])
@jwt_required()
def create_sale():
    claims = get_jwt()
    user = _user_from_jwt(claims, get_jwt_identity())
    if not has_permission(user, PERMISSIONS.CREATE_SALES):
        return jsonify({'error': 'Permission denied'}), 403
    data = request.get_json() or {}
    sale_id = f'SALE-{int(__import__("time").time() * 1000)}'
    branch_id = user.get('branch_id') or data.get('branchId') or data.get('branch_id')
    items = data.get('items', [])
    total = sum(float(i.get('price', 0)) * int(i.get('quantity', 1)) for i in items)

    conn = get_db()
    try:
        execute(conn, '''
            INSERT INTO sales (id, sales_id, customer_id, customer_name, total, branch_id, salesman_name, created_by)
            VALUES (?,?,?,?,?,?,?,?)
        ''', (
            sale_id,
            user.get('sales_id') or data.get('salesId') or data.get('sales_id', ''),
            data.get('customerId') or data.get('customer_id'),
            data.get('customerName') or data.get('customer_name', ''),
            round(total, 2), branch_id,
            data.get('salesmanName') or data.get('salesman_name', user.get('name', '')),
            user['id'],
        ))
        if items:
            execute_many(conn, '''
                INSERT INTO sale_items (sale_id, product_id, name, quantity, price)
                VALUES (?,?,?,?,?)
            ''', [(sale_id, i.get('productId') or i.get('product_id'),
                   i.get('name',''), int(i.get('quantity', 1)), float(i.get('price', 0)))
                  for i in items])
        conn.commit()
        row = query_one(conn, 'SELECT * FROM sales WHERE id=?', (sale_id,))
        row['items'] = query_all(conn, 'SELECT * FROM sale_items WHERE sale_id=?', (sale_id,))
        return jsonify(_serialize(row)), 201
    finally:
        conn.close()
