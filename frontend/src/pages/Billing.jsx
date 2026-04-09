import React, { useState, useEffect } from 'react';
import { invoicesAPI, ordersAPI, customersAPI } from '../services/api-rbac';
import { useAuth } from '../contexts/AuthContext';
import { PERMISSIONS } from '../services/rbac';
import { toast } from 'react-toastify';
import { safeDate } from '../utils/dateUtils';
import { exportToExcel } from '../utils/exportToExcel';
import './Billing.css';

const Billing = () => {
  const { user, checkPermission } = useAuth();
  const [invoices, setInvoices] = useState([]);
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    orderId: '',
    customerId: '',
    dueDate: '',
    notes: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [invoicesData, ordersData, customersData] = await Promise.all([
        invoicesAPI.getAll().catch(() => []),
        ordersAPI.getAll().catch(() => []),
        customersAPI.getAll().catch(() => [])
      ]);
      setInvoices(invoicesData);
      setOrders(ordersData);
      setCustomers(customersData);
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
    
    if (!checkPermission(PERMISSIONS.CREATE_INVOICES)) {
      toast.error('Permission denied');
      return;
    }

    try {
      const selectedOrder = orders.find(o => o.id === formData.orderId);
      if (!selectedOrder) {
        toast.error('Please select an order');
        return;
      }

      await invoicesAPI.create({
        orderId: formData.orderId,
        customerId: formData.customerId || selectedOrder.customerId,
        amount: selectedOrder.total,
        dueDate: formData.dueDate,
        notes: formData.notes,
        items: selectedOrder.items
      });

      toast.success('Invoice created successfully');
      setShowModal(false);
      setFormData({
        orderId: '',
        customerId: '',
        dueDate: '',
        notes: ''
      });
      loadData();
    } catch (error) {
      toast.error(error.message || 'Failed to create invoice');
    }
  };

  const downloadInvoice = (invoice) => {
    const invoiceContent = `
      INVOICE
      Invoice Number: ${invoice.invoiceNumber}
      Date: ${safeDate(invoice.createdAt, 'MMM dd, yyyy')}
      Due Date: ${invoice.dueDate ? safeDate(invoice.dueDate, 'MMM dd, yyyy') : 'N/A'}
      
      Customer: ${customers.find(c => c.id === invoice.customerId)?.name || 'N/A'}
      
      Items:
      ${invoice.items?.map(item => `- ${item.name} x ${item.quantity} @ ₹${parseFloat(item.price) || 0} = ₹${(parseFloat(item.price || 0) * parseFloat(item.quantity || 0)).toFixed(2)}`).join('\n') || 'N/A'}
      
      Amount: ₹${(parseFloat(invoice.amount) || 0).toFixed(2)}
      Status: ${invoice.status}
      
      Notes: ${invoice.notes || 'None'}
    `;
    
    const blob = new Blob([invoiceContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `invoice-${invoice.invoiceNumber}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Invoice downloaded');
  };

  if (loading) {
    return <div className="loading">Loading billing data...</div>;
  }

  const canCreate = checkPermission(PERMISSIONS.CREATE_INVOICES);

  return (
    <div className="billing-page">
      <div className="page-header">
        <h2>Billing & Invoices</h2>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn-secondary" onClick={() => exportToExcel(invoices, 'billing_data')}>
            Export Excel
          </button>
          {canCreate && (
            <button className="btn-primary" onClick={() => setShowModal(true)}>
              + Create Invoice
            </button>
          )}
        </div>
      </div>

      <div className="invoices-table-container">
        <table className="invoices-table">
          <thead>
            <tr>
              <th>Invoice #</th>
              <th>Order #</th>
              <th>Customer</th>
              <th>Amount</th>
              <th>Due Date</th>
              <th>Status</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {invoices.length === 0 ? (
              <tr>
                <td colSpan="8" className="empty-state">No invoices found</td>
              </tr>
            ) : (
              invoices.map(invoice => {
                const customer = customers.find(c => c.id === invoice.customerId);
                const order = orders.find(o => o.id === invoice.orderId);
                return (
                  <tr key={invoice.id}>
                    <td>{invoice.invoiceNumber}</td>
                    <td>{order?.orderNumber || 'N/A'}</td>
                    <td>{customer?.name || 'N/A'}</td>
                    <td>₹{invoice.amount?.toFixed(2) || '0.00'}</td>
                    <td>{invoice.dueDate ? safeDate(invoice.dueDate, 'MMM dd, yyyy') : 'N/A'}</td>
                    <td>
                      <span className={`status-badge status-${invoice.status}`}>
                        {invoice.status}
                      </span>
                    </td>
                    <td>{safeDate(invoice.createdAt, 'MMM dd, yyyy')}</td>
                    <td>
                      <button className="btn-download" onClick={() => downloadInvoice(invoice)}>
                        Download
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Create New Invoice</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            <form onSubmit={handleSubmit} className="invoice-form">
              <div className="form-group">
                <label>Order *</label>
                <select
                  name="orderId"
                  value={formData.orderId}
                  onChange={handleInputChange}
                  required
                  disabled={orders.filter(o => o.status !== 'cancelled').length === 0}
                >
                  <option value="">
                    {orders.filter(o => o.status !== 'cancelled').length === 0 
                      ? 'No orders available' 
                      : 'Select an order'}
                  </option>
                  {orders.filter(o => o.status !== 'cancelled').map(order => (
                    <option key={order.id} value={order.id}>
                      {order.orderNumber} - ₹{order.total?.toFixed(2)}
                    </option>
                  ))}
                </select>
                {orders.filter(o => o.status !== 'cancelled').length === 0 && (
                  <small style={{ color: 'var(--color-warning)', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                    Please create an order first
                  </small>
                )}
              </div>

              <div className="form-group">
                <label>Due Date</label>
                <input
                  type="date"
                  name="dueDate"
                  value={formData.dueDate}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-group">
                <label>Notes</label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  rows="3"
                />
              </div>

              <div className="form-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Create Invoice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Billing;

