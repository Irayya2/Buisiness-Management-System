"""Shared helper functions used across route modules."""

from flask_jwt_extended import get_jwt, get_jwt_identity


def user_from_jwt():
    """Build a user dict from the current JWT claims."""
    claims = get_jwt()
    return {
        'id': get_jwt_identity(),
        'role': claims.get('role'),
        'branch_id': claims.get('branch_id'),
        'cluster_id': claims.get('cluster_id'),
        'sales_id': claims.get('sales_id'),
        'accessible_branch_ids': claims.get('accessible_branch_ids', []),
    }


def serialize(row):
    """Convert datetime values in a dict to ISO-format strings."""
    if not row:
        return row
    for k, v in row.items():
        if hasattr(v, 'isoformat'):
            row[k] = v.isoformat()
    return row
