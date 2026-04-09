import uuid
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt, get_jwt_identity

from database import get_db, query_all, query_one, execute
from auth.rbac import PERMISSIONS, has_permission, build_branch_filter, get_accessible_branch_ids

suppliers_bp = Blueprint('suppliers', __name__)


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


@suppliers_bp.route('', methods=['GET'])
@jwt_required()
def get_suppliers():
    claims = get_jwt()
    user = _user_from_jwt(claims, get_jwt_identity())
    if not has_permission(user, PERMISSIONS.VIEW_SUPPLIERS):
        return jsonify({'error': 'Permission denied'}), 403
    conn = get_db()
    try:
        all_ids = [r['id'] for r in query_all(conn, 'SELECT id FROM branches')]
        bf, params = build_branch_filter(user, all_ids, alias='s')
        rows = query_all(conn, f'''
            SELECT s.id, s.name, s.email, s.phone, s.address,
                   s.contact_person, s.branch_id, s.created_at
            FROM suppliers s WHERE 1=1 {bf} ORDER BY s.name
        ''', params)
        return jsonify([_serialize(r) for r in rows]), 200
    finally:
        conn.close()


@suppliers_bp.route('/<sid>', methods=['GET'])
@jwt_required()
def get_supplier(sid):
    claims = get_jwt()
    user = _user_from_jwt(claims, get_jwt_identity())
    if not has_permission(user, PERMISSIONS.VIEW_SUPPLIERS):
        return jsonify({'error': 'Permission denied'}), 403
    conn = get_db()
    try:
        row = query_one(conn, 'SELECT * FROM suppliers WHERE id=?', (sid,))
        if not row:
            return jsonify({'error': 'Not found'}), 404
        return jsonify(_serialize(row)), 200
    finally:
        conn.close()


@suppliers_bp.route('', methods=['POST'])
@jwt_required()
def create_supplier():
    claims = get_jwt()
    user = _user_from_jwt(claims, get_jwt_identity())
    if not has_permission(user, PERMISSIONS.CREATE_SUPPLIERS):
        return jsonify({'error': 'Permission denied'}), 403
    data = request.get_json() or {}
    sid = str(uuid.uuid4())
    branch_id = user.get('branch_id') or data.get('branchId') or data.get('branch_id')
    conn = get_db()
    try:
        execute(conn, '''
            INSERT INTO suppliers (id, name, email, phone, address, contact_person, branch_id)
            VALUES (?,?,?,?,?,?,?)
        ''', (sid, data.get('name',''), data.get('email',''), data.get('phone',''),
              data.get('address',''), data.get('contactPerson') or data.get('contact_person',''),
              branch_id))
        conn.commit()
        row = query_one(conn, 'SELECT * FROM suppliers WHERE id=?', (sid,))
        return jsonify(_serialize(row)), 201
    finally:
        conn.close()


@suppliers_bp.route('/<sid>', methods=['PUT'])
@jwt_required()
def update_supplier(sid):
    claims = get_jwt()
    user = _user_from_jwt(claims, get_jwt_identity())
    if not has_permission(user, PERMISSIONS.EDIT_SUPPLIERS):
        return jsonify({'error': 'Permission denied'}), 403
    conn = get_db()
    try:
        row = query_one(conn, 'SELECT * FROM suppliers WHERE id=?', (sid,))
        if not row:
            return jsonify({'error': 'Not found'}), 404
        data = request.get_json() or {}
        execute(conn, '''
            UPDATE suppliers SET name=?, email=?, phone=?, address=?, contact_person=? WHERE id=?
        ''', (data.get('name', row['name']), data.get('email', row['email']),
              data.get('phone', row['phone']), data.get('address', row['address']),
              data.get('contactPerson') or data.get('contact_person') or row['contact_person'], sid))
        conn.commit()
        return jsonify(_serialize(query_one(conn, 'SELECT * FROM suppliers WHERE id=?', (sid,)))), 200
    finally:
        conn.close()


@suppliers_bp.route('/<sid>', methods=['DELETE'])
@jwt_required()
def delete_supplier(sid):
    claims = get_jwt()
    user = _user_from_jwt(claims, get_jwt_identity())
    if not has_permission(user, PERMISSIONS.DELETE_SUPPLIERS):
        return jsonify({'error': 'Permission denied'}), 403
    conn = get_db()
    try:
        execute(conn, 'DELETE FROM suppliers WHERE id=?', (sid,))
        conn.commit()
        return jsonify({'message': 'Deleted'}), 200
    finally:
        conn.close()
