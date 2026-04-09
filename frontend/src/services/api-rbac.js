// Real API service - replaces localStorage mock
// Calls the Flask backend at http://localhost:5000/api/...

import { hasPermission, PERMISSIONS } from './rbac';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';
const BASE_URL = `${API_URL}/api`;

const getToken = () => localStorage.getItem('token');
const getCurrentUser = () => {
  try {
    return JSON.parse(localStorage.getItem('currentUser')) || null;
  } catch {
    return null;
  }
};

const headers = () => ({
  'Content-Type': 'application/json',
  ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}),
});

const handleResponse = async (res) => {
  try {
    const data = await res.json();
    if (!res.ok) {
      // If 401, it's an auth issue - don't retry
      if (res.status === 401) {
        throw new Error('Unauthorized. Please login again.');
      }
      throw new Error(data.error || data.message || 'Request failed');
    }
    return data;
  } catch (e) {
    throw new Error(e.message || 'Invalid response from server');
  }
};

const api = {
  get: (path) => fetch(`${BASE_URL}${path}`, { method: 'GET', headers: headers() }).then(handleResponse),
  post: (path, body) => fetch(`${BASE_URL}${path}`, { method: 'POST', headers: headers(), body: JSON.stringify(body) }).then(handleResponse),
  put: (path, body) => fetch(`${BASE_URL}${path}`, { method: 'PUT', headers: headers(), body: JSON.stringify(body) }).then(handleResponse),
  delete: (path) => fetch(`${BASE_URL}${path}`, { method: 'DELETE', headers: headers() }).then(handleResponse),
};

// ─── Auth ─────────────────────────────────────────────────────────────────────
export const authAPI = {
  login: async (username, password) => {
    const data = await api.post('/auth/login', { username, password });
    localStorage.setItem('token', data.token);
    localStorage.setItem('currentUser', JSON.stringify(data.user));
    return data;
  },
  logout: async () => {
    try { await api.post('/auth/logout', {}); } catch { }
    localStorage.removeItem('token');
    localStorage.removeItem('currentUser');
  },
  getCurrentUser: () => {
    try {
      const u = localStorage.getItem('currentUser');
      return u ? JSON.parse(u) : null;
    } catch { return null; }
  },
  getMe: () => api.get('/auth/me'),
};

// ─── Branches ─────────────────────────────────────────────────────────────────
export const branchesAPI = {
  getAll: () => api.get('/branches'),
  getById: (id) => api.get(`/branches/${id}`),
};

// ─── Clusters ─────────────────────────────────────────────────────────────────
export const clustersAPI = {
  getAll: () => api.get('/clusters'),
};

// ─── Products ─────────────────────────────────────────────────────────────────
export const productsAPI = {
  getAll: () => api.get('/products'),
  getById: (id) => api.get(`/products/${id}`),
  create: (data) => api.post('/products', data),
  update: (id, data) => api.put(`/products/${id}`, data),
  delete: (id) => api.delete(`/products/${id}`),
};

// ─── Orders ───────────────────────────────────────────────────────────────────
export const ordersAPI = {
  getAll: () => api.get('/orders'),
  getById: (id) => api.get(`/orders/${id}`),
  create: (data) => api.post('/orders', data),
  update: (id, data) => api.put(`/orders/${id}`, data),
  delete: (id) => api.delete(`/orders/${id}`),
};

// ─── Customers ────────────────────────────────────────────────────────────────
export const customersAPI = {
  getAll: () => api.get('/customers'),
  getById: (id) => api.get(`/customers/${id}`),
  create: (data) => api.post('/customers', data),
  update: (id, data) => api.put(`/customers/${id}`, data),
  delete: (id) => api.delete(`/customers/${id}`),
};

// ─── Suppliers ────────────────────────────────────────────────────────────────
export const suppliersAPI = {
  getAll: () => api.get('/suppliers'),
  getById: (id) => api.get(`/suppliers/${id}`),
  create: (data) => api.post('/suppliers', data),
  update: (id, data) => api.put(`/suppliers/${id}`, data),
  delete: (id) => api.delete(`/suppliers/${id}`),
};

// ─── Invoices ─────────────────────────────────────────────────────────────────
export const invoicesAPI = {
  getAll: () => api.get('/invoices'),
  getById: (id) => api.get(`/invoices/${id}`),
  create: (data) => api.post('/invoices', data),
  update: (id, data) => api.put(`/invoices/${id}`, data),
  delete: (id) => api.delete(`/invoices/${id}`),
};

// ─── Sales ────────────────────────────────────────────────────────────────────
export const salesAPI = {
  getAll: () => api.get('/sales'),
  getById: (id) => api.get(`/sales/${id}`),
  create: (data) => api.post('/sales', data),
};

// ─── Accounting ───────────────────────────────────────────────────────────────
export const accountingAPI = {
  getAll: () => api.get('/accounting'),
  getById: (id) => api.get(`/accounting/${id}`),
  create: (data) => api.post('/accounting', data),
  update: (id, data) => api.put(`/accounting/${id}`, data),
  delete: (id) => api.delete(`/accounting/${id}`),
};

// ─── Dashboard ────────────────────────────────────────────────────────────────
export const dashboardAPI = {
  getStats: () => api.get('/dashboard/stats'),
};

// ─── Analytics ────────────────────────────────────────────────────────────────
export const analyticsAPI = {
  getRevenueTrend: () => api.get('/analytics/revenue'),
  getTopProducts: () => api.get('/analytics/top-products'),
  getOrderStatusDist: () => api.get('/analytics/order-status'),
  getStockStatus: () => api.get('/analytics/stock-status'),

  // Composite call used by Dashboard.jsx & Analytics.jsx
  getDashboardStats: async () => {
    const safeGetIfPermitted = (route, permission, fallback) => {
      const user = getCurrentUser();
      if (!hasPermission(user, permission)) {
        return Promise.resolve(fallback);
      }
      return api.get(route).catch(() => fallback);
    };
    
    // We catch individual errors to allow partial dashboard rendering 
    // for users without VIEW_ANALYTICS permissions, avoiding 403 console spams
    const [stats, revenue, topProducts] = await Promise.all([
      safeGetIfPermitted('/dashboard/stats', PERMISSIONS.VIEW_DASHBOARD, {}),
      safeGetIfPermitted('/analytics/revenue', PERMISSIONS.VIEW_ANALYTICS, []),
      safeGetIfPermitted('/analytics/top-products', PERMISSIONS.VIEW_ANALYTICS, []),
    ]);
    return {
      ...stats,
      salesByMonth: revenue.map(r => ({
        month: r.month,
        revenue: parseFloat(r.revenue) || 0,
        orders: r.order_count || 0,
      })),
      topProducts: topProducts.map(p => ({
        name: p.product_name,
        revenue: parseFloat(p.revenue) || 0,
        quantity: p.quantity_sold || 0,
      })),
    };
  },
};

// ─── Notifications (client-side stubs) ────────────────────────────────────────
const getStorage = (key, fallback = []) => {
  try { const d = localStorage.getItem(key); return d ? JSON.parse(d) : fallback; } catch { return fallback; }
};
const setStorage = (key, val) => localStorage.setItem(key, JSON.stringify(val));

export const notificationsAPI = {
  getAll: async () => getStorage('notifications'),
  create: async (n) => {
    const list = getStorage('notifications');
    const item = { ...n, id: Date.now().toString(), read: false, createdAt: new Date().toISOString() };
    list.unshift(item);
    setStorage('notifications', list);
    return item;
  },
  markAsRead: async (id) => {
    const list = getStorage('notifications');
    const idx = list.findIndex(n => n.id === id);
    if (idx !== -1) { list[idx].read = true; setStorage('notifications', list); }
    return true;
  },
  markAllAsRead: async () => {
    const list = getStorage('notifications');
    list.forEach(n => n.read = true);
    setStorage('notifications', list);
    return true;
  },
};

let _notifInterval = null;
export const startNotificationSimulation = (callback) => {
  if (_notifInterval) return;
  _notifInterval = setInterval(async () => {
    try {
      // PRE-EMPTIVE RBAC CHECK: Do not blindly ping backend if user functionally lacks VIEW_PRODUCTS right.
      const user = getCurrentUser();
      if (!hasPermission(user, PERMISSIONS.VIEW_PRODUCTS)) {
        return; 
      }
      
      const products = await api.get('/products');
      const low = products.filter(p => p.stock <= p.min_stock);
      if (low.length > 0 && Math.random() > 0.7) {
        const p = low[Math.floor(Math.random() * low.length)];
        const n = await notificationsAPI.create({
          type: 'warning', title: 'Low Stock Alert',
          message: `${p.name} is running low (${p.stock} ${p.unit || 'pcs'} remaining)`,
        });
        if (callback) callback(n);
      }
    } catch { /* ignore if backend unreachable */ }
  }, 30000);
};

export const stopNotificationSimulation = () => {
  if (_notifInterval) { clearInterval(_notifInterval); _notifInterval = null; }
};
