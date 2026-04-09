import uuid
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt, get_jwt_identity

from database import get_db, query_all, query_one, execute
from auth.rbac import PERMISSIONS, has_permission, build_branch_filter

products_bp = Blueprint('products', __name__)


def _user_from_jwt(claims, user_id):
    return {
        'id': user_id,
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


@products_bp.route('', methods=['GET'])
@jwt_required()
def get_products():
    claims = get_jwt()
    user = _user_from_jwt(claims, get_jwt_identity())

    if not has_permission(user, PERMISSIONS.VIEW_PRODUCTS):
        return jsonify({'error': 'Permission denied'}), 403

    conn = get_db()
    try:
        all_branch_ids = [r['id'] for r in query_all(conn, 'SELECT id FROM branches')]
        branch_filter, params = build_branch_filter(user, all_branch_ids, alias='p')

        sql = f'''
            SELECT p.id, p.name, p.sku, p.category, p.price, p.cost,
                   p.stock, p.min_stock, p.unit, p.batch, p.expiry_date,
                   p.description, p.branch_id, p.created_at, p.updated_at, p.created_by
            FROM products p
            WHERE 1=1 {branch_filter}
            ORDER BY p.created_at DESC
        '''
        products = query_all(conn, sql, params)
        return jsonify([_serialize(p) for p in products]), 200
    finally:
        conn.close()


@products_bp.route('/<product_id>', methods=['GET'])
@jwt_required()
def get_product(product_id):
    claims = get_jwt()
    user = _user_from_jwt(claims, get_jwt_identity())

    if not has_permission(user, PERMISSIONS.VIEW_PRODUCTS):
        return jsonify({'error': 'Permission denied'}), 403

    conn = get_db()
    try:
        product = query_one(conn, 'SELECT * FROM products WHERE id = ?', (product_id,))
        if not product:
            return jsonify({'error': 'Product not found'}), 404

        all_branch_ids = [r['id'] for r in query_all(conn, 'SELECT id FROM branches')]
        from auth.rbac import get_accessible_branch_ids
        accessible = get_accessible_branch_ids(user, all_branch_ids)
        if product.get('branch_id') and product['branch_id'] not in accessible:
            return jsonify({'error': 'Access denied'}), 403

        return jsonify(_serialize(product)), 200
    finally:
        conn.close()


@products_bp.route('', methods=['POST'])
@jwt_required()
def create_product():
    claims = get_jwt()
    user = _user_from_jwt(claims, get_jwt_identity())

    if not has_permission(user, PERMISSIONS.CREATE_PRODUCTS):
        return jsonify({'error': 'Permission denied'}), 403

    data = request.get_json() or {}
    product_id = str(uuid.uuid4())
    branch_id = user.get('branch_id') or data.get('branch_id')

    conn = get_db()
    try:
        execute(conn, '''
            INSERT INTO products
              (id, name, sku, category, price, cost, stock, min_stock,
               unit, batch, expiry_date, description, branch_id, created_by)
            VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)
        ''', (
            product_id,
            data.get('name', ''),
            data.get('sku', ''),
            data.get('category', ''),
            float(data.get('price', 0)),
            float(data.get('cost', 0)),
            int(data.get('stock', 0)),
            int(data.get('minStock', data.get('min_stock', 0))),
            data.get('unit', 'pcs'),
            data.get('batch', ''),
            data.get('expiryDate') or data.get('expiry_date') or None,
            data.get('description', ''),
            branch_id,
            user['id'],
        ))
        conn.commit()
        product = query_one(conn, 'SELECT * FROM products WHERE id = ?', (product_id,))
        return jsonify(_serialize(product)), 201
    finally:
        conn.close()


@products_bp.route('/<product_id>', methods=['PUT'])
@jwt_required()
def update_product(product_id):
    claims = get_jwt()
    user = _user_from_jwt(claims, get_jwt_identity())

    if not has_permission(user, PERMISSIONS.EDIT_PRODUCTS):
        return jsonify({'error': 'Permission denied'}), 403

    conn = get_db()
    try:
        product = query_one(conn, 'SELECT * FROM products WHERE id = ?', (product_id,))
        if not product:
            return jsonify({'error': 'Product not found'}), 404

        all_ids = [r['id'] for r in query_all(conn, 'SELECT id FROM branches')]
        from auth.rbac import get_accessible_branch_ids
        accessible = get_accessible_branch_ids(user, all_ids)
        if product.get('branch_id') and product['branch_id'] not in accessible:
            return jsonify({'error': 'Access denied'}), 403

        data = request.get_json() or {}
        execute(conn, '''
            UPDATE products SET
              name=?, sku=?, category=?, price=?, cost=?,
              stock=?, min_stock=?, unit=?, batch=?,
              expiry_date=?, description=?
            WHERE id=?
        ''', (
            data.get('name', product['name']),
            data.get('sku', product['sku']),
            data.get('category', product['category']),
            float(data.get('price', product['price'])),
            float(data.get('cost', product['cost'])),
            int(data.get('stock', product['stock'])),
            int(data.get('minStock') or data.get('min_stock') or product['min_stock']),
            data.get('unit', product['unit']),
            data.get('batch', product['batch']),
            data.get('expiryDate') or data.get('expiry_date') or product.get('expiry_date'),
            data.get('description', product['description']),
            product_id,
        ))
        conn.commit()
        updated = query_one(conn, 'SELECT * FROM products WHERE id = ?', (product_id,))
        return jsonify(_serialize(updated)), 200
    finally:
        conn.close()


@products_bp.route('/<product_id>', methods=['DELETE'])
@jwt_required()
def delete_product(product_id):
    claims = get_jwt()
    user = _user_from_jwt(claims, get_jwt_identity())

    if not has_permission(user, PERMISSIONS.DELETE_PRODUCTS):
        return jsonify({'error': 'Permission denied'}), 403

    conn = get_db()
    try:
        product = query_one(conn, 'SELECT * FROM products WHERE id = ?', (product_id,))
        if not product:
            return jsonify({'error': 'Product not found'}), 404

        all_ids = [r['id'] for r in query_all(conn, 'SELECT id FROM branches')]
        from auth.rbac import get_accessible_branch_ids
        accessible = get_accessible_branch_ids(user, all_ids)
        if product.get('branch_id') and product['branch_id'] not in accessible:
            return jsonify({'error': 'Access denied'}), 403

        execute(conn, 'DELETE FROM products WHERE id = ?', (product_id,))
        conn.commit()
        return jsonify({'message': 'Product deleted'}), 200
    finally:
        conn.close()
