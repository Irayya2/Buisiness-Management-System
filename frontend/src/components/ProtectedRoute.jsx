import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { hasPermission } from '../services/rbac';
import './ProtectedRoute.css';

const ProtectedRoute = ({ children, requiredPermission }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requiredPermission && !hasPermission(user, requiredPermission)) {
    return (
      <div className="error-container">
        <div className="error-message">
          <h2>🔒 Access Denied</h2>
          <p>You don't have permission to access this page.</p>
          <p><strong>Required permission:</strong> {requiredPermission}</p>
          <p><strong>Your role:</strong> {user.role}</p>
          <p className="error-help">
            Please contact your administrator if you believe this is an error.
          </p>
        </div>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;

