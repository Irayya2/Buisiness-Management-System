# Role-Based Access Control (RBAC) System Documentation

## Overview

This Sales & Inventory Management System implements a comprehensive Role-Based Access Control (RBAC) system designed for a multi-branch business structure with hierarchical roles and permissions.

## System Architecture

### Role Hierarchy

```
Director (Top-level, Read-only)
    ↓
Assistant (Full access, all operations)
    ↓
Cluster Head (Access to branches in cluster head region)
    ↓
Cluster Manager (Access to branches in their cluster)
    ↓
Branch Manager (Full access to their branch)
    ├── Billing Staff (Billing module only)
    ├── Salesman (Sales recording with Sales ID)
    └── Accountant (Accounting & financial records)
```

## Roles and Permissions

### 1. Director
- **Access Level**: Read-only, top-level
- **Permissions**:
  - View Dashboard
  - View Reports & Analytics
  - View all Products, Orders, Sales, Customers, Suppliers
  - View Billing & Accounting data
- **Data Access**: All branches (read-only)
- **Login**: `director` / `director123`

### 2. Assistant
- **Access Level**: Full access (0-to-N), all modules
- **Permissions**: ALL permissions (create, edit, delete, view)
- **Data Access**: All branches (full access)
- **Login**: `assistant` / `assistant123`

### 3. Cluster Head
- **Access Level**: View and manage branches in their cluster head region
- **Permissions**:
  - View Dashboard, Reports, Analytics
  - View Products, Orders, Sales, Customers, Suppliers
  - View Billing & Accounting
  - View Branches & Clusters
- **Data Access**: All branches in their cluster head region
- **Login**: `clusterhead` / `cluster123`

### 4. Cluster Manager
- **Access Level**: View and manage branches in their cluster
- **Permissions**:
  - View Dashboard, Reports
  - View Products, Orders, Sales, Customers, Suppliers
  - View Billing & Accounting
  - View Branches
- **Data Access**: Branches within their assigned cluster
- **Login**: `clustermgr` / `clustermgr123`

### 5. Branch Manager
- **Access Level**: Full access to their own branch only
- **Permissions**:
  - View Dashboard, Reports
  - Create/Edit Products
  - Create/Edit Orders
  - View Sales
  - Create/Edit Customers
  - View Suppliers, Billing, Accounting
- **Data Access**: Only their assigned branch
- **Login**: `branchmgr` / `branchmgr123`

### 6. Billing Staff
- **Access Level**: Billing module only
- **Permissions**:
  - View Dashboard
  - View/Create/Edit Invoices
  - View Orders & Customers
- **Data Access**: Only their branch's billing data
- **Login**: `billing` / `billing123`

### 7. Salesman
- **Access Level**: Limited - Sales recording only
- **Permissions**:
  - View Dashboard
  - View/Create Sales (using Sales ID)
  - View Products & Customers
- **Data Access**: Only their branch's sales data
- **Special Feature**: Uses Sales ID to track daily sales
- **Login**: `salesman` / `sales123`

### 8. Accountant
- **Access Level**: Accounting & financial records
- **Permissions**:
  - View Dashboard
  - View/Create/Edit Accounting entries
  - View Billing, Orders, Sales
- **Data Access**: Only their branch's accounting data
- **Login**: `accountant` / `account123`

## Branch & Cluster Structure

### Branches
- Each branch has:
  - Branch Manager
  - Billing Section (Billing Staff)
  - Salesmen (with Sales IDs)
  - Accountant

### Clusters
- Branches are grouped into clusters
- Each cluster has a Cluster Manager
- Cluster Heads oversee multiple clusters

## Data Access Rules

### Branch-Level Filtering
- **Branch Manager, Billing Staff, Salesman, Accountant**: Can only access data from their assigned branch
- **Cluster Manager**: Can access data from branches in their cluster
- **Cluster Head**: Can access data from branches in their cluster head region
- **Director & Assistant**: Can access all branches

### Permission-Based Actions
- Create actions require `CREATE_*` permissions
- Edit actions require `EDIT_*` permissions
- Delete actions require `DELETE_*` permissions
- View actions require `VIEW_*` permissions

## Security Features

1. **Route Protection**: All routes are protected with permission checks
2. **API-Level Filtering**: Data is filtered based on user role and branch access
3. **UI-Level Permissions**: Buttons and actions are hidden/shown based on permissions
4. **JWT Authentication**: Secure token-based authentication
5. **Role-Based Menu**: Sidebar menu shows only accessible modules

## Implementation Details

### Files Structure

```
src/
├── services/
│   ├── rbac.js          # RBAC system (roles, permissions, access control)
│   └── api-rbac.js     # API with RBAC filtering
├── contexts/
│   └── AuthContext.jsx # Authentication with RBAC support
├── components/
│   ├── ProtectedRoute.jsx  # Route protection component
│   └── Layout.jsx          # Layout with role-based menu
└── pages/
    ├── Dashboard.jsx   # Role-appropriate dashboard
    ├── Products.jsx    # Product management (with permissions)
    ├── Orders.jsx      # Order management (with permissions)
    ├── Sales.jsx       # Sales module (Sales ID tracking)
    ├── Billing.jsx     # Billing & Invoices
    └── Accounting.jsx  # Accounting & Financial records
```

### Key Functions

#### Permission Checking
```javascript
import { useAuth } from '../contexts/AuthContext';
import { PERMISSIONS } from '../services/rbac';

const { checkPermission } = useAuth();
if (checkPermission(PERMISSIONS.CREATE_PRODUCTS)) {
  // Show create button
}
```

#### Branch Access Checking
```javascript
import { canAccessBranch } from '../services/rbac';

if (canAccessBranch(user, branchId)) {
  // User can access this branch's data
}
```

## Testing the System

### Login Credentials

| Role | Username | Password | Access Level |
|------|----------|----------|--------------|
| Director | `director` | `director123` | Read-only, all branches |
| Assistant | `assistant` | `assistant123` | Full access, all branches |
| Cluster Head | `clusterhead` | `cluster123` | View, cluster head region |
| Cluster Manager | `clustermgr` | `clustermgr123` | View, assigned cluster |
| Branch Manager | `branchmgr` | `branchmgr123` | Full access, own branch |
| Billing Staff | `billing` | `billing123` | Billing only, own branch |
| Salesman | `salesman` | `sales123` | Sales only, own branch |
| Accountant | `accountant` | `account123` | Accounting only, own branch |

### Testing Scenarios

1. **Director Login**: Should see all data but no create/edit buttons
2. **Assistant Login**: Should see all modules and full access
3. **Branch Manager Login**: Should only see their branch's data
4. **Salesman Login**: Should only see Sales module and Sales ID badge
5. **Billing Staff Login**: Should only see Billing and related modules
6. **Accountant Login**: Should only see Accounting and financial modules

## Data Structure

### User Object
```javascript
{
  id: 'user-id',
  username: 'username',
  email: 'email@example.com',
  role: 'branch_manager',
  name: 'User Name',
  branchId: 'branch-1',           // For branch-level roles
  clusterId: 'cluster-1',         // For cluster-level roles
  accessibleBranchIds: ['branch-1', 'branch-2'], // For cluster roles
  salesId: 'SALES-001'            // For salesmen
}
```

### Branch Object
```javascript
{
  id: 'branch-1',
  name: 'Main Branch',
  address: '123 Main St',
  clusterId: 'cluster-1',
  managerId: 'user-id',
  accountantId: 'user-id'
}
```

## Features

### Sales ID Tracking
- Salesmen are assigned a unique Sales ID
- All sales records include the Sales ID
- Sales ID is displayed in the Sales module
- Sales records are tracked by Sales ID for reporting

### Branch-Based Data Isolation
- Products, Orders, Sales, Customers are filtered by branch
- Each branch's data is isolated from other branches
- Cluster-level roles can see multiple branches
- Director and Assistant see all branches

### Permission-Based UI
- Create buttons only show if user has CREATE permission
- Edit buttons only show if user has EDIT permission
- Delete buttons only show if user has DELETE permission
- Menu items are filtered based on VIEW permissions

## Security Best Practices

1. **Never trust client-side permissions alone** - Always validate on server-side (in production)
2. **Use HTTPS** - All authentication should be over HTTPS
3. **Token expiration** - JWT tokens expire after 24 hours
4. **Role validation** - Roles are validated on every API call
5. **Branch filtering** - Data is filtered at API level, not just UI level

## Future Enhancements

1. User management module (for Assistant/Director)
2. Branch/Cluster management interface
3. Audit logs for all actions
4. Advanced reporting with role-based filters
5. Multi-factor authentication
6. Session management
7. Password reset functionality

## Notes

- This is a demo system using localStorage
- In production, implement proper backend with database
- Add proper password hashing (bcrypt, etc.)
- Implement proper JWT signing and verification
- Add rate limiting and CSRF protection
- Implement proper logging and monitoring

