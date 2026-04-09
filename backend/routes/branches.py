from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt, get_jwt_identity

from database import get_db, query_all, query_one
from auth.rbac import has_permission, PERMISSIONS, get_accessible_branch_ids

branches_bp = Blueprint('branches', __name__)


@branches_bp.route('', methods=['GET'])
@jwt_required()
def get_branches():
    claims = get_jwt()
    user = {
        'id': get_jwt_identity(),
        'role': claims.get('role'),
        'branch_id': claims.get('branch_id'),
        'accessible_branch_ids': claims.get('accessible_branch_ids', []),
    }

    conn = get_db()
    try:
        all_branches = query_all(conn, 'SELECT id, name, address, cluster_id, created_at FROM branches')
        all_ids = [b['id'] for b in all_branches]
        accessible = get_accessible_branch_ids(user, all_ids)
        result = [b for b in all_branches if b['id'] in accessible]
        # Convert datetime to string
        for b in result:
            if b.get('created_at'):
                b['created_at'] = b['created_at'].isoformat() if hasattr(b['created_at'], "isoformat") else b['created_at']
        return jsonify(result), 200
    finally:
        conn.close()


@branches_bp.route('/<branch_id>', methods=['GET'])
@jwt_required()
def get_branch(branch_id):
    claims = get_jwt()
    user = {
        'role': claims.get('role'),
        'branch_id': claims.get('branch_id'),
        'accessible_branch_ids': claims.get('accessible_branch_ids', []),
    }

    conn = get_db()
    try:
        all_branches = query_all(conn, 'SELECT id FROM branches')
        all_ids = [b['id'] for b in all_branches]
        accessible = get_accessible_branch_ids(user, all_ids)

        if branch_id not in accessible:
            return jsonify({'error': 'Access denied'}), 403

        branch = query_one(
            conn,
            'SELECT id, name, address, cluster_id, created_at FROM branches WHERE id = ?',
            (branch_id,)
        )
        if not branch:
            return jsonify({'error': 'Branch not found'}), 404

        if branch.get('created_at'):
            branch['created_at'] = branch['created_at'].isoformat() if hasattr(branch['created_at'], "isoformat") else branch['created_at']
        return jsonify(branch), 200
    finally:
        conn.close()
