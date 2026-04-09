import React, { useState, useEffect } from 'react';
import { productsAPI } from '../services/api-rbac';
import { useAuth } from '../contexts/AuthContext';
import { PERMISSIONS } from '../services/rbac';
import { toast } from 'react-toastify';
import { exportToExcel } from '../utils/exportToExcel';
import './Products.css';

const Products = () => {
  const { checkPermission } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    category: '',
    price: '',
    cost: '',
    stock: '',
    minStock: '',
    unit: 'pcs',
    batch: '',
    expiryDate: '',
    description: ''
  });

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const data = await productsAPI.getAll();
      setProducts(data);
    } catch (error) {
      toast.error('Failed to load products');
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
    
    if (editingProduct && !checkPermission(PERMISSIONS.EDIT_PRODUCTS)) {
      toast.error('Permission denied');
      return;
    }
    
    if (!editingProduct && !checkPermission(PERMISSIONS.CREATE_PRODUCTS)) {
      toast.error('Permission denied');
      return;
    }
    
    try {
      const productData = {
        ...formData,
        price: parseFloat(formData.price),
        cost: parseFloat(formData.cost),
        stock: parseInt(formData.stock),
        minStock: parseInt(formData.minStock)
      };

      if (editingProduct) {
        await productsAPI.update(editingProduct.id, productData);
        toast.success('Product updated successfully');
      } else {
        await productsAPI.create(productData);
        toast.success('Product created successfully');
      }

      setShowModal(false);
      setEditingProduct(null);
      setFormData({
        name: '',
        sku: '',
        category: '',
        price: '',
        cost: '',
        stock: '',
        minStock: '',
        unit: 'pcs',
        batch: '',
        expiryDate: '',
        description: ''
      });
      loadProducts();
    } catch (error) {
      toast.error(error.message || 'Failed to save product');
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      sku: product.sku,
      category: product.category,
      price: product.price,
      cost: product.cost,
      stock: product.stock,
      minStock: product.minStock,
      unit: product.unit,
      batch: product.batch || '',
      expiryDate: product.expiryDate || '',
      description: product.description || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!checkPermission(PERMISSIONS.DELETE_PRODUCTS)) {
      toast.error('Permission denied');
      return;
    }
    
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await productsAPI.delete(id);
        toast.success('Product deleted successfully');
        loadProducts();
      } catch (error) {
        toast.error(error.message || 'Failed to delete product');
      }
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingProduct(null);
    setFormData({
      name: '',
      sku: '',
      category: '',
      price: '',
      cost: '',
      stock: '',
      minStock: '',
      unit: 'pcs',
      batch: '',
      expiryDate: '',
      description: ''
    });
  };

  if (loading) {
    return <div className="loading">Loading products...</div>;
  }

  return (
    <div className="products-page">
      <div className="page-header">
        <h2>Product Management</h2>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn-secondary" onClick={() => exportToExcel(products, 'products_data')}>
            Export Excel
          </button>
          {checkPermission(PERMISSIONS.CREATE_PRODUCTS) && (
            <button className="btn-primary" onClick={() => setShowModal(true)}>
              + Add Product
            </button>
          )}
        </div>
      </div>

      <div className="products-table-container">
        <table className="products-table">
          <thead>
            <tr>
              <th>SKU</th>
              <th>Name</th>
              <th>Category</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Min Stock</th>
              <th>Batch</th>
              <th>Expiry</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.length === 0 ? (
              <tr>
                <td colSpan="10" className="empty-state">No products found</td>
              </tr>
            ) : (
              products.map(product => (
                <tr key={product.id}>
                  <td>{product.sku}</td>
                  <td>{product.name}</td>
                  <td>{product.category}</td>
                  <td>₹{(parseFloat(product.price) || 0).toFixed(2)}</td>
                  <td>
                    <span className={product.stock <= product.minStock ? 'low-stock' : ''}>
                      {product.stock} {product.unit}
                    </span>
                  </td>
                  <td>{product.minStock} {product.unit}</td>
                  <td>{product.batch || 'N/A'}</td>
                  <td>{product.expiryDate ? new Date(product.expiryDate).toLocaleDateString() : 'N/A'}</td>
                  <td>
                    <span className={`status-badge ${product.stock <= product.minStock ? 'warning' : 'success'}`}>
                      {product.stock <= product.minStock ? 'Low Stock' : 'In Stock'}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      {checkPermission(PERMISSIONS.EDIT_PRODUCTS) && (
                        <button className="btn-edit" onClick={() => handleEdit(product)}>Edit</button>
                      )}
                      {checkPermission(PERMISSIONS.DELETE_PRODUCTS) && (
                        <button className="btn-delete" onClick={() => handleDelete(product.id)}>Delete</button>
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
              <h3>{editingProduct ? 'Edit Product' : 'Add New Product'}</h3>
              <button className="modal-close" onClick={handleCloseModal}>×</button>
            </div>
            <form onSubmit={handleSubmit} className="product-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Product Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>SKU *</label>
                  <input
                    type="text"
                    name="sku"
                    value={formData.sku}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Category *</label>
                  <input
                    type="text"
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Unit *</label>
                  <select
                    name="unit"
                    value={formData.unit}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="pcs">Pieces</option>
                    <option value="kg">Kilograms</option>
                    <option value="l">Liters</option>
                    <option value="box">Box</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
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
                <div className="form-group">
                  <label>Cost (₹) *</label>
                  <input
                    type="number"
                    step="0.01"
                    name="cost"
                    value={formData.cost}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Stock *</label>
                  <input
                    type="number"
                    name="stock"
                    value={formData.stock}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Min Stock *</label>
                  <input
                    type="number"
                    name="minStock"
                    value={formData.minStock}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Batch Number</label>
                  <input
                    type="text"
                    name="batch"
                    value={formData.batch}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-group">
                  <label>Expiry Date</label>
                  <input
                    type="date"
                    name="expiryDate"
                    value={formData.expiryDate}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="3"
                />
              </div>

              <div className="form-actions">
                <button type="button" className="btn-secondary" onClick={handleCloseModal}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  {editingProduct ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;


