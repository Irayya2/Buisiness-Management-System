# Role-Based Access Control - Python port of frontend rbac.js

# ─── Roles ────────────────────────────────────────────────────────────────────
class ROLES:
    DIRECTOR         = 'director'
    ASSISTANT        = 'assistant'
    CLUSTER_HEAD     = 'cluster_head'
    CLUSTER_MANAGER  = 'cluster_manager'
    BRANCH_MANAGER   = 'branch_manager'
    BILLING_STAFF    = 'billing_staff'
    SALESMAN         = 'salesman'
    ACCOUNTANT       = 'accountant'


# ─── Permissions ──────────────────────────────────────────────────────────────
class PERMISSIONS:
    VIEW_DASHBOARD                 = 'view_dashboard'
    VIEW_REPORTS                   = 'view_reports'
    VIEW_ANALYTICS                 = 'view_analytics'
    
    VIEW_PRODUCTS                  = 'view_products'
    CREATE_PRODUCTS                = 'create_products'
    EDIT_PRODUCTS                  = 'edit_products'
    DELETE_PRODUCTS                = 'delete_products'
    
    VIEW_ORDERS                    = 'view_orders'
    CREATE_ORDERS                  = 'create_orders'
    EDIT_ORDERS                    = 'edit_orders'
    DELETE_ORDERS                  = 'delete_orders'
    VIEW_SALES                     = 'view_sales'
    CREATE_SALES                   = 'create_sales'
    
    VIEW_CUSTOMERS                 = 'view_customers'
    CREATE_CUSTOMERS               = 'create_customers'
    EDIT_CUSTOMERS                 = 'edit_customers'
    DELETE_CUSTOMERS               = 'delete_customers'
    
    VIEW_SUPPLIERS                 = 'view_suppliers'
    CREATE_SUPPLIERS               = 'create_suppliers'
    EDIT_SUPPLIERS                 = 'edit_suppliers'
    DELETE_SUPPLIERS               = 'delete_suppliers'
    
    VIEW_BILLING                   = 'view_billing'
    CREATE_INVOICES                = 'create_invoices'
    EDIT_INVOICES                  = 'edit_invoices'
    DELETE_INVOICES                = 'delete_invoices'
    
    VIEW_ACCOUNTS                  = 'view_accounts'
    CREATE_ACCOUNTS                = 'create_accounts'
    EDIT_ACCOUNTS                  = 'edit_accounts'
    DELETE_ACCOUNTS                = 'delete_accounts'
    
    VIEW_USERS                     = 'view_users'
    CREATE_USERS                   = 'create_users'
    EDIT_USERS                     = 'edit_users'
    DELETE_USERS                   = 'delete_users'
    MANAGE_ROLES                   = 'manage_roles'
    
    VIEW_BRANCHES                  = 'view_branches'
    CREATE_BRANCHES                = 'create_branches'
    EDIT_BRANCHES                  = 'edit_branches'
    DELETE_BRANCHES                = 'delete_branches'
    
    VIEW_CLUSTERS                  = 'view_clusters'
    CREATE_CLUSTERS                = 'create_clusters'
    EDIT_CLUSTERS                  = 'edit_clusters'
    DELETE_CLUSTERS                = 'delete_clusters'

    VIEW_SETTINGS                  = 'view_settings'
    VIEW_AUDIT_LOGS                = 'view_audit_logs'
    CONFIG_TAX_RATES               = 'config_tax_rates'
    CONFIG_PAYMENT_MODES           = 'config_payment_modes'
    CONFIG_INVOICE_FORMAT          = 'config_invoice_format'
    MONITOR_LOGIN_ACTIVITY         = 'monitor_login_activity'
    CONFIG_IP_RESTRICTIONS         = 'config_ip_restrictions'

    APPROVE_DISCOUNTS              = 'approve_discounts'
    APPROVE_REFUNDS                = 'approve_refunds'
    APPROVE_ORDER_CANCEL           = 'approve_order_cancel'
    APPROVE_PRICE_OVERRIDE         = 'approve_price_override'
    APPROVE_CREDIT_SALES           = 'approve_credit_sales'
    ACCEPT_SPLIT_PAYMENTS          = 'accept_split_payments'
    ACCEPT_PARTIAL_PAYMENTS        = 'accept_partial_payments'
    CREATE_PROFORMA_INVOICES       = 'create_proforma_invoices'
    REPRINT_INVOICES               = 'reprint_invoices'
    APPLY_COUPONS                  = 'apply_coupons'
    PROCESS_BULK_ORDERS            = 'process_bulk_orders'
    
    VIEW_PROFIT_MARGINS            = 'view_profit_margins'
    VIEW_COST_PRICE                = 'view_cost_price'
    VIEW_SENSITIVE_CUSTOMER_DATA   = 'view_sensitive_customer_data'
    VIEW_SALES_TRENDS              = 'view_sales_trends'
    VIEW_PRODUCT_PERFORMANCE       = 'view_product_performance'
    VIEW_EMPLOYEE_PERFORMANCE      = 'view_employee_performance'
    VIEW_PROFIT_VS_REVENUE         = 'view_profit_vs_revenue'
    
    TRANSFER_STOCK                 = 'transfer_stock'
    RESERVE_STOCK                  = 'reserve_stock'
    VIEW_LOW_STOCK_ALERTS          = 'view_low_stock_alerts'
    TRACK_DEAD_STOCK               = 'track_dead_stock'
    TRACK_BATCH_EXPIRY             = 'track_batch_expiry'
    APPROVE_PURCHASING             = 'approve_purchasing'
    VIEW_SUPPLIER_PERFORMANCE      = 'view_supplier_performance'
    MANAGE_RATE_CONTRACTS          = 'manage_rate_contracts'

    MANAGE_LOYALTY_POINTS          = 'manage_loyalty_points'
    SET_CUSTOMER_CREDIT_LIMIT      = 'set_customer_credit_limit'
    VIEW_CUSTOMER_SEGMENTATION     = 'view_customer_segmentation'
    MANAGE_BLACKLISTS              = 'manage_blacklists'
    
    VIEW_SALES_PREDICTIONS         = 'view_sales_predictions'
    RECEIVE_FRAUD_ALERTS           = 'receive_fraud_alerts'
    VIEW_SMART_RECOMMENDATIONS     = 'view_smart_recommendations'
    VIEW_AUTO_REORDER_SUGGEST      = 'view_auto_reorder_suggest'

    ALLOW_BACKDATED_ENTRIES        = 'allow_backdated_entries'
    UNLOCK_ACCOUNTING              = 'unlock_accounting'
    EDIT_FINALIZED_INVOICES        = 'edit_finalized_invoices'
    REOPEN_CLOSED_ORDERS           = 'reopen_closed_orders'
    ADJUST_STOCK_MANUALLY          = 'adjust_stock_manually'
    OVERRIDE_STOCK_MISMATCH        = 'override_stock_mismatch'


_ALL_PERMISSIONS = [v for k, v in vars(PERMISSIONS).items() if not k.startswith('_')]

ROLE_PERMISSIONS = {
    ROLES.DIRECTOR: _ALL_PERMISSIONS,
    ROLES.ASSISTANT: _ALL_PERMISSIONS,

    ROLES.CLUSTER_HEAD: [
        PERMISSIONS.VIEW_DASHBOARD, PERMISSIONS.VIEW_REPORTS, PERMISSIONS.VIEW_ANALYTICS,
        PERMISSIONS.VIEW_SETTINGS, PERMISSIONS.VIEW_PRODUCTS, PERMISSIONS.VIEW_ORDERS,
        PERMISSIONS.VIEW_SALES, PERMISSIONS.VIEW_CUSTOMERS, PERMISSIONS.VIEW_SUPPLIERS,
        PERMISSIONS.VIEW_BILLING, PERMISSIONS.VIEW_ACCOUNTS, PERMISSIONS.VIEW_PROFIT_MARGINS,
        PERMISSIONS.VIEW_COST_PRICE, PERMISSIONS.VIEW_SALES_TRENDS, PERMISSIONS.VIEW_PRODUCT_PERFORMANCE,
        PERMISSIONS.VIEW_EMPLOYEE_PERFORMANCE, PERMISSIONS.VIEW_PROFIT_VS_REVENUE,
        PERMISSIONS.VIEW_LOW_STOCK_ALERTS, PERMISSIONS.VIEW_SUPPLIER_PERFORMANCE,
        PERMISSIONS.VIEW_CUSTOMER_SEGMENTATION, PERMISSIONS.VIEW_SALES_PREDICTIONS,
        PERMISSIONS.RECEIVE_FRAUD_ALERTS, PERMISSIONS.VIEW_USERS, PERMISSIONS.VIEW_BRANCHES,
        PERMISSIONS.VIEW_CLUSTERS
    ],
    
    ROLES.CLUSTER_MANAGER: [
        PERMISSIONS.VIEW_DASHBOARD, PERMISSIONS.VIEW_REPORTS, PERMISSIONS.VIEW_ANALYTICS,
        PERMISSIONS.VIEW_SETTINGS, PERMISSIONS.VIEW_PRODUCTS, PERMISSIONS.VIEW_ORDERS,
        PERMISSIONS.VIEW_SALES, PERMISSIONS.VIEW_CUSTOMERS, PERMISSIONS.VIEW_SUPPLIERS,
        PERMISSIONS.VIEW_BILLING, PERMISSIONS.VIEW_ACCOUNTS, PERMISSIONS.VIEW_PROFIT_MARGINS,
        PERMISSIONS.VIEW_COST_PRICE, PERMISSIONS.VIEW_SALES_TRENDS, PERMISSIONS.VIEW_PRODUCT_PERFORMANCE,
        PERMISSIONS.VIEW_EMPLOYEE_PERFORMANCE, PERMISSIONS.VIEW_PROFIT_VS_REVENUE,
        PERMISSIONS.VIEW_LOW_STOCK_ALERTS, PERMISSIONS.VIEW_SUPPLIER_PERFORMANCE,
        PERMISSIONS.VIEW_CUSTOMER_SEGMENTATION, PERMISSIONS.VIEW_SALES_PREDICTIONS,
        PERMISSIONS.RECEIVE_FRAUD_ALERTS, PERMISSIONS.VIEW_USERS, PERMISSIONS.VIEW_BRANCHES
    ],
    
    ROLES.BRANCH_MANAGER: [
        PERMISSIONS.VIEW_DASHBOARD, PERMISSIONS.VIEW_REPORTS, PERMISSIONS.VIEW_ANALYTICS,
        PERMISSIONS.VIEW_SETTINGS, PERMISSIONS.VIEW_PRODUCTS, PERMISSIONS.CREATE_PRODUCTS,
        PERMISSIONS.EDIT_PRODUCTS, PERMISSIONS.DELETE_PRODUCTS, PERMISSIONS.VIEW_ORDERS,
        PERMISSIONS.CREATE_ORDERS, PERMISSIONS.EDIT_ORDERS, PERMISSIONS.DELETE_ORDERS,
        PERMISSIONS.VIEW_SALES, PERMISSIONS.CREATE_SALES, PERMISSIONS.VIEW_CUSTOMERS,
        PERMISSIONS.CREATE_CUSTOMERS, PERMISSIONS.EDIT_CUSTOMERS, PERMISSIONS.DELETE_CUSTOMERS,
        PERMISSIONS.VIEW_SUPPLIERS, PERMISSIONS.CREATE_SUPPLIERS, PERMISSIONS.EDIT_SUPPLIERS,
        PERMISSIONS.DELETE_SUPPLIERS, PERMISSIONS.VIEW_BILLING, PERMISSIONS.CREATE_INVOICES,
        PERMISSIONS.EDIT_INVOICES, PERMISSIONS.DELETE_INVOICES, PERMISSIONS.APPROVE_DISCOUNTS,
        PERMISSIONS.APPROVE_REFUNDS, PERMISSIONS.APPROVE_ORDER_CANCEL, PERMISSIONS.APPROVE_PRICE_OVERRIDE,
        PERMISSIONS.APPROVE_CREDIT_SALES, PERMISSIONS.VIEW_PROFIT_MARGINS, PERMISSIONS.VIEW_COST_PRICE,
        PERMISSIONS.REOPEN_CLOSED_ORDERS, PERMISSIONS.EDIT_FINALIZED_INVOICES, PERMISSIONS.ADJUST_STOCK_MANUALLY,
        PERMISSIONS.OVERRIDE_STOCK_MISMATCH, PERMISSIONS.ACCEPT_SPLIT_PAYMENTS, PERMISSIONS.ACCEPT_PARTIAL_PAYMENTS,
        PERMISSIONS.CREATE_PROFORMA_INVOICES, PERMISSIONS.REPRINT_INVOICES, PERMISSIONS.APPLY_COUPONS,
        PERMISSIONS.PROCESS_BULK_ORDERS, PERMISSIONS.TRANSFER_STOCK, PERMISSIONS.RESERVE_STOCK,
        PERMISSIONS.VIEW_LOW_STOCK_ALERTS, PERMISSIONS.TRACK_DEAD_STOCK, PERMISSIONS.TRACK_BATCH_EXPIRY,
        PERMISSIONS.APPROVE_PURCHASING, PERMISSIONS.VIEW_SUPPLIER_PERFORMANCE, PERMISSIONS.MANAGE_LOYALTY_POINTS,
        PERMISSIONS.VIEW_CUSTOMER_SEGMENTATION, PERMISSIONS.MANAGE_BLACKLISTS, PERMISSIONS.VIEW_SALES_TRENDS,
        PERMISSIONS.VIEW_PRODUCT_PERFORMANCE, PERMISSIONS.VIEW_EMPLOYEE_PERFORMANCE, PERMISSIONS.VIEW_SALES_PREDICTIONS,
        PERMISSIONS.VIEW_SMART_RECOMMENDATIONS, PERMISSIONS.VIEW_AUTO_REORDER_SUGGEST
    ],
    
    ROLES.BILLING_STAFF: [
        PERMISSIONS.VIEW_DASHBOARD, PERMISSIONS.VIEW_BILLING, PERMISSIONS.CREATE_INVOICES,
        PERMISSIONS.EDIT_INVOICES, PERMISSIONS.DELETE_INVOICES, PERMISSIONS.VIEW_ORDERS,
        PERMISSIONS.CREATE_ORDERS, PERMISSIONS.EDIT_ORDERS, PERMISSIONS.VIEW_SALES,
        PERMISSIONS.VIEW_CUSTOMERS, PERMISSIONS.CREATE_CUSTOMERS, PERMISSIONS.EDIT_CUSTOMERS,
        PERMISSIONS.VIEW_PRODUCTS, PERMISSIONS.ACCEPT_SPLIT_PAYMENTS, PERMISSIONS.ACCEPT_PARTIAL_PAYMENTS,
        PERMISSIONS.CREATE_PROFORMA_INVOICES, PERMISSIONS.REPRINT_INVOICES, PERMISSIONS.APPLY_COUPONS,
        PERMISSIONS.VIEW_LOW_STOCK_ALERTS, PERMISSIONS.VIEW_SMART_RECOMMENDATIONS,
        PERMISSIONS.MANAGE_LOYALTY_POINTS, PERMISSIONS.VIEW_CUSTOMER_SEGMENTATION
    ],
    
    ROLES.SALESMAN: [
        PERMISSIONS.VIEW_DASHBOARD, PERMISSIONS.VIEW_SALES, PERMISSIONS.CREATE_SALES,
        PERMISSIONS.VIEW_ORDERS, PERMISSIONS.CREATE_ORDERS, PERMISSIONS.EDIT_ORDERS,
        PERMISSIONS.VIEW_PRODUCTS, PERMISSIONS.VIEW_CUSTOMERS, PERMISSIONS.CREATE_CUSTOMERS,
        PERMISSIONS.EDIT_CUSTOMERS, PERMISSIONS.ACCEPT_SPLIT_PAYMENTS, PERMISSIONS.CREATE_PROFORMA_INVOICES,
        PERMISSIONS.APPLY_COUPONS, PERMISSIONS.RESERVE_STOCK, PERMISSIONS.VIEW_SMART_RECOMMENDATIONS
    ],
    
    ROLES.ACCOUNTANT: [
        PERMISSIONS.VIEW_DASHBOARD, PERMISSIONS.VIEW_REPORTS, PERMISSIONS.VIEW_ANALYTICS,
        PERMISSIONS.VIEW_ACCOUNTS, PERMISSIONS.CREATE_ACCOUNTS, PERMISSIONS.EDIT_ACCOUNTS,
        PERMISSIONS.DELETE_ACCOUNTS, PERMISSIONS.VIEW_BILLING, PERMISSIONS.VIEW_SALES,
        PERMISSIONS.VIEW_ORDERS, PERMISSIONS.VIEW_CUSTOMERS, PERMISSIONS.VIEW_PROFIT_MARGINS,
        PERMISSIONS.VIEW_COST_PRICE, PERMISSIONS.VIEW_SENSITIVE_CUSTOMER_DATA, PERMISSIONS.ALLOW_BACKDATED_ENTRIES,
        PERMISSIONS.UNLOCK_ACCOUNTING, PERMISSIONS.VIEW_PROFIT_VS_REVENUE, PERMISSIONS.VIEW_SALES_TRENDS,
        PERMISSIONS.REPRINT_INVOICES, PERMISSIONS.SET_CUSTOMER_CREDIT_LIMIT, PERMISSIONS.RECEIVE_FRAUD_ALERTS,
        PERMISSIONS.VIEW_AUDIT_LOGS
    ]
}

def has_permission(user: dict, permission: str) -> bool:
    if not user:
        return False
    role = user.get('role')
    if role == ROLES.ASSISTANT:
        return True
    return permission in ROLE_PERMISSIONS.get(role, [])

def get_accessible_branch_ids(user: dict, all_branch_ids: list) -> list:
    if not user:
        return []
    role = user.get('role')
    if role in (ROLES.DIRECTOR, ROLES.ASSISTANT):
        return all_branch_ids
    if role in (ROLES.BRANCH_MANAGER, ROLES.BILLING_STAFF, ROLES.SALESMAN, ROLES.ACCOUNTANT):
        bid = user.get('branch_id')
        return [bid] if bid else []
    if role in (ROLES.CLUSTER_HEAD, ROLES.CLUSTER_MANAGER):
        return user.get('accessible_branch_ids', [])
    return []

def build_branch_filter(user: dict, all_branch_ids: list, alias: str = '') -> tuple:
    accessible = get_accessible_branch_ids(user, all_branch_ids)
    if not accessible:
        return 'AND 1=0', []
    col = f'{alias}.branch_id' if alias else 'branch_id'
    placeholders = ','.join(['?'] * len(accessible))
    return f'AND {col} IN ({placeholders})', list(accessible)

def get_role_display_name(role: str) -> str:
    names = {
        ROLES.DIRECTOR:        'Director',
        ROLES.ASSISTANT:       'Assistant',
        ROLES.CLUSTER_HEAD:    'Cluster Head',
        ROLES.CLUSTER_MANAGER: 'Cluster Manager',
        ROLES.BRANCH_MANAGER:  'Branch Manager',
        ROLES.BILLING_STAFF:   'Billing Staff',
        ROLES.SALESMAN:        'Salesman',
        ROLES.ACCOUNTANT:      'Accountant',
    }
    return names.get(role, role)
