import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import Modal from '../components/Modal';
import { Bookmark, Plus, Search, Edit2, Trash2 } from 'lucide-react';

const Categories = ({ showNotification }) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedCat, setSelectedCat] = useState(null);

  const initialForm = { name: '', description: '' };
  const [formData, setFormData] = useState(initialForm);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      let url = '/categories/?';
      if (searchTerm) url += `search=${encodeURIComponent(searchTerm)}`;
      const res = await api.get(url);
      setCategories(res.data);
    } catch (err) {
      console.error(err);
      showNotification('error', 'Failed to load categories.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, [searchTerm]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/categories/', formData);
      showNotification('success', 'Category created successfully!');
      setIsAddModalOpen(false);
      setFormData(initialForm);
      fetchCategories();
    } catch (err) {
      console.error(err);
      const errMsg = err.response?.data?.name?.[0] || 'Failed to create category.';
      showNotification('error', errMsg);
    }
  };

  const handleEditOpen = (cat) => {
    setSelectedCat(cat);
    setFormData({ name: cat.name, description: cat.description || '' });
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/categories/${selectedCat.id}/`, formData);
      showNotification('success', 'Category updated successfully!');
      setIsEditModalOpen(false);
      setSelectedCat(null);
      fetchCategories();
    } catch (err) {
      console.error(err);
      showNotification('error', 'Failed to update category.');
    }
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete category "${name}"?`)) {
      try {
        await api.delete(`/categories/${id}/`);
        showNotification('success', 'Category deleted.');
        fetchCategories();
      } catch (err) {
        console.error(err);
        showNotification('error', 'Cannot delete category that contains books.');
      }
    }
  };

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <div>
          <h1 className="page-title"><Bookmark size={28} color="#6366f1" /> Category Management</h1>
          <p className="page-subtitle">Organize books into genres and subject areas</p>
        </div>
        <button onClick={() => { setFormData(initialForm); setIsAddModalOpen(true); }} className="btn btn-primary">
          <Plus size={18} /> Add Category
        </button>
      </div>

      <div className="glass-card" style={{ marginBottom: '1.5rem', padding: '1rem' }}>
        <div className="search-box">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            className="form-control"
            placeholder="Search categories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="glass-card">
        {loading ? (
          <div style={{ textAlign: 'center', padding: '2rem' }}>Loading Categories...</div>
        ) : categories.length === 0 ? (
          <div className="empty-state">No categories found.</div>
        ) : (
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Category Name</th>
                  <th>Description</th>
                  <th>Books Count</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((cat) => (
                  <tr key={cat.id}>
                    <td style={{ fontWeight: 600, color: '#f8fafc' }}>{cat.name}</td>
                    <td style={{ color: '#94a3b8', fontSize: '0.875rem' }}>{cat.description || '—'}</td>
                    <td>
                      <span className="badge badge-secondary">{cat.book_count} books</span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button onClick={() => handleEditOpen(cat)} className="btn btn-secondary btn-sm" title="Edit">
                          <Edit2 size={14} />
                        </button>
                        <button onClick={() => handleDelete(cat.id, cat.name)} className="btn btn-danger btn-sm" title="Delete">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      <Modal
        isOpen={isAddModalOpen || isEditModalOpen}
        onClose={() => { setIsAddModalOpen(false); setIsEditModalOpen(false); }}
        title={isAddModalOpen ? "Add Category" : "Edit Category"}
      >
        <form onSubmit={isAddModalOpen ? handleAddSubmit : handleEditSubmit}>
          <div className="form-group">
            <label className="form-label">Category Name *</label>
            <input type="text" name="name" className="form-control" value={formData.name} onChange={handleInputChange} required />
          </div>

          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea name="description" className="form-control" value={formData.description} onChange={handleInputChange} placeholder="Category description..." />
          </div>

          <div className="modal-footer" style={{ paddingLeft: 0, paddingRight: 0, paddingBottom: 0 }}>
            <button type="button" onClick={() => { setIsAddModalOpen(false); setIsEditModalOpen(false); }} className="btn btn-secondary">Cancel</button>
            <button type="submit" className="btn btn-primary">{isAddModalOpen ? "Save" : "Update"}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Categories;
