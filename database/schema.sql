-- ============================================================
-- Sales & Inventory Management System - MySQL Schema
-- ============================================================




-- ============================================================
-- Clusters
-- ============================================================
CREATE TABLE IF NOT EXISTS clusters (
    id          VARCHAR(50)  PRIMARY KEY,
    name        VARCHAR(100) NOT NULL,
    created_at  DATETIME     DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- Branches
-- ============================================================
CREATE TABLE IF NOT EXISTS branches (
    id          VARCHAR(50)  PRIMARY KEY,
    name        VARCHAR(100) NOT NULL,
    address     VARCHAR(255),
    cluster_id  VARCHAR(50),
    created_at  DATETIME     DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (cluster_id) REFERENCES clusters(id) ON DELETE SET NULL
);

-- ============================================================
-- Users (with RBAC roles)
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
    id                      VARCHAR(50)  PRIMARY KEY,
    username                VARCHAR(50)  NOT NULL UNIQUE,
    email                   VARCHAR(100) NOT NULL UNIQUE,
    password_hash           VARCHAR(255) NOT NULL,
    role                    TEXT NOT NULL,
    name                    VARCHAR(100) NOT NULL,
    branch_id               VARCHAR(50)  DEFAULT NULL,
    cluster_id              VARCHAR(50)  DEFAULT NULL,
    sales_id                VARCHAR(20)  DEFAULT NULL,
    created_at              DATETIME     DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (branch_id)  REFERENCES branches(id) ON DELETE SET NULL,
    FOREIGN KEY (cluster_id) REFERENCES clusters(id) ON DELETE SET NULL
);

-- User accessible branches (for cluster head / cluster manager)
CREATE TABLE IF NOT EXISTS user_accessible_branches (
    user_id     VARCHAR(50) NOT NULL,
    branch_id   VARCHAR(50) NOT NULL,
    PRIMARY KEY (user_id, branch_id),
    FOREIGN KEY (user_id)   REFERENCES users(id)    ON DELETE CASCADE,
    FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE CASCADE
);

-- ============================================================
-- Customers
-- ============================================================
CREATE TABLE IF NOT EXISTS customers (
    id           VARCHAR(50)  PRIMARY KEY,
    name         VARCHAR(150) NOT NULL,
    email        VARCHAR(100),
    phone        VARCHAR(30),
    address      TEXT,
    type         TEXT DEFAULT 'retail',
    credit_limit DECIMAL(15,2) DEFAULT 0,
    branch_id    VARCHAR(50),
    created_at   DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at   DATETIME DEFAULT NULL ,
    FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL
);

-- ============================================================
-- Suppliers
-- ============================================================
CREATE TABLE IF NOT EXISTS suppliers (
    id             VARCHAR(50)  PRIMARY KEY,
    name           VARCHAR(150) NOT NULL,
    email          VARCHAR(100),
    phone          VARCHAR(30),
    address        TEXT,
    contact_person VARCHAR(100),
    branch_id      VARCHAR(50),
    created_at     DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at     DATETIME DEFAULT NULL ,
    FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL
);

-- ============================================================
-- Products
-- ============================================================
CREATE TABLE IF NOT EXISTS products (
    id          VARCHAR(50)   PRIMARY KEY,
    name        VARCHAR(200)  NOT NULL,
    sku         VARCHAR(100)  NOT NULL UNIQUE,
    category    VARCHAR(100),
    price       DECIMAL(15,2) NOT NULL DEFAULT 0,
    cost        DECIMAL(15,2) NOT NULL DEFAULT 0,
    stock       INT           NOT NULL DEFAULT 0,
    min_stock   INT           NOT NULL DEFAULT 0,
    unit        VARCHAR(20)   DEFAULT 'pcs',
    batch       VARCHAR(100),
    expiry_date DATE          DEFAULT NULL,
    description TEXT,
    branch_id   VARCHAR(50),
    created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at  DATETIME DEFAULT NULL ,
    created_by  VARCHAR(50),
    FOREIGN KEY (branch_id)  REFERENCES branches(id) ON DELETE SET NULL,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

-- ============================================================
-- Orders
-- ============================================================
CREATE TABLE IF NOT EXISTS orders (
    id            VARCHAR(50)   PRIMARY KEY,
    order_number  VARCHAR(50)   NOT NULL UNIQUE,
    customer_id   VARCHAR(50),
    customer_name VARCHAR(150),
    subtotal      DECIMAL(15,2) DEFAULT 0,
    tax           DECIMAL(15,2) DEFAULT 0,
    total         DECIMAL(15,2) DEFAULT 0,
    status        TEXT DEFAULT 'pending',
    branch_id     VARCHAR(50),
    created_by    VARCHAR(50),
    delivery_date DATETIME DEFAULT NULL,
    shipping_date DATETIME DEFAULT NULL,
    created_at    DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at    DATETIME DEFAULT NULL ,
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL,
    FOREIGN KEY (branch_id)   REFERENCES branches(id)  ON DELETE SET NULL,
    FOREIGN KEY (created_by)  REFERENCES users(id)     ON DELETE SET NULL
);

-- Order Items (line items)
CREATE TABLE IF NOT EXISTS order_items (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id    VARCHAR(50)   NOT NULL,
    product_id  VARCHAR(50),
    name        VARCHAR(200),
    quantity    INT           NOT NULL DEFAULT 1,
    price       DECIMAL(15,2) NOT NULL DEFAULT 0,
    FOREIGN KEY (order_id)   REFERENCES orders(id)   ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL
);

-- ============================================================
-- Invoices
-- ============================================================
CREATE TABLE IF NOT EXISTS invoices (
    id               VARCHAR(50)   PRIMARY KEY,
    invoice_number   VARCHAR(50)   NOT NULL UNIQUE,
    order_id         VARCHAR(50),
    order_number     VARCHAR(50),
    customer_id      VARCHAR(50),
    customer_name    VARCHAR(150),
    customer_address TEXT,
    subtotal         DECIMAL(15,2) DEFAULT 0,
    tax              DECIMAL(15,2) DEFAULT 0,
    total            DECIMAL(15,2) DEFAULT 0,
    status           TEXT DEFAULT 'pending',
    payment_method   VARCHAR(50)   DEFAULT NULL,
    branch_id        VARCHAR(50),
    due_date         DATETIME DEFAULT NULL,
    paid_date        DATETIME DEFAULT NULL,
    created_by       VARCHAR(50),
    created_at       DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at       DATETIME DEFAULT NULL ,
    FOREIGN KEY (order_id)    REFERENCES orders(id)    ON DELETE SET NULL,
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL,
    FOREIGN KEY (branch_id)   REFERENCES branches(id)  ON DELETE SET NULL,
    FOREIGN KEY (created_by)  REFERENCES users(id)     ON DELETE SET NULL
);

-- Invoice Items
CREATE TABLE IF NOT EXISTS invoice_items (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    invoice_id  VARCHAR(50)   NOT NULL,
    product_id  VARCHAR(50),
    name        VARCHAR(200),
    quantity    INT           NOT NULL DEFAULT 1,
    price       DECIMAL(15,2) NOT NULL DEFAULT 0,
    FOREIGN KEY (invoice_id) REFERENCES invoices(id)  ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id)  ON DELETE SET NULL
);

-- ============================================================
-- Sales
-- ============================================================
CREATE TABLE IF NOT EXISTS sales (
    id           VARCHAR(50)   PRIMARY KEY,
    sales_id     VARCHAR(30),
    customer_id  VARCHAR(50),
    customer_name VARCHAR(150),
    total        DECIMAL(15,2) DEFAULT 0,
    branch_id    VARCHAR(50),
    salesman_name VARCHAR(100),
    created_by   VARCHAR(50),
    created_at   DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL,
    FOREIGN KEY (branch_id)   REFERENCES branches(id)  ON DELETE SET NULL,
    FOREIGN KEY (created_by)  REFERENCES users(id)     ON DELETE SET NULL
);

-- Sale Items
CREATE TABLE IF NOT EXISTS sale_items (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    sale_id     VARCHAR(50)   NOT NULL,
    product_id  VARCHAR(50),
    name        VARCHAR(200),
    quantity    INT           NOT NULL DEFAULT 1,
    price       DECIMAL(15,2) NOT NULL DEFAULT 0,
    FOREIGN KEY (sale_id)    REFERENCES sales(id)    ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL
);

-- ============================================================
-- Accounting Entries
-- ============================================================
CREATE TABLE IF NOT EXISTS accounting_entries (
    id          VARCHAR(50)   PRIMARY KEY,
    type        TEXT NOT NULL,
    category    VARCHAR(100)  NOT NULL,
    amount      DECIMAL(15,2) NOT NULL DEFAULT 0,
    description TEXT,
    reference   VARCHAR(100),
    entry_date  DATETIME,
    branch_id   VARCHAR(50),
    created_by  VARCHAR(50),
    created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at  DATETIME DEFAULT NULL ,
    FOREIGN KEY (branch_id)  REFERENCES branches(id) ON DELETE SET NULL,
    FOREIGN KEY (created_by) REFERENCES users(id)    ON DELETE SET NULL
);
