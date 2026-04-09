import React, { useState, useEffect } from 'react';
import { accountingAPI, invoicesAPI, ordersAPI } from '../services/api-rbac';
import { useAuth } from '../contexts/AuthContext';
import { PERMISSIONS } from '../services/rbac';
import { toast } from 'react-toastify';
import { safeDate } from '../utils/dateUtils';
import { exportToExcel } from '../utils/exportToExcel';
import './Accounting.css';

const Accounting = () => {
  const { user, checkPermission } = useAuth();
  const [entries, setEntries] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    type: 'debit',
    category: '',
    amount: '',
    description: '',
    reference: '',
    date: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [entriesData, invoicesData, ordersData] = await Promise.all([
        accountingAPI.getAll().catch(() => []),
        invoicesAPI.getAll().catch(() => []),
        ordersAPI.getAll().catch(() => [])
      ]);
      setEntries(entriesData);
      setInvoices(invoicesData);
      setOrders(ordersData);
    } catch (error) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!checkPermission(PERMISSIONS.CREATE_ACCOUNTS)) {
      toast.error('Permission denied');
      return;
    }

    try {
      await accountingAPI.create({
        type: formData.type,
        category: formData.category,
        amount: parseFloat(formData.amount),
        description: formData.description,
        reference: formData.reference,
        date: formData.date
      });

      toast.success('Accounting entry created successfully');
      setShowModal(false);
      setFormData({
        type: 'debit',
        category: '',
        amount: '',
        description: '',
        reference: '',
        date: new Date().toISOString().split('T')[0]
      });
      loadData();
    } catch (error) {
      toast.error(error.message || 'Failed to create entry');
    }
  };

  const calculateTotals = () => {
    const debits = entries.filter(e => e.type === 'debit').reduce((sum, e) => sum + (e.amount || 0), 0);
    const credits = entries.filter(e => e.type === 'credit').reduce((sum, e) => sum + (e.amount || 0), 0);
    return { debits, credits, balance: debits - credits };
  };

  if (loading) {
    return <div className="loading">Loading accounting data...</div>;
  }

  const canCreate = checkPermission(PERMISSIONS.CREATE_ACCOUNTS);
  const totals = calculateTotals();

  return (
    <div className="accounting-page">
      <div className="page-header">
        <h2>Accounting & Financial Records</h2>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn-secondary" onClick={() => exportToExcel(entries, 'accounting_entries')}>
            Export Excel
          </button>
          {canCreate && (
            <button className="btn-primary" onClick={() => setShowModal(true)}>
              + New Entry
            </button>
          )}
        </div>
      </div>

      <div className="accounting-summary">
        <div className="summary-card">
          <h3>Total Debits</h3>
          <p className="summary-value debit">₹{totals.debits.toFixed(2)}</p>
        </div>
        <div className="summary-card">
          <h3>Total Credits</h3>
          <p className="summary-value credit">₹{totals.credits.toFixed(2)}</p>
        </div>
        <div className="summary-card">
          <h3>Balance</h3>
          <p className={`summary-value ${totals.balance >= 0 ? 'debit' : 'credit'}`}>
            ₹{Math.abs(totals.balance).toFixed(2)}
          </p>
        </div>
      </div>

      <div className="entries-table-container">
        <table className="entries-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Type</th>
              <th>Category</th>
              <th>Description</th>
              <th>Reference</th>
              <th>Amount</th>
              <th>Created By</th>
            </tr>
          </thead>
          <tbody>
            {entries.length === 0 ? (
              <tr>
                <td colSpan="7" className="empty-state">No accounting entries found</td>
              </tr>
            ) : (
              entries.map(entry => (
                <tr key={entry.id}>
                  <td>{safeDate(entry.date || entry.createdAt, 'MMM dd, yyyy')}</td>
                  <td>
                    <span className={`entry-type type-${entry.type}`}>
                      {entry.type.toUpperCase()}
                    </span>
                  </td>
                  <td>{entry.category}</td>
                  <td>{entry.description}</td>
                  <td>{entry.reference || 'N/A'}</td>
                  <td className={entry.type === 'debit' ? 'debit' : 'credit'}>
                    ₹{entry.amount?.toFixed(2) || '0.00'}
                  </td>
                  <td>{entry.createdBy || 'N/A'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>New Accounting Entry</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            <form onSubmit={handleSubmit} className="accounting-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Type *</label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="debit">Debit</option>
                    <option value="credit">Credit</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Date *</label>
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Category *</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select category</option>
                  <option value="Sales">Sales</option>
                  <option value="Purchase">Purchase</option>
                  <option value="Expense">Expense</option>
                  <option value="Income">Income</option>
                  <option value="Payment">Payment</option>
                  <option value="Receipt">Receipt</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="form-group">
                <label>Amount (₹) *</label>
                <input
                  type="number"
                  step="0.01"
                  name="amount"
                  value={formData.amount}
                  onChange={handleInputChange}
                  required
                  min="0"
                />
              </div>

              <div className="form-group">
                <label>Description *</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="3"
                  required
                />
              </div>

              <div className="form-group">
                <label>Reference</label>
                <input
                  type="text"
                  name="reference"
                  value={formData.reference}
                  onChange={handleInputChange}
                  placeholder="Invoice/Order number, etc."
                />
              </div>

              <div className="form-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Create Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Accounting;

