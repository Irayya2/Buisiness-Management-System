import React, { useState, useEffect } from 'react';
import { ordersAPI, productsAPI, customersAPI } from '../services/api-rbac';
import { useAuth } from '../contexts/AuthContext';
import { PERMISSIONS } from '../services/rbac';
import { toast } from 'react-toastify';
import { safeDate } from '../utils/dateUtils';
import { exportToExcel } from '../utils/exportToExcel';
import './Orders.css';

const Orders = () => {
  const { checkPermission } = useAuth();
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingOrder, setEditingOrder] = useState(null);
  const [formData, setFormData] = useState({
    customerId: '',
    items: [{ productId: '', quantity: 1 }],
    notes: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [ordersData, productsData, customersData] = await Promise.all([
        ordersAPI.getAll().catch(() => []),
        productsAPI.getAll().catch(() => []),
        customersAPI.getAll().catch(() => [])
      ]);
      setOrders(ordersData);
      setProducts(productsData);
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

  const handleItemChange = (index, field, value) => {
    const newItems = [...formData.items];
    newItems[index] = { ...newItems[index], [field]: value };
    setFormData(prev => ({ ...prev, items: newItems }));
  };

  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      
      items: [...prev.items, { productId: '', quantity: 1 }]
    }));
  };

  const removeItem = (index) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.items.length === 0 || formData.items.some(item => !item.productId)) {
      toast.error('Please add at least one product to the order');
      return;
    }

    if (editingOrder && !checkPermission(PERMISSIONS.EDIT_ORDERS)) {
      toast.error('Permission denied');
      return;
    }
    
    if (!editingOrder && !checkPermission(PERMISSIONS.CREATE_ORDERS)) {
      toast.error('Permission denied');
      return;
    }

    try {
      if (editingOrder) {
        await ordersAPI.update(editingOrder.id, formData);
        toast.success('Order updated successfully');
      } else {
        await ordersAPI.create(formData);
        toast.success('Order created successfully');
      }

      setShowModal(false);
      setEditingOrder(null);
      setFormData({
        customerId: '',
        items: [{ productId: '', quantity: 1 }],
        notes: ''
      });
      loadData();
    } catch (error) {
      toast.error(error.message || 'Failed to save order');
    }
  };

  const handleEdit = (order) => {
    setEditingOrder(order);
    setFormData({
      customerId: order.customerId,
      items: order.items || [{ productId: '', quantity: 1 }],
      notes: order.notes || ''
    });
    setShowModal(true);
  };

  const handleStatusChange = async (orderId, newStatus) => {
    if (!checkPermission(PERMISSIONS.EDIT_ORDERS)) {
      toast.error('Permission denied');
      return;
    }
    
    try {
      await ordersAPI.update(orderId, { status: newStatus });
      toast.success('Order status updated');
      loadData();
    } catch (error) {
      toast.error(error.message || 'Failed to update order status');
    }
  };

  const handleDelete = async (id) => {
    if (!checkPermission(PERMISSIONS.DELETE_ORDERS)) {
      toast.error('Permission denied');
      return;
    }
    
    if (window.confirm('Are you sure you want to delete this order?')) {
      try {
        await ordersAPI.delete(id);
        toast.success('Order deleted successfully');
        loadData();
      } catch (error) {
        toast.error(error.message || 'Failed to delete order');
      }
    }
  };

  const generateInvoice = (order) => {
    const invoiceContent = `
      INVOICE
      Order Number: ${order.orderNumber}
      Date: ${safeDate(order.createdAt, 'MMM dd, yyyy')}
      
      Items:
      ${order.items.map(item => `- ${item.name} x ${item.quantity} @ ₹${item.price} = ₹${(parseFloat(item.price || 0) * parseFloat(item.quantity || 0)).toFixed(2)}`).join('\n')}
      
      Subtotal: ₹${(parseFloat(order.subtotal) || 0).toFixed(2)}
      Tax: ₹${(parseFloat(order.tax) || 0).toFixed(2)}
      Total: ₹${(parseFloat(order.total) || 0).toFixed(2)}
    `;
    
    const blob = new Blob([invoiceContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `invoice-${order.orderNumber}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Invoice downloaded');
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingOrder(null);
    setFormData({
      customerId: '',
      items: [{ productId: '', quantity: 1 }],
      notes: ''
    });
  };

  if (loading) {
    return <div className="loading">Loading orders...</div>;
  }

  return (
    <div className="orders-page">
      <div className="page-header">
        <h2>Sales Orders</h2>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn-secondary" onClick={() => exportToExcel(orders, 'orders_data')}>
            Export Excel
          </button>
          {checkPermission(PERMISSIONS.CREATE_ORDERS) && (
            <button className="btn-primary" onClick={() => setShowModal(true)}>
              + Create Order
            </button>
          )}
        </div>
      </div>

      <div className="orders-table-container">
        <table className="orders-table">
          <thead>
            <tr>
              <th>Order #</th>
              <th>Customer</th>
              <th>Items</th>
              <th>Total</th>
              <th>Status</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 ? (
              <tr>
                <td colSpan="7" className="empty-state">No orders found</td>
              </tr>
            ) : (
              orders.map(order => {
                const customer = customers.find(c => c.id === order.customerId);
                return (
                  <tr key={order.id}>
                    <td>{order.orderNumber}</td>
                    <td>{customer?.name || 'N/A'}</td>
                    <td>{order.items?.length || 0} items</td>
                    <td>₹{order.total?.toFixed(2) || '0.00'}</td>
                    <td>
                      <select
                        value={order.status}
                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                        className={`status-select status-${order.status}`}
                        disabled={!checkPermission(PERMISSIONS.EDIT_ORDERS)}
                      >
                        <option value="pending">Pending</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>
                    <td>{safeDate(order.createdAt, 'MMM dd, yyyy')}</td>
                    <td>
                      <div className="action-buttons">
                        {checkPermission(PERMISSIONS.EDIT_ORDERS) && (
                          <button className="btn-edit" onClick={() => handleEdit(order)}>Edit</button>
                        )}
                        <button className="btn-invoice" onClick={() => generateInvoice(order)}>Invoice</button>
                        {checkPermission(PERMISSIONS.DELETE_ORDERS) && (
                          <button className="btn-delete" onClick={() => handleDelete(order.id)}>Delete</button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingOrder ? 'Edit Order' : 'Create New Order'}</h3>
              <button className="modal-close" onClick={handleCloseModal}>×</button>
            </div>
            <form onSubmit={handleSubmit} className="order-form">
              <div className="form-group">
                <label>Customer *</label>
                <select
                  name="customerId"
                  value={formData.customerId}
                  onChange={handleInputChange}
                  required
                  disabled={customers.length === 0}
                >
                  <option value="">
                    {customers.length === 0 ? 'No customers available' : 'Select a customer'}
                  </option>
                  {customers.map(customer => (
                    <option key={customer.id} value={customer.id}>
                      {customer.name}
                    </option>
                  ))}
                </select>
                {customers.length === 0 && (
                  <small style={{ color: 'var(--color-warning)', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                    Please add a customer first
                  </small>
                )}
              </div>

              <div className="form-group">
                <label>Order Items *</label>
                {formData.items.map((item, index) => (
                  <div key={index} className="order-item-row">
                    <select
                      value={item.productId}
                      onChange={(e) => handleItemChange(index, 'productId', e.target.value)}
                      required
                      disabled={products.length === 0}
                    >
                      <option value="">
                        {products.length === 0 ? 'No products available' : 'Select product'}
                      </option>
                      {products.map(product => (
                        <option key={product.id} value={product.id}>
                          {product.name} (Stock: {product.stock})
                        </option>
                      ))}
                    </select>
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value))}
                      required
                      placeholder="Qty"
                    />
                    <button
                      type="button"
                      className="btn-remove"
                      onClick={() => removeItem(index)}
                      disabled={formData.items.length === 1}
                    >
                      Remove
                    </button>
                  </div>
                ))}
                <button type="button" className="btn-add-item" onClick={addItem}>
                  + Add Item
                </button>
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
                <button type="button" className="btn-secondary" onClick={handleCloseModal}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  {editingOrder ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;


