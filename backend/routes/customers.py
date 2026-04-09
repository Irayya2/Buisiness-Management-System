import uuid
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt, get_jwt_identity

from database import get_db, query_all, query_one, execute
from auth.rbac import PERMISSIONS, has_permission, build_branch_filter, get_accessible_branch_ids

customers_bp = Blueprint('customers', __name__)


def _user_from_jwt(claims, uid):
    return {
        'id': uid, 'role': claims.get('role'),
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


@customers_bp.route('', methods=['GET'])
@jwt_required()
def get_customers():
    claims = get_jwt()
    user = _user_from_jwt(claims, get_jwt_identity())

    if not has_permission(user, PERMISSIONS.VIEW_CUSTOMERS):
        return jsonify({'error': 'Permission denied'}), 403

    conn = get_db()
    try:
        all_ids = [r['id'] for r in query_all(conn, 'SELECT id FROM branches')]
        bf, params = build_branch_filter(user, all_ids, alias='c')
        rows = query_all(conn, f'''
            SELECT c.id, c.name, c.email, c.phone, c.address, c.type,
                   c.credit_limit, c.branch_id, c.created_at, c.updated_at
            FROM customers c WHERE 1=1 {bf} ORDER BY c.name
        ''', params)
        return jsonify([_serialize(r) for r in rows]), 200
    finally:
        conn.close()


@customers_bp.route('/<cid>', methods=['GET'])
@jwt_required()
def get_customer(cid):
    claims = get_jwt()
    user = _user_from_jwt(claims, get_jwt_identity())
    if not has_permission(user, PERMISSIONS.VIEW_CUSTOMERS):
        return jsonify({'error': 'Permission denied'}), 403
    conn = get_db()
    try:
        row = query_one(conn, 'SELECT * FROM customers WHERE id=?', (cid,))
        if not row:
            return jsonify({'error': 'Not found'}), 404
        all_ids = [r['id'] for r in query_all(conn, 'SELECT id FROM branches')]
        if row.get('branch_id') and row['branch_id'] not in get_accessible_branch_ids(user, all_ids):
            return jsonify({'error': 'Access denied'}), 403
        return jsonify(_serialize(row)), 200
    finally:
        conn.close()


@customers_bp.route('', methods=['POST'])
@jwt_required()
def create_customer():
    claims = get_jwt()
    user = _user_from_jwt(claims, get_jwt_identity())
    if not has_permission(user, PERMISSIONS.CREATE_CUSTOMERS):
        return jsonify({'error': 'Permission denied'}), 403
    data = request.get_json() or {}
    cid = str(uuid.uuid4())
    branch_id = user.get('branch_id') or data.get('branchId') or data.get('branch_id')
    conn = get_db()
    try:
        execute(conn, '''
            INSERT INTO customers (id, name, email, phone, address, type, credit_limit, branch_id)
            VALUES (?,?,?,?,?,?,?,?)
        ''', (cid, data.get('name',''), data.get('email',''), data.get('phone',''),
              data.get('address',''), data.get('type','retail'),
              float(data.get('creditLimit', data.get('credit_limit', 0))), branch_id))
        conn.commit()
        row = query_one(conn, 'SELECT * FROM customers WHERE id=?', (cid,))
        return jsonify(_serialize(row)), 201
    finally:
        conn.close()


@customers_bp.route('/<cid>', methods=['PUT'])
@jwt_required()
def update_customer(cid):
    claims = get_jwt()
    user = _user_from_jwt(claims, get_jwt_identity())
    if not has_permission(user, PERMISSIONS.EDIT_CUSTOMERS):
        return jsonify({'error': 'Permission denied'}), 403
    conn = get_db()
    try:
        row = query_one(conn, 'SELECT * FROM customers WHERE id=?', (cid,))
        if not row:
            return jsonify({'error': 'Not found'}), 404
        data = request.get_json() or {}
        execute(conn, '''
            UPDATE customers SET name=?, email=?, phone=?, address=?, type=?, credit_limit=?
            WHERE id=?
        ''', (data.get('name', row['name']), data.get('email', row['email']),
              data.get('phone', row['phone']), data.get('address', row['address']),
              data.get('type', row['type']),
              float(data.get('creditLimit') or data.get('credit_limit') or row['credit_limit']),
              cid))
        conn.commit()
        return jsonify(_serialize(query_one(conn, 'SELECT * FROM customers WHERE id=?', (cid,)))), 200
    finally:
        conn.close()


@customers_bp.route('/<cid>', methods=['DELETE'])
@jwt_required()
def delete_customer(cid):
    claims = get_jwt()
    user = _user_from_jwt(claims, get_jwt_identity())
    if not has_permission(user, PERMISSIONS.DELETE_CUSTOMERS):
        return jsonify({'error': 'Permission denied'}), 403
    conn = get_db()
    try:
        execute(conn, 'DELETE FROM customers WHERE id=?', (cid,))
        conn.commit()
        return jsonify({'message': 'Deleted'}), 200
    finally:
        conn.close()
