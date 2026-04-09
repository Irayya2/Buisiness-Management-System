import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { PERMISSIONS } from './services/rbac';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Orders from './pages/Orders';
import Customers from './pages/Customers';
import Suppliers from './pages/Suppliers';
import Analytics from './pages/Analytics';
import Billing from './pages/Billing';
import Sales from './pages/Sales';
import Accounting from './pages/Accounting';
import Settings from './pages/Settings';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import BackgroundGraph from './components/BackgroundGraph';
import './App.css';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return user ? children : <Navigate to="/login" />;
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/"
        element={
          <PrivateRoute>
            <Layout />
          </PrivateRoute>
        }
      >
        <Route index element={
          <ProtectedRoute requiredPermission={PERMISSIONS.VIEW_DASHBOARD}>
            <Dashboard />
          </ProtectedRoute>
        } />
        <Route path="products" element={
          <ProtectedRoute requiredPermission={PERMISSIONS.VIEW_PRODUCTS}>
            <Products />
          </ProtectedRoute>
        } />
        <Route path="orders" element={
          <ProtectedRoute requiredPermission={PERMISSIONS.VIEW_ORDERS}>
            <Orders />
          </ProtectedRoute>
        } />
        <Route path="customers" element={
          <ProtectedRoute requiredPermission={PERMISSIONS.VIEW_CUSTOMERS}>
            <Customers />
          </ProtectedRoute>
        } />
        <Route path="suppliers" element={
          <ProtectedRoute requiredPermission={PERMISSIONS.VIEW_SUPPLIERS}>
            <Suppliers />
          </ProtectedRoute>
        } />
        <Route path="analytics" element={
          <ProtectedRoute requiredPermission={PERMISSIONS.VIEW_ANALYTICS}>
            <Analytics />
          </ProtectedRoute>
        } />
        <Route path="billing" element={
          <ProtectedRoute requiredPermission={PERMISSIONS.VIEW_BILLING}>
            <Billing />
          </ProtectedRoute>
        } />
        <Route path="sales" element={
          <ProtectedRoute requiredPermission={PERMISSIONS.VIEW_SALES}>
            <Sales />
          </ProtectedRoute>
        } />
        <Route path="accounting" element={
          <ProtectedRoute requiredPermission={PERMISSIONS.VIEW_ACCOUNTS}>
            <Accounting />
          </ProtectedRoute>
        } />
        <Route path="settings" element={
          <ProtectedRoute requiredPermission={PERMISSIONS.VIEW_SETTINGS}>
            <Settings />
          </ProtectedRoute>
        } />
      </Route>
    </Routes>
  );
};

function App() {
  return (
    <>
      <BackgroundGraph />
      <div className="app-layer">
        <AuthProvider>
          <NotificationProvider>
            <Router
              future={{
                v7_startTransition: true,
                v7_relativeSplatPath: true
              }}
            >
              <AppRoutes />
              <ToastContainer position="top-right" autoClose={3000} />
            </Router>
          </NotificationProvider>
        </AuthProvider>
      </div>
    </>
  );
}

export default App;


