import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api-rbac';
import { hasPermission, getRoleDisplayName } from '../services/rbac';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const currentUser = authAPI.getCurrentUser();
    if (currentUser) {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          // Real JWTs are 3-part base64url: header.payload.signature
          const parts = token.split('.');
          const payload = parts.length === 3 ? parts[1] : token;
          // base64url → base64, then decode
          const b64 = payload.replace(/-/g, '+').replace(/_/g, '/');
          const decoded = JSON.parse(atob(b64));
          if (decoded.exp > Math.floor(Date.now() / 1000)) {
            setUser(currentUser);
          } else {
            localStorage.removeItem('token');
            localStorage.removeItem('currentUser');
          }
        } catch {
          localStorage.removeItem('token');
          localStorage.removeItem('currentUser');
        }
      }
    }
    setLoading(false);
  }, []);


  const login = async (username, password) => {
    try {
      const { user, token } = await authAPI.login(username, password);
      setUser(user);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const logout = async () => {
    await authAPI.logout();
    setUser(null);
  };

  const hasRole = (roles) => {
    if (!user) return false;
    if (Array.isArray(roles)) {
      return roles.includes(user.role);
    }
    return user.role === roles;
  };

  const checkPermission = (permission) => {
    return hasPermission(user, permission);
  };

  const getRoleName = () => {
    return user ? getRoleDisplayName(user.role) : '';
  };

  const value = {
    user,
    login,
    logout,
    hasRole,
    checkPermission,
    getRoleName,
    loading
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};


