import React, { useState, useEffect } from 'react';
import { salesAPI, productsAPI, customersAPI } from '../services/api-rbac';
import { useAuth } from '../contexts/AuthContext';
import { PERMISSIONS, ROLES } from '../services/rbac';
import { toast } from 'react-toastify';
import { safeDate } from '../utils/dateUtils';
import { exportToExcel } from '../utils/exportToExcel';
import './Sales.css';

const Sales = () => {
  const { user, checkPermission } = useAuth();
  const [sales, setSales] = useState([]);
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    productId: '',
    customerId: '',
    quantity: 1,
    price: '',
    notes: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [salesData, productsData, customersData] = await Promise.all([
        salesAPI.getAll().catch(() => []),
        productsAPI.getAll().catch(() => []),
        customersAPI.getAll().catch(() => [])
      ]);
      setSales(salesData);
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

  const handleProductChange = (e) => {
    const productId = e.target.value;
    const product = products.find(p => p.id === productId);
    setFormData(prev => ({
      ...prev,
      productId,
      price: product ? product.price : ''
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!checkPermission(PERMISSIONS.CREATE_SALES)) {
      toast.error('Permission denied');
      return;
    }

    if (user.role === ROLES.SALESMAN && !user.salesId) {
      toast.error('Sales ID not assigned. Please contact administrator.');
      return;
    }

    try {
      await salesAPI.create({
        productId: formData.productId,
        customerId: formData.customerId,
        quantity: parseInt(formData.quantity),
        price: parseFloat(formData.price),
        notes: formData.notes
      });

      toast.success('Sale recorded successfully');
      setShowModal(false);
      setFormData({
        productId: '',
        customerId: '',
        quantity: 1,
        price: '',
        notes: ''
      });
      loadData();
    } catch (error) {
      toast.error(error.message || 'Failed to record sale');
    }
  };

  if (loading) {
    return <div className="loading">Loading sales data...</div>;
  }

  const canCreate = checkPermission(PERMISSIONS.CREATE_SALES);
  const isSalesman = user?.role === ROLES.SALESMAN;

  return (
    <div className="sales-page">
      <div className="page-header">
        <h2>Sales Records</h2>
        {isSalesman && (
          <div className="sales-id-badge">
            Sales ID: <strong>{user.salesId}</strong>
          </div>
        )}
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn-secondary" onClick={() => exportToExcel(sales, 'sales_data')}>
            Export Excel
          </button>
          {canCreate && (
            <button className="btn-primary" onClick={() => setShowModal(true)}>
              + Record Sale
            </button>
          )}
        </div>
      </div>

      <div className="sales-table-container">
        <table className="sales-table">
          <thead>
            <tr>
              <th>Sale ID</th>
              <th>Sales ID</th>
              <th>Salesman</th>
              <th>Product</th>
              <th>Customer</th>
              <th>Quantity</th>
              <th>Price</th>
              <th>Total</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {sales.length === 0 ? (
              <tr>
                <td colSpan="9" className="empty-state">No sales records found</td>
              </tr>
            ) : (
              sales.map(sale => {
                const product = products.find(p => p.id === sale.productId);
                const customer = customers.find(c => c.id === sale.customerId);
                return (
                  <tr key={sale.id}>
                    <td>{sale.id}</td>
                    <td><strong>{sale.salesId}</strong></td>
                    <td>{sale.salesmanName || 'N/A'}</td>
                    <td>{product?.name || 'N/A'}</td>
                    <td>{customer?.name || 'N/A'}</td>
                    <td>{sale.quantity}</td>
                    <td>₹{sale.price?.toFixed(2) || '0.00'}</td>
                    <td><strong>₹{((sale.price || 0) * (sale.quantity || 0)).toFixed(2)}</strong></td>
                    <td>{safeDate(sale.createdAt, 'MMM dd, yyyy HH:mm')}</td>
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
              <h3>Record New Sale</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            <form onSubmit={handleSubmit} className="sales-form">
              {isSalesman && (
                <div className="info-box">
                  <strong>Sales ID:</strong> {user.salesId}
                </div>
              )}

              <div className="form-group">
                <label>Product *</label>
                <select
                  name="productId"
                  value={formData.productId}
                  onChange={handleProductChange}
                  required
                  disabled={products.length === 0}
                >
                  <option value="">
                    {products.length === 0 ? 'No products available' : 'Select a product'}
                  </option>
                  {products.map(product => (
                    <option key={product.id} value={product.id}>
                      {product.name} (Stock: {product.stock}, Price: ₹{product.price})
                    </option>
                  ))}
                </select>
                {products.length === 0 && (
                  <small style={{ color: 'var(--color-warning)', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                    Please add products first
                  </small>
                )}
              </div>

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

              <div className="form-row">
                <div className="form-group">
                  <label>Quantity *</label>
                  <input
                    type="number"
                    name="quantity"
                    min="1"
                    value={formData.quantity}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Price (₹) *</label>
                  <input
                    type="number"
                    step="0.01"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    required
                  />
                </div>
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
                  Record Sale
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sales;

