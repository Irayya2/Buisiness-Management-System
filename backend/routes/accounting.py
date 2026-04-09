import datetime
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt, get_jwt_identity

from database import get_db, query_all, query_one, execute
from auth.rbac import PERMISSIONS, has_permission, build_branch_filter

accounting_bp = Blueprint('accounting', __name__)


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


@accounting_bp.route('', methods=['GET'])
@jwt_required()
def get_entries():
    claims = get_jwt()
    user = _user_from_jwt(claims, get_jwt_identity())
    if not has_permission(user, PERMISSIONS.VIEW_ACCOUNTS):
        return jsonify({'error': 'Permission denied'}), 403
    conn = get_db()
    try:
        all_ids = [r['id'] for r in query_all(conn, 'SELECT id FROM branches')]
        bf, params = build_branch_filter(user, all_ids, alias='a')
        rows = query_all(conn, f'''
            SELECT a.id, a.type, a.category, a.amount, a.description,
                   a.reference, a.entry_date AS date, a.branch_id, a.created_by, a.created_at
            FROM accounting_entries a WHERE 1=1 {bf} ORDER BY a.entry_date DESC
        ''', params)
        return jsonify([_serialize(r) for r in rows]), 200
    finally:
        conn.close()


@accounting_bp.route('/<eid>', methods=['GET'])
@jwt_required()
def get_entry(eid):
    claims = get_jwt()
    user = _user_from_jwt(claims, get_jwt_identity())
    if not has_permission(user, PERMISSIONS.VIEW_ACCOUNTS):
        return jsonify({'error': 'Permission denied'}), 403
    conn = get_db()
    try:
        row = query_one(conn, 'SELECT * FROM accounting_entries WHERE id=?', (eid,))
        if not row:
            return jsonify({'error': 'Not found'}), 404
        return jsonify(_serialize(row)), 200
    finally:
        conn.close()


@accounting_bp.route('', methods=['POST'])
@jwt_required()
def create_entry():
    claims = get_jwt()
    user = _user_from_jwt(claims, get_jwt_identity())
    if not has_permission(user, PERMISSIONS.CREATE_ACCOUNTS):
        return jsonify({'error': 'Permission denied'}), 403
    data = request.get_json() or {}

    eid = f'ACC-{int(__import__("time").time() * 1000)}'
    branch_id = user.get('branch_id') or data.get('branchId') or data.get('branch_id')
    conn = get_db()
    try:
        execute(conn, '''
            INSERT INTO accounting_entries
              (id, type, category, amount, description, reference, entry_date, branch_id, created_by)
            VALUES (?,?,?,?,?,?,?,?,?)
        ''', (
            eid,
            data.get('type', 'debit'),
            data.get('category', ''),
            float(data.get('amount', 0)),
            data.get('description', ''),
            data.get('reference', ''),
            data.get('date') or datetime.datetime.utcnow().isoformat(),
            branch_id,
            user['id'],
        ))
        conn.commit()
        row = query_one(conn, 'SELECT * FROM accounting_entries WHERE id=?', (eid,))
        return jsonify(_serialize(row)), 201
    finally:
        conn.close()


@accounting_bp.route('/<eid>', methods=['PUT'])
@jwt_required()
def update_entry(eid):
    claims = get_jwt()
    user = _user_from_jwt(claims, get_jwt_identity())
    if not has_permission(user, PERMISSIONS.EDIT_ACCOUNTS):
        return jsonify({'error': 'Permission denied'}), 403
    conn = get_db()
    try:
        row = query_one(conn, 'SELECT * FROM accounting_entries WHERE id=?', (eid,))
        if not row:
            return jsonify({'error': 'Not found'}), 404
        data = request.get_json() or {}
        execute(conn, '''
            UPDATE accounting_entries
            SET type=?, category=?, amount=?, description=?, reference=?
            WHERE id=?
        ''', (
            data.get('type', row['type']),
            data.get('category', row['category']),
            float(data.get('amount', row['amount'])),
            data.get('description', row['description']),
            data.get('reference', row['reference']),
            eid,
        ))
        conn.commit()
        return jsonify(_serialize(query_one(conn, 'SELECT * FROM accounting_entries WHERE id=?', (eid,)))), 200
    finally:
        conn.close()


@accounting_bp.route('/<eid>', methods=['DELETE'])
@jwt_required()
def delete_entry(eid):
    claims = get_jwt()
    user = _user_from_jwt(claims, get_jwt_identity())
    if not has_permission(user, PERMISSIONS.DELETE_ACCOUNTS):
        return jsonify({'error': 'Permission denied'}), 403
    conn = get_db()
    try:
        execute(conn, 'DELETE FROM accounting_entries WHERE id=?', (eid,))
        conn.commit()
        return jsonify({'message': 'Deleted'}), 200
    finally:
        conn.close()
