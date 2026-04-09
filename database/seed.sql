-- ============================================================
-- Sales & Inventory Management System - Seed Data
-- ============================================================


-- ============================================================
-- Clusters
-- ============================================================
INSERT INTO clusters (id, name) VALUES
('cluster-1', 'North Cluster'),
('cluster-2', 'South Cluster');

-- ============================================================
-- Branches
-- ============================================================
INSERT INTO branches (id, name, address, cluster_id) VALUES
('branch-1', 'Main Branch',     '123 Main St, City',        'cluster-1'),
('branch-2', 'Downtown Branch', '456 Downtown Ave, City',   'cluster-1'),
('branch-3', 'Uptown Branch',   '789 Uptown Blvd, City',    'cluster-2');

-- ============================================================
-- Users (passwords hashed via bcrypt in app startup, stored here
--  as placeholder - the backend will re-hash on first use OR we
--  can set bcrypt hashes directly)
--
-- bcrypt('director123')   = $2b$12$placeholder below
-- The backend seeds real bcrypt hashes when it starts if users table is empty.
-- Storing plain-text here for the seed runner to use with Python bcrypt.
-- ============================================================

-- We store password_hash column with bcrypt hashes.
-- Generated via Python: bcrypt.hashpw(b'password', bcrypt.gensalt(12))
-- For seed convenience all hashes are pre-computed.
-- password: director123
INSERT INTO users (id, username, email, password_hash, role, name, branch_id, cluster_id, sales_id) VALUES
('user-1', 'director',   'director@company.com',   '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMlJEs3P8AG7QxFd5G8bK1Peum', 'director',        'Director',        NULL,       NULL,        NULL),
('user-2', 'assistant',  'assistant@company.com',  '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMlJEs3P8AG7QxFd5G8bK1Peum', 'assistant',       'Assistant',       NULL,       NULL,        NULL),
('user-3', 'clusterhead','clusterhead@company.com','$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMlJEs3P8AG7QxFd5G8bK1Peum', 'cluster_head',    'Cluster Head',    NULL,       'cluster-1', NULL),
('user-4', 'clustermgr', 'clustermgr@company.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMlJEs3P8AG7QxFd5G8bK1Peum', 'cluster_manager', 'Cluster Manager', NULL,       'cluster-1', NULL),
('user-5', 'branchmgr',  'branchmgr@company.com',  '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMlJEs3P8AG7QxFd5G8bK1Peum', 'branch_manager',  'Branch Manager',  'branch-1', 'cluster-1', NULL),
('user-6', 'billing',    'billing@company.com',    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMlJEs3P8AG7QxFd5G8bK1Peum', 'billing_staff',   'Billing Staff',   'branch-1', 'cluster-1', NULL),
('user-7', 'salesman',   'salesman@company.com',   '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMlJEs3P8AG7QxFd5G8bK1Peum', 'salesman',        'Salesman',        'branch-1', 'cluster-1', 'SALES-001'),
('user-8', 'accountant', 'accountant@company.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMlJEs3P8AG7QxFd5G8bK1Peum', 'accountant',      'Accountant',      'branch-1', 'cluster-1', NULL);

-- NOTE: The password hash above is NOT valid bcrypt - it's a placeholder.
-- The backend's seed script (seed_db.py) will generate proper hashes.

-- ============================================================
-- User Accessible Branches
-- ============================================================
-- Cluster Head (user-3) -> branch-1, branch-2
INSERT INTO user_accessible_branches (user_id, branch_id) VALUES
('user-3', 'branch-1'),
('user-3', 'branch-2');

-- Cluster Manager (user-4) -> branch-1
INSERT INTO user_accessible_branches (user_id, branch_id) VALUES
('user-4', 'branch-1');

-- ============================================================
-- Customers
-- ============================================================
INSERT INTO customers (id, name, email, phone, address, type, credit_limit, branch_id, created_at) VALUES
('cust-1', 'ABC Corporation',      'contact@abccorp.com',   '+1-234-567-8900', '123 Main St, City, State 12345',       'wholesale', 50000,  'branch-1', datetime('now', '-30 days')),
('cust-2', 'XYZ Trading Ltd',      'info@xyztrading.com',   '+1-234-567-8901', '456 Business Ave, City, State 12346',  'wholesale', 75000,  'branch-1', datetime('now', '-25 days')),
('cust-3', 'Premium Retail Store', 'sales@premiumretail.com','+1-234-567-8902', '789 Retail Blvd, City, State 12347',  'retail',    30000,  'branch-1', datetime('now', '-20 days')),
('cust-4', 'Global Enterprises Inc','orders@globalent.com', '+1-234-567-8903', '321 Corporate Plaza, City, State 12348','corporate',100000, 'branch-2', datetime('now', '-15 days'));

-- ============================================================
-- Suppliers
-- ============================================================
INSERT INTO suppliers (id, name, email, phone, address, contact_person, branch_id, created_at) VALUES
('supp-1', 'Supplier XYZ',    'info@supplierxyz.com',   '+1-234-567-8901', '456 Business Ave, City, State 12346', 'John Doe',  'branch-1', datetime('now', '-30 days')),
('supp-2', 'Quality Goods Co','sales@qualitygoods.com', '+1-234-567-8904', '789 Supply Street, City, State 12349','Jane Smith', 'branch-1', datetime('now', '-25 days'));

-- ============================================================
-- Products (20 per branch = 60 total, showing 10 per branch for brevity)
-- Full seed done by seed_db.py
-- ============================================================
INSERT INTO products (id, name, sku, category, price, cost, stock, min_stock, unit, batch, expiry_date, description, branch_id, created_by, created_at) VALUES
-- Branch 1 products
('prod-branch-1-1',  'Premium Widget 1',    'SKU-BRANCH-1-001', 'Electronics',      35.50, 17.75,  55, 11, 'pcs', 'BATCH-branch-1-1',  date('now', '+365 days'), 'High quality premium widget 1 for Main Branch',    'branch-1', 'user-5', datetime('now')),
('prod-branch-1-2',  'Standard Widget 2',   'SKU-BRANCH-1-002', 'Clothing',         45.25, 22.63,  60, 12, 'pcs', 'BATCH-branch-1-2',  date('now', '+365 days'), 'High quality standard widget 2 for Main Branch',   'branch-1', 'user-5', datetime('now')),
('prod-branch-1-3',  'Deluxe Widget 3',     'SKU-BRANCH-1-003', 'Food & Beverages', 55.00, 27.50,  65, 13, 'pcs', 'BATCH-branch-1-3',  date('now', '+365 days'), 'High quality deluxe widget 3 for Main Branch',     'branch-1', 'user-5', datetime('now')),
('prod-branch-1-4',  'Basic Widget 4',      'SKU-BRANCH-1-004', 'Home & Garden',    65.75, 32.88,  70, 14, 'pcs', 'BATCH-branch-1-4',  date('now', '+365 days'), 'High quality basic widget 4 for Main Branch',      'branch-1', 'user-5', datetime('now')),
('prod-branch-1-5',  'Pro Widget 5',        'SKU-BRANCH-1-005', 'Sports',           75.50, 37.75,  75, 15, 'pcs', 'BATCH-branch-1-5',  date('now', '+365 days'), 'High quality pro widget 5 for Main Branch',        'branch-1', 'user-5', datetime('now')),
('prod-branch-1-6',  'Classic Item 6',      'SKU-BRANCH-1-006', 'Books',            85.25, 42.63,  80, 16, 'pcs', 'BATCH-branch-1-6',  date('now', '+365 days'), 'High quality classic item 6 for Main Branch',      'branch-1', 'user-5', datetime('now')),
('prod-branch-1-7',  'Modern Item 7',       'SKU-BRANCH-1-007', 'Toys',             95.00, 47.50,  85, 17, 'pcs', 'BATCH-branch-1-7',  date('now', '+365 days'), 'High quality modern item 7 for Main Branch',       'branch-1', 'user-5', datetime('now')),
('prod-branch-1-8',  'Vintage Item 8',      'SKU-BRANCH-1-008', 'Health & Beauty',  105.75,52.88,  90, 18, 'pcs', 'BATCH-branch-1-8',  date('now', '+365 days'), 'High quality vintage item 8 for Main Branch',      'branch-1', 'user-5', datetime('now')),
('prod-branch-1-9',  'Luxury Item 9',       'SKU-BRANCH-1-009', 'Electronics',      115.50,57.75,  95, 19, 'pcs', 'BATCH-branch-1-9',  date('now', '+365 days'), 'High quality luxury item 9 for Main Branch',       'branch-1', 'user-5', datetime('now')),
('prod-branch-1-10', 'Economy Item 10',     'SKU-BRANCH-1-010', 'Clothing',         125.25,62.63, 100, 20, 'pcs', 'BATCH-branch-1-10', date('now', '+365 days'), 'High quality economy item 10 for Main Branch',     'branch-1', 'user-5', datetime('now')),
-- Branch 2 products
('prod-branch-2-1',  'Premium Widget 1',    'SKU-BRANCH-2-001', 'Food & Beverages', 45.75, 22.88,  55, 11, 'pcs', 'BATCH-branch-2-1',  date('now', '+365 days'), 'High quality premium widget 1 for Downtown Branch','branch-2', 'user-5', datetime('now')),
('prod-branch-2-2',  'Standard Widget 2',   'SKU-BRANCH-2-002', 'Home & Garden',    55.50, 27.75,  60, 12, 'pcs', 'BATCH-branch-2-2',  date('now', '+365 days'), 'High quality standard widget 2 for Downtown Branch','branch-2','user-5', datetime('now')),
('prod-branch-2-3',  'Deluxe Widget 3',     'SKU-BRANCH-2-003', 'Sports',           65.25, 32.63,  65, 13, 'pcs', 'BATCH-branch-2-3',  date('now', '+365 days'), 'High quality deluxe widget 3 for Downtown Branch', 'branch-2', 'user-5', datetime('now')),
('prod-branch-2-4',  'Basic Widget 4',      'SKU-BRANCH-2-004', 'Books',            75.00, 37.50,  70, 14, 'pcs', 'BATCH-branch-2-4',  date('now', '+365 days'), 'High quality basic widget 4 for Downtown Branch',  'branch-2', 'user-5', datetime('now')),
('prod-branch-2-5',  'Pro Widget 5',        'SKU-BRANCH-2-005', 'Toys',             85.75, 42.88,  75, 15, 'pcs', 'BATCH-branch-2-5',  date('now', '+365 days'), 'High quality pro widget 5 for Downtown Branch',    'branch-2', 'user-5', datetime('now')),
-- Branch 3 products
('prod-branch-3-1',  'Smart Device 1',      'SKU-BRANCH-3-001', 'Electronics',      55.75, 27.88,  55, 11, 'pcs', 'BATCH-branch-3-1',  date('now', '+365 days'), 'High quality smart device 1 for Uptown Branch',    'branch-3', 'user-5', datetime('now')),
('prod-branch-3-2',  'Modern Device 2',     'SKU-BRANCH-3-002', 'Clothing',         65.50, 32.75,  60, 12, 'pcs', 'BATCH-branch-3-2',  date('now', '+365 days'), 'High quality modern device 2 for Uptown Branch',   'branch-3', 'user-5', datetime('now')),
('prod-branch-3-3',  'Quality Product 3',   'SKU-BRANCH-3-003', 'Food & Beverages', 75.25, 37.63,  65, 13, 'pcs', 'BATCH-branch-3-3',  date('now', '+365 days'), 'High quality quality product 3 for Uptown Branch', 'branch-3', 'user-5', datetime('now'));

-- ============================================================
-- Orders
-- ============================================================
INSERT INTO orders (id, order_number, customer_id, customer_name, subtotal, tax, total, status, branch_id, created_by, delivery_date, shipping_date, created_at) VALUES
('ORD-1704067200000', 'ORD-1704067200000', 'cust-1', 'ABC Corporation',      1292.50, 129.25, 1421.75, 'delivered',  'branch-1', 'user-5', datetime('now', '-8 days'), NULL,                    datetime('now', '-10 days')),
('ORD-1704153600000', 'ORD-1704153600000', 'cust-2', 'XYZ Trading Ltd',      2255.00, 225.50, 2480.50, 'shipped',    'branch-1', 'user-5', NULL,                  datetime('now', '-5 days'), datetime('now', '-7 days')),
('ORD-1704240000000', 'ORD-1704240000000', 'cust-3', 'Premium Retail Store', 2720.50, 272.05, 2992.55, 'processing', 'branch-1', 'user-5', NULL,                  NULL,                    datetime('now', '-5 days')),
('ORD-1704326400000', 'ORD-1704326400000', 'cust-1', 'ABC Corporation',      2887.50, 288.75, 3176.25, 'pending',    'branch-1', 'user-5', NULL,                  NULL,                    datetime('now', '-3 days')),
('ORD-1704412800000', 'ORD-1704412800000', 'cust-4', 'Global Enterprises Inc',4450.00,445.00, 4895.00, 'delivered',  'branch-2', 'user-5', datetime('now', '-10 days'), NULL,                   datetime('now', '-12 days'));

-- ============================================================
-- Order Items
-- ============================================================
INSERT INTO order_items (order_id, product_id, name, quantity, price) VALUES
('ORD-1704067200000','prod-branch-1-1','Premium Widget 1',  10, 35.50),
('ORD-1704067200000','prod-branch-1-2','Standard Widget 2',  5, 45.25),
('ORD-1704067200000','prod-branch-1-3','Deluxe Widget 3',    8, 55.00),
('ORD-1704153600000','prod-branch-1-4','Basic Widget 4',    15, 65.75),
('ORD-1704153600000','prod-branch-1-5','Pro Widget 5',      12, 75.50),
('ORD-1704240000000','prod-branch-1-6','Classic Item 6',    20, 85.25),
('ORD-1704240000000','prod-branch-1-7','Modern Item 7',     10, 95.00),
('ORD-1704240000000','prod-branch-1-8','Vintage Item 8',     6, 105.75),
('ORD-1704326400000','prod-branch-1-9','Luxury Item 9',     25, 115.50),
('ORD-1704326400000','prod-branch-1-10','Economy Item 10',  18, 125.25),
('ORD-1704412800000','prod-branch-2-1','Premium Widget 1',  30, 45.75),
('ORD-1704412800000','prod-branch-2-2','Standard Widget 2', 20, 55.50);

-- ============================================================
-- Invoices
-- ============================================================
INSERT INTO invoices (id, invoice_number, order_id, order_number, customer_id, customer_name, customer_address, subtotal, tax, total, status, payment_method, branch_id, due_date, paid_date, created_by, created_at) VALUES
('INV-1704067200000','INV-001','ORD-1704067200000','ORD-1704067200000','cust-1','ABC Corporation',      '123 Main St, City, State 12345',       1292.50,129.25,1421.75,'paid',   'Bank Transfer','branch-1', datetime('now', '-2 days'), datetime('now', '-7 days'),'user-6', datetime('now', '-9 days')),
('INV-1704153600000','INV-002','ORD-1704153600000','ORD-1704153600000','cust-2','XYZ Trading Ltd',      '456 Business Ave, City, State 12346',  2255.00,225.50,2480.50,'pending',NULL,           'branch-1', datetime('now', '+7 days'), NULL,                 'user-6', datetime('now', '-6 days')),
('INV-1704412800000','INV-003','ORD-1704412800000','ORD-1704412800000','cust-4','Global Enterprises Inc','321 Corporate Plaza, City, State 12348',4450.00,445.00,4895.00,'paid', 'Credit Card',  'branch-2', datetime('now', '-4 days'), datetime('now', '-9 days'),'user-6', datetime('now', '-11 days'));

-- ============================================================
-- Invoice Items
-- ============================================================
INSERT INTO invoice_items (invoice_id, product_id, name, quantity, price) VALUES
('INV-1704067200000','prod-branch-1-1','Premium Widget 1',  10, 35.50),
('INV-1704067200000','prod-branch-1-2','Standard Widget 2',  5, 45.25),
('INV-1704067200000','prod-branch-1-3','Deluxe Widget 3',    8, 55.00),
('INV-1704153600000','prod-branch-1-4','Basic Widget 4',    15, 65.75),
('INV-1704153600000','prod-branch-1-5','Pro Widget 5',      12, 75.50),
('INV-1704412800000','prod-branch-2-1','Premium Widget 1',  30, 45.75),
('INV-1704412800000','prod-branch-2-2','Standard Widget 2', 20, 55.50);

-- ============================================================
-- Sales
-- ============================================================
INSERT INTO sales (id, sales_id, customer_id, customer_name, total, branch_id, salesman_name, created_by, created_at) VALUES
('SALE-1704067200000','SALES-001','cust-1','ABC Corporation',     550.00, 'branch-1','Salesman','user-7', datetime('now', '-10 days')),
('SALE-1704153600000','SALES-001','cust-2','XYZ Trading Ltd',    1320.00, 'branch-1','Salesman','user-7', datetime('now', '-7 days'));

-- ============================================================
-- Sale Items
-- ============================================================
INSERT INTO sale_items (sale_id, product_id, name, quantity, price) VALUES
('SALE-1704067200000','prod-branch-1-1','Premium Widget 1', 10, 35.50),
('SALE-1704153600000','prod-branch-1-4','Basic Widget 4',   15, 65.75);

-- ============================================================
-- Accounting Entries
-- ============================================================
INSERT INTO accounting_entries (id, type, category, amount, description, reference, entry_date, branch_id, created_by, created_at) VALUES
('ACC-1704067200000','credit','Sales Revenue',       1421.75,'Invoice INV-001 - Order ORD-1704067200000','INV-001', datetime('now', '-7 days'),'branch-1','user-8', datetime('now', '-7 days')),
('ACC-1704067200001','debit', 'Accounts Receivable', 1421.75,'Payment received for Invoice INV-001',     'INV-001', datetime('now', '-7 days'),'branch-1','user-8', datetime('now', '-7 days')),
('ACC-1704153600000','credit','Sales Revenue',       2480.50,'Invoice INV-002 - Order ORD-1704153600000','INV-002', datetime('now', '-6 days'),'branch-1','user-8', datetime('now', '-6 days')),
('ACC-1704153600001','debit', 'Accounts Receivable', 2480.50,'Invoice INV-002 - Pending payment',        'INV-002', datetime('now', '-6 days'),'branch-1','user-8', datetime('now', '-6 days')),
('ACC-1704412800000','credit','Sales Revenue',       4895.00,'Invoice INV-003 - Order ORD-1704412800000','INV-003', datetime('now', '-9 days'),'branch-2','user-8', datetime('now', '-9 days')),
('ACC-1704412800001','debit', 'Accounts Receivable', 4895.00,'Payment received for Invoice INV-003',     'INV-003', datetime('now', '-9 days'),'branch-2','user-8', datetime('now', '-9 days')),
('ACC-1704500000000','debit', 'Operating Expenses',  5000.00,'Office Supplies and Utilities',            'EXP-001', datetime('now', '-14 days'),'branch-1','user-8', datetime('now', '-14 days')),
('ACC-1704500000001','credit','Cash',                5000.00,'Office Supplies and Utilities Payment',    'EXP-001', datetime('now', '-14 days'),'branch-1','user-8', datetime('now', '-14 days'));
