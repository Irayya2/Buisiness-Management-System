// Role-Based Access Control System

// Role hierarchy and permissions
export const ROLES = {
  DIRECTOR: 'director',
  ASSISTANT: 'assistant',
  CLUSTER_HEAD: 'cluster_head',
  CLUSTER_MANAGER: 'cluster_manager',
  BRANCH_MANAGER: 'branch_manager',
  BILLING_STAFF: 'billing_staff',
  SALESMAN: 'salesman',
  ACCOUNTANT: 'accountant'
};

// Permission definitions
export const PERMISSIONS = {
  // Dashboard & Reports
  VIEW_DASHBOARD: 'view_dashboard',
  VIEW_REPORTS: 'view_reports',
  VIEW_ANALYTICS: 'view_analytics',
  
  // Products & Inventory
  VIEW_PRODUCTS: 'view_products',
  CREATE_PRODUCTS: 'create_products',
  EDIT_PRODUCTS: 'edit_products',
  DELETE_PRODUCTS: 'delete_products',
  
  // Orders & Sales
  VIEW_ORDERS: 'view_orders',
  CREATE_ORDERS: 'create_orders',
  EDIT_ORDERS: 'edit_orders',
  DELETE_ORDERS: 'delete_orders',
  VIEW_SALES: 'view_sales',
  CREATE_SALES: 'create_sales',
  
  // Customers
  VIEW_CUSTOMERS: 'view_customers',
  CREATE_CUSTOMERS: 'create_customers',
  EDIT_CUSTOMERS: 'edit_customers',
  DELETE_CUSTOMERS: 'delete_customers',
  
  // Suppliers
  VIEW_SUPPLIERS: 'view_suppliers',
  CREATE_SUPPLIERS: 'create_suppliers',
  EDIT_SUPPLIERS: 'edit_suppliers',
  DELETE_SUPPLIERS: 'delete_suppliers',
  
  // Billing
  VIEW_BILLING: 'view_billing',
  CREATE_INVOICES: 'create_invoices',
  EDIT_INVOICES: 'edit_invoices',
  DELETE_INVOICES: 'delete_invoices',
  
  // Accounting
  VIEW_ACCOUNTS: 'view_accounts',
  CREATE_ACCOUNTS: 'create_accounts',
  EDIT_ACCOUNTS: 'edit_accounts',
  DELETE_ACCOUNTS: 'delete_accounts',
  
  // User Management
  VIEW_USERS: 'view_users',
  CREATE_USERS: 'create_users',
  EDIT_USERS: 'edit_users',
  DELETE_USERS: 'delete_users',
  MANAGE_ROLES: 'manage_roles',
  
  // Branch Management
  VIEW_BRANCHES: 'view_branches',
  CREATE_BRANCHES: 'create_branches',
  EDIT_BRANCHES: 'edit_branches',
  DELETE_BRANCHES: 'delete_branches',
  
  // Cluster Management
  VIEW_CLUSTERS: 'view_clusters',
  CREATE_CLUSTERS: 'create_clusters',
  EDIT_CLUSTERS: 'edit_clusters',
  DELETE_CLUSTERS: 'delete_clusters',

  // Settings & System
  VIEW_SETTINGS: 'view_settings',
  VIEW_AUDIT_LOGS: 'view_audit_logs',
  CONFIG_TAX_RATES: 'config_tax_rates',
  CONFIG_PAYMENT_MODES: 'config_payment_modes',
  CONFIG_INVOICE_FORMAT: 'config_invoice_format',
  MONITOR_LOGIN_ACTIVITY: 'monitor_login_activity',
  CONFIG_IP_RESTRICTIONS: 'config_ip_restrictions',

  // 1. Approval & Billing Access
  APPROVE_DISCOUNTS: 'approve_discounts',
  APPROVE_REFUNDS: 'approve_refunds',
  APPROVE_ORDER_CANCEL: 'approve_order_cancel',
  APPROVE_PRICE_OVERRIDE: 'approve_price_override',
  APPROVE_CREDIT_SALES: 'approve_credit_sales',
  ACCEPT_SPLIT_PAYMENTS: 'accept_split_payments',
  ACCEPT_PARTIAL_PAYMENTS: 'accept_partial_payments',
  CREATE_PROFORMA_INVOICES: 'create_proforma_invoices',
  REPRINT_INVOICES: 'reprint_invoices',
  APPLY_COUPONS: 'apply_coupons',
  PROCESS_BULK_ORDERS: 'process_bulk_orders',
  
  // 2. Data Visibility & Analytics
  VIEW_PROFIT_MARGINS: 'view_profit_margins',
  VIEW_COST_PRICE: 'view_cost_price',
  VIEW_SENSITIVE_CUSTOMER_DATA: 'view_sensitive_customer_data',
  VIEW_SALES_TRENDS: 'view_sales_trends',
  VIEW_PRODUCT_PERFORMANCE: 'view_product_performance',
  VIEW_EMPLOYEE_PERFORMANCE: 'view_employee_performance',
  VIEW_PROFIT_VS_REVENUE: 'view_profit_vs_revenue',
  
  // 3. Inventory & Suppliers
  TRANSFER_STOCK: 'transfer_stock',
  RESERVE_STOCK: 'reserve_stock',
  VIEW_LOW_STOCK_ALERTS: 'view_low_stock_alerts',
  TRACK_DEAD_STOCK: 'track_dead_stock',
  TRACK_BATCH_EXPIRY: 'track_batch_expiry',
  APPROVE_PURCHASING: 'approve_purchasing',
  VIEW_SUPPLIER_PERFORMANCE: 'view_supplier_performance',
  MANAGE_RATE_CONTRACTS: 'manage_rate_contracts',

  // 4. Customer Management
  MANAGE_LOYALTY_POINTS: 'manage_loyalty_points',
  SET_CUSTOMER_CREDIT_LIMIT: 'set_customer_credit_limit',
  VIEW_CUSTOMER_SEGMENTATION: 'view_customer_segmentation',
  MANAGE_BLACKLISTS: 'manage_blacklists',
  
  // 5. Smart Features (AI)
  VIEW_SALES_PREDICTIONS: 'view_sales_predictions',
  RECEIVE_FRAUD_ALERTS: 'receive_fraud_alerts',
  VIEW_SMART_RECOMMENDATIONS: 'view_smart_recommendations',
  VIEW_AUTO_REORDER_SUGGEST: 'view_auto_reorder_suggest',

  // 6. High-Risk / Exceptions / Time-rules
  ALLOW_BACKDATED_ENTRIES: 'allow_backdated_entries',
  UNLOCK_ACCOUNTING: 'unlock_accounting',
  EDIT_FINALIZED_INVOICES: 'edit_finalized_invoices',
  REOPEN_CLOSED_ORDERS: 'reopen_closed_orders',
  ADJUST_STOCK_MANUALLY: 'adjust_stock_manually',
  OVERRIDE_STOCK_MISMATCH: 'override_stock_mismatch'
};

// ─── Role → Permissions mapping ──────────────────────────────────────────────
// Designed so each role sees only what it needs for day-to-day work.
export const ROLE_PERMISSIONS = {
  // ───────────────────── SUPER ADMINS ─────────────────────
  [ROLES.DIRECTOR]: [
    // Full unrestricted access — owns the organization
    ...Object.values(PERMISSIONS)
  ],
  
  [ROLES.ASSISTANT]: [
    // Director's delegate — full access including role management
    ...Object.values(PERMISSIONS)
  ],
  
  // ───────────────────── OVERSIGHT ROLES ─────────────────────
  [ROLES.CLUSTER_HEAD]: [
    // Read-only oversight across multiple clusters + user visibility
    PERMISSIONS.VIEW_DASHBOARD,
    PERMISSIONS.VIEW_REPORTS,
    PERMISSIONS.VIEW_ANALYTICS,
    PERMISSIONS.VIEW_SETTINGS,
    // Operations (read-only)
    PERMISSIONS.VIEW_PRODUCTS,
    PERMISSIONS.VIEW_ORDERS,
    PERMISSIONS.VIEW_SALES,
    PERMISSIONS.VIEW_CUSTOMERS,
    PERMISSIONS.VIEW_SUPPLIERS,
    // Finance (read-only)
    PERMISSIONS.VIEW_BILLING,
    PERMISSIONS.VIEW_ACCOUNTS,
    PERMISSIONS.VIEW_PROFIT_MARGINS,
    PERMISSIONS.VIEW_COST_PRICE,
    PERMISSIONS.VIEW_SALES_TRENDS,
    PERMISSIONS.VIEW_PRODUCT_PERFORMANCE,
    PERMISSIONS.VIEW_EMPLOYEE_PERFORMANCE,
    PERMISSIONS.VIEW_PROFIT_VS_REVENUE,
    PERMISSIONS.VIEW_LOW_STOCK_ALERTS,
    PERMISSIONS.VIEW_SUPPLIER_PERFORMANCE,
    PERMISSIONS.VIEW_CUSTOMER_SEGMENTATION,
    PERMISSIONS.VIEW_SALES_PREDICTIONS,
    PERMISSIONS.RECEIVE_FRAUD_ALERTS,
    // Management (read-only)
    PERMISSIONS.VIEW_USERS,
    PERMISSIONS.VIEW_BRANCHES,
    PERMISSIONS.VIEW_CLUSTERS
  ],
  
  [ROLES.CLUSTER_MANAGER]: [
    // Manages a cluster of branches — can view users for team oversight
    PERMISSIONS.VIEW_DASHBOARD,
    PERMISSIONS.VIEW_REPORTS,
    PERMISSIONS.VIEW_ANALYTICS,
    PERMISSIONS.VIEW_SETTINGS,
    // Operations (read-only)
    PERMISSIONS.VIEW_PRODUCTS,
    PERMISSIONS.VIEW_ORDERS,
    PERMISSIONS.VIEW_SALES,
    PERMISSIONS.VIEW_CUSTOMERS,
    PERMISSIONS.VIEW_SUPPLIERS,
    // Finance (read-only)
    PERMISSIONS.VIEW_BILLING,
    PERMISSIONS.VIEW_ACCOUNTS,
    PERMISSIONS.VIEW_PROFIT_MARGINS,
    PERMISSIONS.VIEW_COST_PRICE,
    PERMISSIONS.VIEW_SALES_TRENDS,
    PERMISSIONS.VIEW_PRODUCT_PERFORMANCE,
    PERMISSIONS.VIEW_EMPLOYEE_PERFORMANCE,
    PERMISSIONS.VIEW_PROFIT_VS_REVENUE,
    PERMISSIONS.VIEW_LOW_STOCK_ALERTS,
    PERMISSIONS.VIEW_SUPPLIER_PERFORMANCE,
    PERMISSIONS.VIEW_CUSTOMER_SEGMENTATION,
    PERMISSIONS.VIEW_SALES_PREDICTIONS,
    PERMISSIONS.RECEIVE_FRAUD_ALERTS,
    // Management (read-only)
    PERMISSIONS.VIEW_USERS,
    PERMISSIONS.VIEW_BRANCHES
  ],
  
  // ───────────────────── OPERATIONAL ROLES ─────────────────────
  [ROLES.BRANCH_MANAGER]: [
    // Day-to-day branch operations — full CRUD on operational data
    PERMISSIONS.VIEW_DASHBOARD,
    PERMISSIONS.VIEW_REPORTS,
    PERMISSIONS.VIEW_ANALYTICS,
    PERMISSIONS.VIEW_SETTINGS,
    // Products (full CRUD)
    PERMISSIONS.VIEW_PRODUCTS,
    PERMISSIONS.CREATE_PRODUCTS,
    PERMISSIONS.EDIT_PRODUCTS,
    PERMISSIONS.DELETE_PRODUCTS,
    // Orders (full CRUD)
    PERMISSIONS.VIEW_ORDERS,
    PERMISSIONS.CREATE_ORDERS,
    PERMISSIONS.EDIT_ORDERS,
    PERMISSIONS.DELETE_ORDERS,
    // Sales
    PERMISSIONS.VIEW_SALES,
    PERMISSIONS.CREATE_SALES,
    // Customers (full CRUD)
    PERMISSIONS.VIEW_CUSTOMERS,
    PERMISSIONS.CREATE_CUSTOMERS,
    PERMISSIONS.EDIT_CUSTOMERS,
    PERMISSIONS.DELETE_CUSTOMERS,
    // Suppliers (full CRUD)
    PERMISSIONS.VIEW_SUPPLIERS,
    PERMISSIONS.CREATE_SUPPLIERS,
    PERMISSIONS.EDIT_SUPPLIERS,
    PERMISSIONS.DELETE_SUPPLIERS,
    // Billing (manage billing)
    PERMISSIONS.VIEW_BILLING,
    PERMISSIONS.CREATE_INVOICES,
    PERMISSIONS.EDIT_INVOICES,
    PERMISSIONS.DELETE_INVOICES,
    // Approvals & Exceptions
    PERMISSIONS.APPROVE_DISCOUNTS,
    PERMISSIONS.APPROVE_REFUNDS,
    PERMISSIONS.APPROVE_ORDER_CANCEL,
    PERMISSIONS.APPROVE_PRICE_OVERRIDE,
    PERMISSIONS.APPROVE_CREDIT_SALES,
    PERMISSIONS.VIEW_PROFIT_MARGINS,
    PERMISSIONS.VIEW_COST_PRICE,
    PERMISSIONS.REOPEN_CLOSED_ORDERS,
    PERMISSIONS.EDIT_FINALIZED_INVOICES,
    PERMISSIONS.ADJUST_STOCK_MANUALLY,
    PERMISSIONS.OVERRIDE_STOCK_MISMATCH,
    // Operations & Sales enhancements
    PERMISSIONS.ACCEPT_SPLIT_PAYMENTS,
    PERMISSIONS.ACCEPT_PARTIAL_PAYMENTS,
    PERMISSIONS.CREATE_PROFORMA_INVOICES,
    PERMISSIONS.REPRINT_INVOICES,
    PERMISSIONS.APPLY_COUPONS,
    PERMISSIONS.PROCESS_BULK_ORDERS,
    // Inventory
    PERMISSIONS.TRANSFER_STOCK,
    PERMISSIONS.RESERVE_STOCK,
    PERMISSIONS.VIEW_LOW_STOCK_ALERTS,
    PERMISSIONS.TRACK_DEAD_STOCK,
    PERMISSIONS.TRACK_BATCH_EXPIRY,
    // Supplier
    PERMISSIONS.APPROVE_PURCHASING,
    PERMISSIONS.VIEW_SUPPLIER_PERFORMANCE,
    // Customers
    PERMISSIONS.MANAGE_LOYALTY_POINTS,
    PERMISSIONS.VIEW_CUSTOMER_SEGMENTATION,
    PERMISSIONS.MANAGE_BLACKLISTS,
    // Analytics
    PERMISSIONS.VIEW_SALES_TRENDS,
    PERMISSIONS.VIEW_PRODUCT_PERFORMANCE,
    PERMISSIONS.VIEW_EMPLOYEE_PERFORMANCE,
    // AI Features
    PERMISSIONS.VIEW_SALES_PREDICTIONS,
    PERMISSIONS.VIEW_SMART_RECOMMENDATIONS,
    PERMISSIONS.VIEW_AUTO_REORDER_SUGGEST
  ],
  
  // ───────────────────── SPECIALIST ROLES ─────────────────────
  [ROLES.BILLING_STAFF]: [
    // Billing & invoicing specialist — handles invoices, views orders/customers
    PERMISSIONS.VIEW_DASHBOARD,
    // Billing (full CRUD)
    PERMISSIONS.VIEW_BILLING,
    PERMISSIONS.CREATE_INVOICES,
    PERMISSIONS.EDIT_INVOICES,
    PERMISSIONS.DELETE_INVOICES,
    // Orders (can view and create — needs to reference orders for invoicing)
    PERMISSIONS.VIEW_ORDERS,
    PERMISSIONS.CREATE_ORDERS,
    PERMISSIONS.EDIT_ORDERS,
    // Sales (view-only — for cross-referencing)
    PERMISSIONS.VIEW_SALES,
    // Customers (view + create/edit — billing needs customer contact info)
    PERMISSIONS.VIEW_CUSTOMERS,
    PERMISSIONS.CREATE_CUSTOMERS,
    PERMISSIONS.EDIT_CUSTOMERS,
    // Products (view-only — for invoice line items)
    PERMISSIONS.VIEW_PRODUCTS,
    // Operations & Sales enhancements
    PERMISSIONS.ACCEPT_SPLIT_PAYMENTS,
    PERMISSIONS.ACCEPT_PARTIAL_PAYMENTS,
    PERMISSIONS.CREATE_PROFORMA_INVOICES,
    PERMISSIONS.REPRINT_INVOICES,
    PERMISSIONS.APPLY_COUPONS,
    // Inventory & AI
    PERMISSIONS.VIEW_LOW_STOCK_ALERTS,
    PERMISSIONS.VIEW_SMART_RECOMMENDATIONS,
    // Customers
    PERMISSIONS.MANAGE_LOYALTY_POINTS,
    PERMISSIONS.VIEW_CUSTOMER_SEGMENTATION
  ],
  
  [ROLES.SALESMAN]: [
    // Sales-focused — creates sales & orders, manages customer relationships
    PERMISSIONS.VIEW_DASHBOARD,
    // Sales (full access)
    PERMISSIONS.VIEW_SALES,
    PERMISSIONS.CREATE_SALES,
    // Orders (create + edit — salesman takes orders)
    PERMISSIONS.VIEW_ORDERS,
    PERMISSIONS.CREATE_ORDERS,
    PERMISSIONS.EDIT_ORDERS,
    // Products (view-only — needs to see catalog)
    PERMISSIONS.VIEW_PRODUCTS,
    // Customers (view + create/edit — manages customer relationships)
    PERMISSIONS.VIEW_CUSTOMERS,
    PERMISSIONS.CREATE_CUSTOMERS,
    PERMISSIONS.EDIT_CUSTOMERS,
    // Operations & Sales enhancements
    PERMISSIONS.ACCEPT_SPLIT_PAYMENTS,
    PERMISSIONS.CREATE_PROFORMA_INVOICES,
    PERMISSIONS.APPLY_COUPONS,
    // Inventory & AI
    PERMISSIONS.RESERVE_STOCK,
    PERMISSIONS.VIEW_SMART_RECOMMENDATIONS
  ],
  
  [ROLES.ACCOUNTANT]: [
    // Finance specialist — manages accounting, views billing/sales for reconciliation
    PERMISSIONS.VIEW_DASHBOARD,
    PERMISSIONS.VIEW_REPORTS,
    PERMISSIONS.VIEW_ANALYTICS,
    // Accounting (full CRUD)
    PERMISSIONS.VIEW_ACCOUNTS,
    PERMISSIONS.CREATE_ACCOUNTS,
    PERMISSIONS.EDIT_ACCOUNTS,
    PERMISSIONS.DELETE_ACCOUNTS,
    // Billing (view-only — for reconciliation)
    PERMISSIONS.VIEW_BILLING,
    // Sales & Orders (view-only — for financial reconciliation)
    PERMISSIONS.VIEW_SALES,
    PERMISSIONS.VIEW_ORDERS,
    // Customers (view-only — for reference)
    PERMISSIONS.VIEW_CUSTOMERS,
    // Finance Risk & Approvals
    PERMISSIONS.VIEW_PROFIT_MARGINS,
    PERMISSIONS.VIEW_COST_PRICE,
    PERMISSIONS.VIEW_SENSITIVE_CUSTOMER_DATA,
    PERMISSIONS.ALLOW_BACKDATED_ENTRIES,
    PERMISSIONS.UNLOCK_ACCOUNTING,
    // Analytics & System
    PERMISSIONS.VIEW_PROFIT_VS_REVENUE,
    PERMISSIONS.VIEW_SALES_TRENDS,
    PERMISSIONS.REPRINT_INVOICES,
    PERMISSIONS.SET_CUSTOMER_CREDIT_LIMIT,
    // Security & AI
    PERMISSIONS.RECEIVE_FRAUD_ALERTS,
    PERMISSIONS.VIEW_AUDIT_LOGS
  ]
};

// ─── Financial & Operational Control Limits ──────────────────────────────────
export const ROLE_CONTROLS = {
  [ROLES.DIRECTOR]: {
    dataVisibility: 'GLOBAL', // GLOBAL, CLUSTER, BRANCH, SELF
    maxDiscountPercent: 100,
    maxRefundAmount: Infinity,
    maxCreditSaleLimit: Infinity,
    maxInvoiceAmount: Infinity,
    orderEditWindowHours: Infinity,
    orderCancelWindowHours: Infinity,
    invoiceEditWindowHours: Infinity,
  },
  [ROLES.ASSISTANT]: {
    dataVisibility: 'GLOBAL',
    maxDiscountPercent: 100,
    maxRefundAmount: Infinity,
    maxCreditSaleLimit: Infinity,
    maxInvoiceAmount: Infinity,
    orderEditWindowHours: Infinity,
    orderCancelWindowHours: Infinity,
    invoiceEditWindowHours: Infinity,
  },
  [ROLES.CLUSTER_HEAD]: {
    dataVisibility: 'CLUSTER',
    maxDiscountPercent: 0,
    maxRefundAmount: 0,
    maxCreditSaleLimit: 0,
    maxInvoiceAmount: 0,
    orderEditWindowHours: 0,
    orderCancelWindowHours: 0,
    invoiceEditWindowHours: 0,
  },
  [ROLES.CLUSTER_MANAGER]: {
    dataVisibility: 'CLUSTER',
    maxDiscountPercent: 0,
    maxRefundAmount: 0,
    maxCreditSaleLimit: 0,
    maxInvoiceAmount: 0,
    orderEditWindowHours: 0,
    orderCancelWindowHours: 0,
    invoiceEditWindowHours: 0,
  },
  [ROLES.BRANCH_MANAGER]: {
    dataVisibility: 'BRANCH',
    maxDiscountPercent: 30,
    maxRefundAmount: 10000,
    maxCreditSaleLimit: 50000,
    maxInvoiceAmount: 500000,
    orderEditWindowHours: 48,
    orderCancelWindowHours: 72,
    invoiceEditWindowHours: 48,
  },
  [ROLES.BILLING_STAFF]: {
    dataVisibility: 'BRANCH',
    maxDiscountPercent: 5,
    maxRefundAmount: 0,
    maxCreditSaleLimit: 0,
    maxInvoiceAmount: 50000,
    orderEditWindowHours: 12,
    orderCancelWindowHours: 12,
    invoiceEditWindowHours: 4,
  },
  [ROLES.SALESMAN]: {
    dataVisibility: 'SELF',
    maxDiscountPercent: 10,
    maxRefundAmount: 0,
    maxCreditSaleLimit: 1000,
    maxInvoiceAmount: 0,
    orderEditWindowHours: 4,
    orderCancelWindowHours: 2,
    invoiceEditWindowHours: 0,
  },
  [ROLES.ACCOUNTANT]: {
    dataVisibility: 'BRANCH',
    maxDiscountPercent: 0,
    maxRefundAmount: Infinity, // Accountants process the actual refunds financially
    maxCreditSaleLimit: Infinity,
    maxInvoiceAmount: Infinity,
    orderEditWindowHours: Infinity,
    orderCancelWindowHours: Infinity,
    invoiceEditWindowHours: Infinity,
  }
};

// Check if user has permission
export const hasPermission = (user, permission) => {
  if (!user || !user.role) return false;
  
  // Director and Assistant have all permissions
  if (user.role === ROLES.DIRECTOR || user.role === ROLES.ASSISTANT) return true;
  
  const rolePermissions = ROLE_PERMISSIONS[user.role] || [];
  return rolePermissions.includes(permission);
};

// Check if user has any of the permissions
export const hasAnyPermission = (user, permissions) => {
  return permissions.some(permission => hasPermission(user, permission));
};

// Check if user has all permissions
export const hasAllPermissions = (user, permissions) => {
  return permissions.every(permission => hasPermission(user, permission));
};

// ─── Control Limit Enforcement Helpers ───────────────────────────────────────
export const getRoleControls = (user) => {
  if (!user || !user.role) return null;
  return ROLE_CONTROLS[user.role] || null;
};

// Data Visibility
export const getDataVisibility = (user) => {
  const controls = getRoleControls(user);
  return controls ? controls.dataVisibility : 'SELF';
};

// Operational Limits
export const canApplyDiscount = (user, requestedPercent) => {
  const controls = getRoleControls(user);
  if (!controls) return false;
  return requestedPercent <= controls.maxDiscountPercent;
};

export const canApproveRefund = (user, refundAmount) => {
  const controls = getRoleControls(user);
  if (!controls) return false;
  return refundAmount <= controls.maxRefundAmount || hasPermission(user, PERMISSIONS.APPROVE_REFUNDS);
};

export const canApproveCreditSale = (user, creditAmount) => {
  const controls = getRoleControls(user);
  if (!controls) return false;
  return creditAmount <= controls.maxCreditSaleLimit || hasPermission(user, PERMISSIONS.APPROVE_CREDIT_SALES);
};

// Time-based restrictions
export const canEditOrder = (user, orderCreatedAtDate) => {
  const controls = getRoleControls(user);
  if (!controls) return false;
  if (controls.orderEditWindowHours === Infinity) return true;
  
  const hoursSinceCreation = (new Date() - new Date(orderCreatedAtDate)) / (1000 * 60 * 60);
  return hoursSinceCreation <= controls.orderEditWindowHours;
};

export const canCancelOrder = (user, orderCreatedAtDate) => {
  const controls = getRoleControls(user);
  if (!controls) return false;
  if (controls.orderCancelWindowHours === Infinity) return true;
  
  const hoursSinceCreation = (new Date() - new Date(orderCreatedAtDate)) / (1000 * 60 * 60);
  return hoursSinceCreation <= controls.orderCancelWindowHours;
};

export const canModifyInvoice = (user, invoiceCreatedAtDate) => {
  const controls = getRoleControls(user);
  if (!controls) return false;
  if (controls.invoiceEditWindowHours === Infinity) return true;
  
  const hoursSinceCreation = (new Date() - new Date(invoiceCreatedAtDate)) / (1000 * 60 * 60);
  return hoursSinceCreation <= controls.invoiceEditWindowHours;
};

export const canEnterBackdatedData = (user) => {
  return hasPermission(user, PERMISSIONS.ALLOW_BACKDATED_ENTRIES);
};

// Check if user can access branch data
export const canAccessBranch = (user, branchId) => {
  if (!user || !branchId) return false;
  
  // Director and Assistant can access all branches
  if (user.role === ROLES.DIRECTOR || user.role === ROLES.ASSISTANT) {
    return true;
  }
  
  // Branch Manager can only access their own branch
  if (user.role === ROLES.BRANCH_MANAGER) {
    return user.branchId === branchId;
  }
  
  // Billing Staff, Salesman, Accountant can only access their branch
  if ([ROLES.BILLING_STAFF, ROLES.SALESMAN, ROLES.ACCOUNTANT].includes(user.role)) {
    return user.branchId === branchId;
  }
  
  // Cluster Head can access branches in their cluster head region
  if (user.role === ROLES.CLUSTER_HEAD) {
    // This would need cluster head region mapping
    return user.accessibleBranchIds?.includes(branchId) || false;
  }
  
  // Cluster Manager can access branches in their cluster
  if (user.role === ROLES.CLUSTER_MANAGER) {
    return user.accessibleBranchIds?.includes(branchId) || false;
  }
  
  return false;
};

// Get accessible branches for user
export const getAccessibleBranches = (user, allBranches) => {
  if (!user || !allBranches) return [];
  
  // Director and Assistant can access all branches
  if (user.role === ROLES.DIRECTOR || user.role === ROLES.ASSISTANT) {
    return allBranches;
  }
  
  // Branch Manager, Billing Staff, Salesman, Accountant can only access their branch
  if ([ROLES.BRANCH_MANAGER, ROLES.BILLING_STAFF, ROLES.SALESMAN, ROLES.ACCOUNTANT].includes(user.role)) {
    return allBranches.filter(branch => branch.id === user.branchId);
  }
  
  // Cluster Head and Cluster Manager can access their assigned branches
  if ([ROLES.CLUSTER_HEAD, ROLES.CLUSTER_MANAGER].includes(user.role)) {
    return allBranches.filter(branch => 
      user.accessibleBranchIds?.includes(branch.id)
    );
  }
  
  return [];
};

// Check if role is read-only
export const isReadOnlyRole = (role) => {
  return role === ROLES.DIRECTOR;
};

// Get role display name
export const getRoleDisplayName = (role) => {
  const roleNames = {
    [ROLES.DIRECTOR]: 'Director',
    [ROLES.ASSISTANT]: 'Assistant',
    [ROLES.CLUSTER_HEAD]: 'Cluster Head',
    [ROLES.CLUSTER_MANAGER]: 'Cluster Manager',
    [ROLES.BRANCH_MANAGER]: 'Branch Manager',
    [ROLES.BILLING_STAFF]: 'Billing Staff',
    [ROLES.SALESMAN]: 'Salesman',
    [ROLES.ACCOUNTANT]: 'Accountant'
  };
  return roleNames[role] || role;
};

