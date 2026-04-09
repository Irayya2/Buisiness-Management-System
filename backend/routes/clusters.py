from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt

from database import get_db, query_all
from auth.rbac import PERMISSIONS, has_permission

clusters_bp = Blueprint('clusters', __name__)


@clusters_bp.route('', methods=['GET'])
@jwt_required()
def get_clusters():
    claims = get_jwt()
    user = {'role': claims.get('role')}

    if not has_permission(user, PERMISSIONS.VIEW_CLUSTERS):
        return jsonify({'error': 'Permission denied'}), 403

    conn = get_db()
    try:
        clusters = query_all(conn, 'SELECT id, name, created_at FROM clusters')
        for c in clusters:
            if c.get('created_at'):
                c['created_at'] = c['created_at'].isoformat() if hasattr(c['created_at'], "isoformat") else c['created_at']
        return jsonify(clusters), 200
    finally:
        conn.close()
