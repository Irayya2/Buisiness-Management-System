#!/usr/bin/env python3
"""
seed_db.py - Imports schema and seeds the database with demo data.
Run once after creating the SQLite database.

Usage:
    cd /Applications/XAMPP/xamppfiles/htdocs/application/backend
    python seed_db.py
"""
import sys
import os
sys.path.insert(0, os.path.dirname(__file__))

import bcrypt
import sqlite3
from config import Config


# ── Passwords ─────────────────────────────────────────────────────────────────
USERS = [
    ('user-1', 'director',    'director@company.com',    'director123',    'director',        'Director',        None,       None,        None),
    ('user-2', 'assistant',   'assistant@company.com',   'assistant123',   'assistant',       'Assistant',       None,       None,        None),
    ('user-3', 'clusterhead', 'clusterhead@company.com', 'cluster123',     'cluster_head',    'Cluster Head',    None,       'cluster-1', None),
    ('user-4', 'clustermgr',  'clustermgr@company.com',  'clustermgr123',  'cluster_manager', 'Cluster Manager', None,       'cluster-1', None),
    ('user-5', 'branchmgr',   'branchmgr@company.com',   'branchmgr123',   'branch_manager',  'Branch Manager',  'branch-1', 'cluster-1', None),
    ('user-6', 'billing',     'billing@company.com',     'billing123',     'billing_staff',   'Billing Staff',   'branch-1', 'cluster-1', None),
    ('user-7', 'salesman',    'salesman@company.com',    'sales123',       'salesman',        'Salesman',        'branch-1', 'cluster-1', 'SALES-001'),
    ('user-8', 'accountant',  'accountant@company.com',  'account123',     'accountant',      'Accountant',      'branch-1', 'cluster-1', None),
]

USER_ACCESSIBLE_BRANCHES = [
    ('user-3', 'branch-1'),
    ('user-3', 'branch-2'),
    ('user-4', 'branch-1'),
]


def get_conn():
    return sqlite3.connect(Config.DB_PATH)


def run_sql_file(conn, filepath):
    """Execute a multi-statement SQL file."""
    with open(filepath, 'r') as f:
        sql = f.read()

    cursor = conn.cursor()
    for statement in sql.split(';'):
        stmt = statement.strip()
        if stmt:
            try:
                cursor.execute(stmt)
            except sqlite3.Error as e:
                print(f'  [WARN] {e}  (stmt: {stmt[:60]}...)')
    conn.commit()
    cursor.close()


def seed_users(conn):
    cursor = conn.cursor()
    # Clear existing to avoid duplicates
    cursor.execute('DELETE FROM user_accessible_branches')
    cursor.execute('DELETE FROM users')

    for uid, username, email, password, role, name, branch_id, cluster_id, sales_id in USERS:
        pw_hash = bcrypt.hashpw(password.encode(), bcrypt.gensalt(12)).decode()
        cursor.execute('''
            INSERT INTO users (id, username, email, password_hash, role, name, branch_id, cluster_id, sales_id)
            VALUES (?,?,?,?,?,?,?,?,?)
        ''', (uid, username, email, pw_hash, role, name, branch_id, cluster_id, sales_id))
        print(f'  ✓ user: {username} ({role})')

    for user_id, branch_id in USER_ACCESSIBLE_BRANCHES:
        cursor.execute(
            'INSERT INTO user_accessible_branches (user_id, branch_id) VALUES (?,?)',
            (user_id, branch_id)
        )

    conn.commit()
    cursor.close()


def main():
    base = os.path.dirname(os.path.dirname(__file__))  # application/
    schema_path = os.path.join(base, 'database', 'schema.sql')
    seed_path   = os.path.join(base, 'database', 'seed.sql')

    print('Connecting to SQLite...')
    conn = get_conn()
    print('Connected.')

    print('\n1. Applying schema...')
    run_sql_file(conn, schema_path)
    print('   Schema applied.')

    print('\n2. Seeding base data (clusters, branches, customers, suppliers, products, orders, invoices, sales, accounting)...')
    try:
        run_sql_file(conn, seed_path)
        print('   Base data seeded.')
    except Exception as e:
        print(f'   [NOTE] Some seed data may already exist: {e}')

    print('\n3. Seeding users with bcrypt passwords...')
    seed_users(conn)

    conn.close()
    print('\n✅ Database seeding complete!')
    print('\nYou can now start the backend:')
    print('   cd /Applications/XAMPP/xamppfiles/htdocs/application/backend')
    print('   python app.py')


if __name__ == '__main__':
    main()
