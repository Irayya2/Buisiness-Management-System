import sqlite3
import os
from config import Config


def dict_factory(cursor, row):
    d = {}
    for idx, col in enumerate(cursor.description):
        d[col[0]] = row[idx]
    return d


def get_db():
    """Return a new SQLite connection."""
    try:
        # DB_PATH will be configured in config.py
        conn = sqlite3.connect(Config.DB_PATH, timeout=10.0)
        conn.row_factory = dict_factory
        return conn
    except Exception as e:
        raise RuntimeError(f'Database connection failed: {e}')


def query_one(conn, sql, params=None):
    """Execute a SELECT and return a single row as a dict."""
    cursor = conn.cursor()
    cursor.execute(sql, params or ())
    row = cursor.fetchone()
    cursor.close()
    return row


def query_all(conn, sql, params=None):
    """Execute a SELECT and return all rows as a list of dicts."""
    cursor = conn.cursor()
    cursor.execute(sql, params or ())
    rows = cursor.fetchall()
    cursor.close()
    return rows


def execute(conn, sql, params=None):
    """Execute an INSERT / UPDATE / DELETE. Returns lastrowid."""
    cursor = conn.cursor()
    cursor.execute(sql, params or ())
    last_id = cursor.lastrowid
    conn.commit()
    cursor.close()
    return last_id


def execute_many(conn, sql, data):
    """Execute a bulk INSERT with executemany."""
    cursor = conn.cursor()
    cursor.executemany(sql, data)
    conn.commit()
    cursor.close()
