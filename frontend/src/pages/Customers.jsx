import React, { useState, useEffect } from 'react';
import { customersAPI } from '../services/api-rbac';
import { useAuth } from '../contexts/AuthContext';
import { PERMISSIONS } from '../services/rbac';
import { toast } from 'react-toastify';
import { exportToExcel } from '../utils/exportToExcel';
import './Customers.css';

const Customers = () => {
  const { checkPermission } = useAuth();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    type: 'wholesale',
    creditLimit: ''
  });

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    try {
      const data = await customersAPI.getAll();
      setCustomers(data);
    } catch (error) {
      toast.error('Failed to load customers');
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
    
    if (editingCustomer && !checkPermission(PERMISSIONS.EDIT_CUSTOMERS)) {
      toast.error('Permission denied');
      return;
    }
    
    if (!editingCustomer && !checkPermission(PERMISSIONS.CREATE_CUSTOMERS)) {
      toast.error('Permission denied');
      return;
    }
    
    try {
      const customerData = {
        ...formData,
        creditLimit: parseFloat(formData.creditLimit) || 0
      };

      if (editingCustomer) {
        await customersAPI.update(editingCustomer.id, customerData);
        toast.success('Customer updated successfully');
      } else {
        await customersAPI.create(customerData);
        toast.success('Customer created successfully');
      }

      setShowModal(false);
      setEditingCustomer(null);
      setFormData({
        name: '',
        email: '',
        phone: '',
        address: '',
        type: 'wholesale',
        creditLimit: ''
      });
      loadCustomers();
    } catch (error) {
      toast.error(error.message || 'Failed to save customer');
    }
  };

  const handleEdit = (customer) => {
    setEditingCustomer(customer);
    setFormData({
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      address: customer.address,
      type: customer.type,
      creditLimit: customer.creditLimit
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!checkPermission(PERMISSIONS.DELETE_CUSTOMERS)) {
      toast.error('Permission denied');
      return;
    }
    
    if (window.confirm('Are you sure you want to delete this customer?')) {
      try {
        await customersAPI.delete(id);
        toast.success('Customer deleted successfully');
        loadCustomers();
      } catch (error) {
        toast.error(error.message || 'Failed to delete customer');
      }
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingCustomer(null);
    setFormData({
      name: '',
      email: '',
      phone: '',
      address: '',
      type: 'wholesale',
      creditLimit: ''
    });
  };

  if (loading) {
    return <div className="loading">Loading customers...</div>;
  }

  return (
    <div className="customers-page">
      <div className="page-header">
        <h2>Customer Management</h2>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn-secondary" onClick={() => exportToExcel(customers, 'customers_data')}>
            Export Excel
          </button>
          {checkPermission(PERMISSIONS.CREATE_CUSTOMERS) && (
            <button className="btn-primary" onClick={() => setShowModal(true)}>
              + Add Customer
            </button>
          )}
        </div>
      </div>

      <div className="customers-table-container">
        <table className="customers-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Type</th>
              <th>Credit Limit</th>
              <th>Address</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {customers.length === 0 ? (
              <tr>
                <td colSpan="7" className="empty-state">No customers found</td>
              </tr>
            ) : (
              customers.map(customer => (
                <tr key={customer.id}>
                  <td>{customer.name}</td>
                  <td>{customer.email}</td>
                  <td>{customer.phone}</td>
                  <td>
                    <span className={`type-badge type-${customer.type}`}>
                      {customer.type}
                    </span>
                  </td>
                  <td>₹{customer.creditLimit?.toLocaleString() || '0'}</td>
                  <td>{customer.address}</td>
                  <td>
                    <div className="action-buttons">
                      {checkPermission(PERMISSIONS.EDIT_CUSTOMERS) && (
                        <button className="btn-edit" onClick={() => handleEdit(customer)}>Edit</button>
                      )}
                      {checkPermission(PERMISSIONS.DELETE_CUSTOMERS) && (
                        <button className="btn-delete" onClick={() => handleDelete(customer.id)}>Delete</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingCustomer ? 'Edit Customer' : 'Add New Customer'}</h3>
              <button className="modal-close" onClick={handleCloseModal}>×</button>
            </div>
            <form onSubmit={handleSubmit} className="customer-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Type *</label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="wholesale">Wholesale</option>
                    <option value="retail">Retail</option>
                    <option value="corporate">Corporate</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Email *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Phone *</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Address *</label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  rows="3"
                  required
                />
              </div>

              <div className="form-group">
                <label>Credit Limit (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  name="creditLimit"
                  value={formData.creditLimit}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-actions">
                <button type="button" className="btn-secondary" onClick={handleCloseModal}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  {editingCustomer ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Customers;


