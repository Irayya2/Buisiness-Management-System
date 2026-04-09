import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';
import './Login.css';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [formError, setFormError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const demoAccounts = [
    { role: 'Director', username: 'director', password: 'director123' },
    { role: 'Assistant', username: 'assistant', password: 'assistant123' },
    { role: 'Cluster Head', username: 'clusterhead', password: 'cluster123' },
    { role: 'Cluster Manager', username: 'clustermgr', password: 'clustermgr123' },
    { role: 'Branch Manager', username: 'branchmgr', password: 'branchmgr123' },
    { role: 'Billing Staff', username: 'billing', password: 'billing123' },
    { role: 'Salesman', username: 'salesman', password: 'sales123' },
    { role: 'Accountant', username: 'accountant', password: 'account123' }
  ];

  const logoPath = '/logo.png';

  const errors = useMemo(() => {
    const e = {};
    if (!username.trim()) e.username = 'Username is required';
    if (!password) e.password = 'Password is required';
    return e;
  }, [password, username]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (Object.keys(errors).length > 0) {
      toast.error('Please fix the highlighted fields');
      return;
    }

    setLoading(true);

    const result = await login(username, password);

    if (result.success) {
      toast.success('Login successful!');
      navigate('/');
    } else {
      setFormError(result.error || 'Login failed. Please check your credentials.');
      toast.error(result.error || 'Login failed');
    }

    setLoading(false);
  };

  const fillDemoCredentials = (demoUsername, demoPassword) => {
    setUsername(demoUsername);
    setPassword(demoPassword);
    setFormError('');
  };



  return (
    <div className="auth-shell">
      <div className="auth-left">
        <div className="auth-left-inner">
          <div className="hero-banner">
            <img src={logoPath} alt="Platform Logo" />
          </div>
          <h1 className="auth-title">Sales Analytics Dashboard</h1>
          <p className="auth-subtitle">
            A modern workspace to monitor revenue, transactions, and customer performance—built for speed and clarity.
          </p>

          <div className="auth-features">
            <div className="auth-feature">
              <div className="auth-feature-icon">↗</div>
              <div>
                <div className="auth-feature-title">KPI-driven overview</div>
                <div className="auth-feature-text">Revenue, growth, conversion, and users at a glance.</div>
              </div>
            </div>
            <div className="auth-feature">
              <div className="auth-feature-icon">⎘</div>
              <div>
                <div className="auth-feature-title">Export-ready reports</div>
                <div className="auth-feature-text">Download transaction data for audits and finance reviews.</div>
              </div>
            </div>
            <div className="auth-feature">
              <div className="auth-feature-icon">◎</div>
              <div>
                <div className="auth-feature-title">Role-based access</div>
                <div className="auth-feature-text">Secure RBAC demo data with scoped visibility.</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="auth-right">
        <div className="auth-card card">
          <div className="auth-card-header">
            <div className="auth-brand">
              <div className="auth-brand-mark">SA</div>
              <div>
                <div className="auth-brand-name">Sales Analytics</div>
                <div className="auth-brand-sub">Sign in to continue</div>
              </div>
            </div>
          </div>

          <div className="auth-card-body">
            {formError && (
              <div className="auth-alert" role="alert">
                {formError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="auth-form" noValidate>
              <div className="auth-field">
                <label htmlFor="username" className="auth-label">Username</label>
                <input
                  type="text"
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your username"
                  className={`input ${errors.username ? 'input-error' : ''}`}
                  aria-invalid={Boolean(errors.username)}
                />
                {errors.username && <div className="auth-hint error">{errors.username}</div>}
              </div>

              <div className="auth-field">
                <label htmlFor="password" className="auth-label">Password</label>
                <div className="auth-password">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className={`input ${errors.password ? 'input-error' : ''}`}
                    aria-invalid={Boolean(errors.password)}
                  />
                  <button
                    className="btn btn-ghost btn-icon auth-eye"
                    type="button"
                    onClick={() => setShowPassword(v => !v)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? '🙈' : '👁'}
                  </button>
                </div>
                {errors.password && <div className="auth-hint error">{errors.password}</div>}
              </div>

              <div className="auth-row">
                <label className="auth-check">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                  <span>Remember me</span>
                </label>
                <button className="btn btn-ghost auth-link" type="button" onClick={() => toast.info('Demo app: password reset not enabled')}>
                  Forgot password?
                </button>
              </div>

              <button type="submit" className="login-btn" disabled={loading}>
                {loading ? 'Signing in…' : 'Sign in'}
              </button>
            </form>

            <div className="auth-divider" />

            <details className="auth-credentials">
              <summary>Demo credentials</summary>
              <div className="auth-creds-grid">
                {demoAccounts.map((account) => (
                  <button
                    key={account.username}
                    type="button"
                    className="demo-credential"
                    onClick={() => fillDemoCredentials(account.username, account.password)}
                  >
                    <strong>{account.role}</strong>
                    <span>{account.username} / {account.password}</span>
                  </button>
                ))}
              </div>
            </details>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;


