#!/usr/bin/env python3
"""
Initialize database and seed demo data
Run this once before starting the Flask backend
"""

import sys
import os
import bcrypt
import sqlite3

# Add backend to path
sys.path.insert(0, os.path.dirname(__file__))

from config import Config

def get_connection():
    """Create a connection to SQLite"""
    try:
        conn = sqlite3.connect(Config.DB_PATH)
        return conn
    except Exception as e:
        print(f"❌ Database connection failed: {e}")
        sys.exit(1)

def init_database():
    """Initialize database schema and seed data"""
    conn = get_connection()
    cursor = conn.cursor()
    
    try:
        print("📦 Initializing database...")
        
        # Read and execute schema
        schema_path = os.path.join(os.path.dirname(__file__), '..', 'database', 'schema.sql')
        with open(schema_path, 'r') as f:
            schema = f.read()
        
        # Split by GO or semicolon and execute
        for statement in schema.split(';'):
            if statement.strip():
                try:
                    cursor.execute(statement)
                except Exception as e:
                    print(f"⚠️  {e}")
        
        conn.commit()
        print("✅ Database schema created/verified")
        
        # Seed demo users with bcrypt hashes
        print("🌱 Seeding demo users...")
        demo_users = [
            ('user-1', 'director', 'director@company.com', 'director123', 'director', 'Director', None, None),
            ('user-2', 'assistant', 'assistant@company.com', 'assistant123', 'assistant', 'Assistant', None, None),
            ('user-3', 'clusterhead', 'clusterhead@company.com', 'cluster123', 'cluster_head', 'Cluster Head', None, 'cluster-1'),
            ('user-4', 'clustermgr', 'clustermgr@company.com', 'clustermgr123', 'cluster_manager', 'Cluster Manager', None, 'cluster-1'),
            ('user-5', 'branchmgr', 'branchmgr@company.com', 'branchmgr123', 'branch_manager', 'Branch Manager', 'branch-1', 'cluster-1'),
            ('user-6', 'billing', 'billing@company.com', 'billing123', 'billing_staff', 'Billing Staff', 'branch-1', 'cluster-1'),
            ('user-7', 'salesman', 'salesman@company.com', 'sales123', 'salesman', 'Salesman', 'branch-1', 'cluster-1'),
            ('user-8', 'accountant', 'accountant@company.com', 'account123', 'accountant', 'Accountant', 'branch-1', 'cluster-1'),
        ]
        
        for user_id, username, email, password, role, name, branch_id, cluster_id in demo_users:
            # Hash password with bcrypt
            password_hash = bcrypt.hashpw(password.encode(), bcrypt.gensalt(12)).decode()
            
            try:
                # SQLite doesn't have ON DUPLICATE KEY, use INSERT OR REPLACE
                cursor.execute(
                    '''INSERT OR REPLACE INTO users (id, username, email, password_hash, role, name, branch_id, cluster_id)
                       VALUES (?, ?, ?, ?, ?, ?, ?, ?)''',
                    (user_id, username, email, password_hash, role, name, branch_id, cluster_id)
                )
            except Exception as e:
                print(f"⚠️  {username}: {e}")
        
        conn.commit()
        print("✅ Demo users seeded successfully")
        
        # Verify schema
        cursor.execute("SELECT COUNT(*) FROM sqlite_master WHERE type='table'")
        table_count = cursor.fetchone()[0]
        print(f"✅ Database has {table_count} tables")
        
    except Exception as e:
        print(f"❌ Error: {e}")
        conn.rollback()
        sys.exit(1)
    finally:
        cursor.close()
        conn.close()

if __name__ == '__main__':
    print("╔════════════════════════════════════════════════════╗")
    print("║  Database Initialization Script                    ║")
    print("╚════════════════════════════════════════════════════╝")
    print()
    init_database()
    print()
    print("✅ Database initialization complete!")
    print("You can now start the backend with: python3 app.py")
