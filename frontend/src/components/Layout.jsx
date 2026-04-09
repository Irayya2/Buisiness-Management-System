import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationContext';
import { PERMISSIONS } from '../services/rbac';
import './Layout.css';

const Layout = () => {
  const { user, logout, checkPermission, getRoleName } = useAuth();
  const { unreadCount, notifications, markAsRead, markAllAsRead } = useNotifications();
  const location = useLocation();
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showAccountMenu, setShowAccountMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Navigate to search results or filter based on query
      // For now, just log it
      console.log('Searching for:', searchQuery);
    }
  };

  const isActive = (path) => location.pathname === path;

  const navSections = [
    {
      title: 'Overview',
      items: [
        { path: '/', label: 'Dashboard', icon: '▦', permission: PERMISSIONS.VIEW_DASHBOARD },
        { path: '/analytics', label: 'Analytics', icon: '↗', permission: PERMISSIONS.VIEW_ANALYTICS },
        { path: '/billing', label: 'Reports', icon: '⎘', permission: PERMISSIONS.VIEW_BILLING }
      ]
    },
    {
      title: 'Operations',
      items: [
        { path: '/customers', label: 'Customers', icon: '◎', permission: PERMISSIONS.VIEW_CUSTOMERS },
        { path: '/orders', label: 'Transactions', icon: '↔', permission: PERMISSIONS.VIEW_ORDERS },
        { path: '/products', label: 'Products', icon: '▣', permission: PERMISSIONS.VIEW_PRODUCTS },
        { path: '/suppliers', label: 'Suppliers', icon: '⌂', permission: PERMISSIONS.VIEW_SUPPLIERS }
      ]
    },
    {
      title: 'Finance',
      items: [
        { path: '/sales', label: 'Sales', icon: '₹', permission: PERMISSIONS.VIEW_SALES },
        { path: '/accounting', label: 'Accounting', icon: '≡', permission: PERMISSIONS.VIEW_ACCOUNTS }
      ]
    },
    {
      title: 'Management',
      items: [
        { path: '/settings', label: 'Settings', icon: '⚙', permission: PERMISSIONS.VIEW_SETTINGS }
      ]
    }
  ].map(section => ({
    ...section,
    items: section.items.filter(item => !item.permission || checkPermission(item.permission))
  })).filter(section => section.items.length > 0);

  return (
    <div className="layout">
      <nav className="sidebar">
        <div className="sidebar-header">
          <div className="sidebar-brand" onClick={() => navigate('/')} role="button" tabIndex={0}>
            <div className="brand-mark" aria-hidden="true">SA</div>
            <div className="brand-text">
              <div className="brand-name">Sales Analytics</div>
              <div className="brand-subtitle">Admin Dashboard</div>
            </div>
          </div>
        </div>
        <div className="sidebar-nav">
          {navSections.map(section => (
            <div className="nav-section" key={section.title}>
              <div className="nav-section-title">{section.title}</div>
              <ul className="sidebar-menu">
                {section.items.map(item => (
                  <li key={item.path}>
                    <Link to={item.path} className={isActive(item.path) ? 'active' : ''}>
                      <span className="nav-icon" aria-hidden="true">{item.icon}</span>
                      <span className="nav-label">{item.label}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="sidebar-footer">
          <button className="sidebar-footer-link danger" onClick={handleLogout} type="button">
            <span className="nav-icon" aria-hidden="true">⏻</span>
            <span className="nav-label">Logout</span>
          </button>
        </div>
      </nav>

      <div className="main-content">
        <header className="topbar">
          <div className="topbar-left">
            <div className="topbar-title">
              <div className="topbar-title-text">Business Dashboard</div>
              <div className="topbar-title-subtext">{getRoleName()}</div>
            </div>
          </div>
          <div className="topbar-center">
            <form className="search-bar" onSubmit={handleSearch}>
              <input
                type="text"
                placeholder="Search products, orders, customers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input input"
              />
              <button type="submit" className="btn btn-secondary btn-icon" aria-label="Search">
                <span aria-hidden="true">⌕</span>
              </button>
            </form>
          </div>
          <div className="topbar-right">
            <div className="notification-dropdown">
              <button
                className="btn btn-ghost btn-icon notification-btn"
                onClick={() => {
                  setShowNotifications(!showNotifications);
                  setShowAccountMenu(false);
                }}
                aria-label="Notifications"
              >
                <span aria-hidden="true">🔔</span>
                {unreadCount > 0 && <span className="badge">{unreadCount}</span>}
              </button>
              {showNotifications && (
                <div className="notification-panel">
                  <div className="notification-header">
                    <h3>Notifications</h3>
                    {unreadCount > 0 && (
                      <button className="btn btn-primary" onClick={markAllAsRead} type="button">
                        Mark all as read
                      </button>
                    )}
                  </div>
                  <div className="notification-list">
                    {notifications.length === 0 ? (
                      <p className="no-notifications">No notifications</p>
                    ) : (
                      notifications.slice(0, 10).map(notif => (
                        <div
                          key={notif.id}
                          className={`notification-item ${notif.read ? '' : 'unread'}`}
                          onClick={() => {
                            markAsRead(notif.id);
                            if (notif.link) navigate(notif.link);
                            setShowNotifications(false);
                          }}
                        >
                          <div className="notification-type">{notif.type === 'warning' ? '⚠️' : 'ℹ️'}</div>
                          <div className="notification-content">
                            <strong>{notif.title}</strong>
                            <p>{notif.message}</p>
                            <small>{new Date(notif.createdAt).toLocaleString()}</small>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
            <div className="account-dropdown">
              <button
                className="account-btn"
                onClick={() => {
                  setShowAccountMenu(!showAccountMenu);
                  setShowNotifications(false);
                }}
                type="button"
              >
                <div className="account-avatar">
                  {user?.name?.charAt(0)?.toUpperCase() || user?.username?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                <div className="account-info">
                  <span className="account-name">{user?.name || user?.username}</span>
                  <span className="account-role">{getRoleName()}</span>
                </div>
                <span className="account-arrow">▼</span>
              </button>
              {showAccountMenu && (
                <div className="account-menu">
                  <div className="account-menu-header">
                    <div className="account-avatar-large">
                      {user?.name?.charAt(0)?.toUpperCase() || user?.username?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                    <div>
                      <div className="account-menu-name">{user?.name || user?.username}</div>
                      <div className="account-menu-email">{user?.email}</div>
                    </div>
                  </div>
                  <div className="account-menu-divider"></div>
                  <div className="account-menu-item danger" onClick={handleLogout}>
                    <span className="menu-icon">🚪</span>
                    <span>Logout</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="content-area">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;

