import datetime
import uuid
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt, get_jwt_identity

from database import get_db, query_all, query_one, execute, execute_many
from auth.rbac import PERMISSIONS, has_permission, build_branch_filter, get_accessible_branch_ids

invoices_bp = Blueprint('invoices', __name__)


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


def _attach_items(conn, invoices):
    if not invoices:
        return invoices
    ids = [i['id'] for i in invoices]
    placeholders = ','.join(['?'] * len(ids))
    items = query_all(conn, f'SELECT * FROM invoice_items WHERE invoice_id IN ({placeholders})', ids)
    items_map = {}
    for item in items:
        items_map.setdefault(item['invoice_id'], []).append(item)
    for inv in invoices:
        inv['items'] = items_map.get(inv['id'], [])
    return invoices


@invoices_bp.route('', methods=['GET'])
@jwt_required()
def get_invoices():
    claims = get_jwt()
    user = _user_from_jwt(claims, get_jwt_identity())
    if not has_permission(user, PERMISSIONS.VIEW_BILLING):
        return jsonify({'error': 'Permission denied'}), 403
    conn = get_db()
    try:
        all_ids = [r['id'] for r in query_all(conn, 'SELECT id FROM branches')]
        bf, params = build_branch_filter(user, all_ids, alias='i')
        rows = query_all(conn, f'''
            SELECT i.id, i.invoice_number, i.order_id, i.order_number,
                   i.customer_id, i.customer_name, i.customer_address,
                   i.subtotal, i.tax, i.total, i.status, i.payment_method,
                   i.branch_id, i.due_date, i.paid_date, i.created_by, i.created_at
            FROM invoices i WHERE 1=1 {bf} ORDER BY i.created_at DESC
        ''', params)
        rows = _attach_items(conn, rows)
        return jsonify([_serialize(r) for r in rows]), 200
    finally:
        conn.close()


@invoices_bp.route('/<iid>', methods=['GET'])
@jwt_required()
def get_invoice(iid):
    claims = get_jwt()
    user = _user_from_jwt(claims, get_jwt_identity())
    if not has_permission(user, PERMISSIONS.VIEW_BILLING):
        return jsonify({'error': 'Permission denied'}), 403
    conn = get_db()
    try:
        row = query_one(conn, 'SELECT * FROM invoices WHERE id=?', (iid,))
        if not row:
            return jsonify({'error': 'Not found'}), 404
        row['items'] = query_all(conn, 'SELECT * FROM invoice_items WHERE invoice_id=?', (iid,))
        return jsonify(_serialize(row)), 200
    finally:
        conn.close()


@invoices_bp.route('', methods=['POST'])
@jwt_required()
def create_invoice():
    claims = get_jwt()
    user = _user_from_jwt(claims, get_jwt_identity())
    if not has_permission(user, PERMISSIONS.CREATE_INVOICES):
        return jsonify({'error': 'Permission denied'}), 403
    data = request.get_json() or {}
    iid = f'INV-{int(__import__("time").time() * 1000)}'
    branch_id = user.get('branch_id') or data.get('branchId') or data.get('branch_id')
    items = data.get('items', [])
    conn = get_db()
    try:
        execute(conn, '''
            INSERT INTO invoices
              (id, invoice_number, order_id, order_number, customer_id, customer_name,
               customer_address, subtotal, tax, total, status, payment_method,
               branch_id, due_date, created_by)
            VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
        ''', (
            iid, data.get('invoiceNumber', iid),
            data.get('orderId') or data.get('order_id'),
            data.get('orderNumber') or data.get('order_number', ''),
            data.get('customerId') or data.get('customer_id'),
            data.get('customerName') or data.get('customer_name', ''),
            data.get('customerAddress') or data.get('customer_address', ''),
            float(data.get('subtotal', 0)), float(data.get('tax', 0)), float(data.get('total', 0)),
            data.get('status', 'pending'),
            data.get('paymentMethod') or data.get('payment_method'),
            branch_id,
            data.get('dueDate') or data.get('due_date'),
            user['id'],
        ))
        if items:
            execute_many(conn, '''
                INSERT INTO invoice_items (invoice_id, product_id, name, quantity, price)
                VALUES (?,?,?,?,?)
            ''', [(iid, i.get('productId') or i.get('product_id'),
                   i.get('name',''), int(i.get('quantity', 1)), float(i.get('price', 0)))
                  for i in items])
        conn.commit()
        row = query_one(conn, 'SELECT * FROM invoices WHERE id=?', (iid,))
        row['items'] = query_all(conn, 'SELECT * FROM invoice_items WHERE invoice_id=?', (iid,))
        return jsonify(_serialize(row)), 201
    finally:
        conn.close()


@invoices_bp.route('/<iid>', methods=['PUT'])
@jwt_required()
def update_invoice(iid):
    claims = get_jwt()
    user = _user_from_jwt(claims, get_jwt_identity())
    if not has_permission(user, PERMISSIONS.EDIT_INVOICES):
        return jsonify({'error': 'Permission denied'}), 403
    conn = get_db()
    try:
        row = query_one(conn, 'SELECT * FROM invoices WHERE id=?', (iid,))
        if not row:
            return jsonify({'error': 'Not found'}), 404
        data = request.get_json() or {}
        paid_date = None
        if data.get('status') == 'paid' and not row.get('paid_date'):
            paid_date = datetime.datetime.utcnow().isoformat()
        execute(conn, '''
            UPDATE invoices SET status=?, payment_method=?, paid_date=COALESCE(?, paid_date)
            WHERE id=?
        ''', (data.get('status', row['status']),
              data.get('paymentMethod') or data.get('payment_method') or row.get('payment_method'),
              paid_date, iid))
        conn.commit()
        updated = query_one(conn, 'SELECT * FROM invoices WHERE id=?', (iid,))
        updated['items'] = query_all(conn, 'SELECT * FROM invoice_items WHERE invoice_id=?', (iid,))
        return jsonify(_serialize(updated)), 200
    finally:
        conn.close()


@invoices_bp.route('/<iid>', methods=['DELETE'])
@jwt_required()
def delete_invoice(iid):
    claims = get_jwt()
    user = _user_from_jwt(claims, get_jwt_identity())
    if not has_permission(user, PERMISSIONS.DELETE_INVOICES):
        return jsonify({'error': 'Permission denied'}), 403
    conn = get_db()
    try:
        execute(conn, 'DELETE FROM invoices WHERE id=?', (iid,))
        conn.commit()
        return jsonify({'message': 'Deleted'}), 200
    finally:
        conn.close()
