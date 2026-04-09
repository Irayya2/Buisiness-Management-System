from flask import Blueprint, request, jsonify
from flask_jwt_extended import (
    create_access_token, jwt_required, get_jwt_identity
)
import bcrypt

from database import get_db, query_one, query_all
from auth.rbac import get_role_display_name

auth_bp = Blueprint('auth', __name__)


def _get_user_with_accessible_branches(conn, user_row: dict) -> dict:
    """Enrich a user dict with accessible_branch_ids list."""
    rows = query_all(
        conn,
        'SELECT branch_id FROM user_accessible_branches WHERE user_id = ?',
        (user_row['id'],)
    )
    user_row['accessible_branch_ids'] = [r['branch_id'] for r in rows]
    user_row['role_display_name'] = get_role_display_name(user_row['role'])
    return user_row


@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json() or {}
    username = (data.get('username') or '').strip().lower()
    password = (data.get('password') or '').strip()

    if not username or not password:
        return jsonify({'error': 'Username and password are required'}), 400

    conn = get_db()
    try:
        user = query_one(
            conn,
            '''SELECT id, username, email, password_hash, role, name,
                      branch_id, cluster_id, sales_id
               FROM users
               WHERE LOWER(username) = ?''',
            (username,)
        )

        if not user:
            return jsonify({'error': 'Invalid credentials'}), 401

        # Verify password
        if not bcrypt.checkpw(password.encode(), user['password_hash'].encode()):
            return jsonify({'error': 'Invalid credentials'}), 401

        user = _get_user_with_accessible_branches(conn, user)
        user.pop('password_hash', None)

        # Create JWT (identity = user id, extra claims = role + branch)
        token = create_access_token(
            identity=user['id'],
            additional_claims={
                'role': user['role'],
                'branch_id': user.get('branch_id'),
                'cluster_id': user.get('cluster_id'),
                'sales_id': user.get('sales_id'),
                'accessible_branch_ids': user.get('accessible_branch_ids', []),
            }
        )

        return jsonify({'token': token, 'user': user}), 200
    finally:
        conn.close()


@auth_bp.route('/logout', methods=['POST'])
@jwt_required()
def logout():
    # Stateless JWT - just acknowledge
    return jsonify({'message': 'Logged out successfully'}), 200


@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def me():
    user_id = get_jwt_identity()
    conn = get_db()
    try:
        user = query_one(
            conn,
            '''SELECT id, username, email, role, name,
                      branch_id, cluster_id, sales_id
               FROM users WHERE id = ?''',
            (user_id,)
        )
        if not user:
            return jsonify({'error': 'User not found'}), 404

        user = _get_user_with_accessible_branches(conn, user)
        return jsonify(user), 200
    finally:
        conn.close()
