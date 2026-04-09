import React, { useState, useEffect } from 'react';
import { suppliersAPI } from '../services/api-rbac';
import { useAuth } from '../contexts/AuthContext';
import { PERMISSIONS } from '../services/rbac';
import { toast } from 'react-toastify';
import { exportToExcel } from '../utils/exportToExcel';
import './Suppliers.css';

const Suppliers = () => {
  const { checkPermission } = useAuth();
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    contactPerson: ''
  });

  useEffect(() => {
    loadSuppliers();
  }, []);

  const loadSuppliers = async () => {
    try {
      const data = await suppliersAPI.getAll();
      setSuppliers(data);
    } catch (error) {
      toast.error('Failed to load suppliers');
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
    
    if (editingSupplier && !checkPermission(PERMISSIONS.EDIT_SUPPLIERS)) {
      toast.error('Permission denied');
      return;
    }
    
    if (!editingSupplier && !checkPermission(PERMISSIONS.CREATE_SUPPLIERS)) {
      toast.error('Permission denied');
      return;
    }
    
    try {
      if (editingSupplier) {
        await suppliersAPI.update(editingSupplier.id, formData);
        toast.success('Supplier updated successfully');
      } else {
        await suppliersAPI.create(formData);
        toast.success('Supplier created successfully');
      }

      setShowModal(false);
      setEditingSupplier(null);
      setFormData({
        name: '',
        email: '',
        phone: '',
        address: '',
        contactPerson: ''
      });
      loadSuppliers();
    } catch (error) {
      toast.error(error.message || 'Failed to save supplier');
    }
  };

  const handleEdit = (supplier) => {
    setEditingSupplier(supplier);
    setFormData({
      name: supplier.name,
      email: supplier.email,
      phone: supplier.phone,
      address: supplier.address,
      contactPerson: supplier.contactPerson || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!checkPermission(PERMISSIONS.DELETE_SUPPLIERS)) {
      toast.error('Permission denied');
      return;
    }
    
    if (window.confirm('Are you sure you want to delete this supplier?')) {
      try {
        await suppliersAPI.delete(id);
        toast.success('Supplier deleted successfully');
        loadSuppliers();
      } catch (error) {
        toast.error(error.message || 'Failed to delete supplier');
      }
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingSupplier(null);
    setFormData({
      name: '',
      email: '',
      phone: '',
      address: '',
      contactPerson: ''
    });
  };

  if (loading) {
    return <div className="loading">Loading suppliers...</div>;
  }

  return (
    <div className="suppliers-page">
      <div className="page-header">
        <h2>Supplier Management</h2>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn-secondary" onClick={() => exportToExcel(suppliers, 'suppliers_data')}>
            Export Excel
          </button>
          {checkPermission(PERMISSIONS.CREATE_SUPPLIERS) && (
            <button className="btn-primary" onClick={() => setShowModal(true)}>
              + Add Supplier
            </button>
          )}
        </div>
      </div>

      <div className="suppliers-table-container">
        <table className="suppliers-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Contact Person</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Address</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {suppliers.length === 0 ? (
              <tr>
                <td colSpan="6" className="empty-state">No suppliers found</td>
              </tr>
            ) : (
              suppliers.map(supplier => (
                <tr key={supplier.id}>
                  <td>{supplier.name}</td>
                  <td>{supplier.contactPerson || 'N/A'}</td>
                  <td>{supplier.email}</td>
                  <td>{supplier.phone}</td>
                  <td>{supplier.address}</td>
                  <td>
                    <div className="action-buttons">
                      {checkPermission(PERMISSIONS.EDIT_SUPPLIERS) && (
                        <button className="btn-edit" onClick={() => handleEdit(supplier)}>Edit</button>
                      )}
                      {checkPermission(PERMISSIONS.DELETE_SUPPLIERS) && (
                        <button className="btn-delete" onClick={() => handleDelete(supplier.id)}>Delete</button>
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
              <h3>{editingSupplier ? 'Edit Supplier' : 'Add New Supplier'}</h3>
              <button className="modal-close" onClick={handleCloseModal}>×</button>
            </div>
            <form onSubmit={handleSubmit} className="supplier-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Supplier Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Contact Person</label>
                  <input
                    type="text"
                    name="contactPerson"
                    value={formData.contactPerson}
                    onChange={handleInputChange}
                  />
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

              <div className="form-actions">
                <button type="button" className="btn-secondary" onClick={handleCloseModal}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  {editingSupplier ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Suppliers;


