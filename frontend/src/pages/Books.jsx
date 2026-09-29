import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import Modal from '../components/Modal';
import { BookOpen, Plus, Search, Edit2, Trash2, Eye } from 'lucide-react';

const Books = ({ showNotification }) => {
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);

  // Form State
  const initialForm = {
    title: '',
    author: '',
    category: '',
    isbn: '',
    publisher: '',
    publication_year: new Date().getFullYear(),
    description: '',
    total_quantity: 1,
    available_quantity: 1,
  };
  const [formData, setFormData] = useState(initialForm);

  const fetchBooks = async () => {
    try {
      setLoading(true);
      let url = '/books/?';
      if (searchTerm) url += `search=${encodeURIComponent(searchTerm)}&`;
      if (selectedCategory) url += `category=${selectedCategory}&`;
      const res = await api.get(url);
      setBooks(res.data);
    } catch (err) {
      console.error(err);
      showNotification('error', 'Failed to fetch books.');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await api.get('/categories/');
      setCategories(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchBooks();
  }, [searchTerm, selectedCategory]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const updated = { ...prev, [name]: value };
      // Keep available_quantity in sync with total_quantity when creating new book
      if (name === 'total_quantity' && !selectedBook) {
        updated.available_quantity = value;
      }
      return updated;
    });
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/books/', formData);
      showNotification('success', 'Book added successfully!');
      setIsAddModalOpen(false);
      setFormData(initialForm);
      fetchBooks();
    } catch (err) {
      console.error(err);
      const errMsg = err.response?.data?.isbn?.[0] || err.response?.data?.available_quantity?.[0] || 'Failed to add book. Please check fields.';
      showNotification('error', errMsg);
    }
  };

  const handleEditOpen = (book) => {
    setSelectedBook(book);
    setFormData({
      title: book.title,
      author: book.author,
      category: book.category || '',
      isbn: book.isbn,
      publisher: book.publisher,
      publication_year: book.publication_year,
      description: book.description || '',
      total_quantity: book.total_quantity,
      available_quantity: book.available_quantity,
    });
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/books/${selectedBook.id}/`, formData);
      showNotification('success', 'Book updated successfully!');
      setIsEditModalOpen(false);
      setSelectedBook(null);
      fetchBooks();
    } catch (err) {
      console.error(err);
      const errMsg = err.response?.data?.available_quantity?.[0] || 'Failed to update book.';
      showNotification('error', errMsg);
    }
  };

  const handleDelete = async (id, title) => {
    if (window.confirm(`Are you sure you want to delete "${title}"?`)) {
      try {
        await api.delete(`/books/${id}/`);
        showNotification('success', 'Book deleted successfully.');
        fetchBooks();
      } catch (err) {
        console.error(err);
        showNotification('error', 'Cannot delete book with active borrowing records.');
      }
    }
  };

  const handleViewDetail = (book) => {
    setSelectedBook(book);
    setIsDetailModalOpen(true);
  };

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <div>
          <h1 className="page-title"><BookOpen size={28} color="#6366f1" /> Book Management</h1>
          <p className="page-subtitle">View, add, edit, search and delete library books</p>
        </div>
        <button onClick={() => { setFormData(initialForm); setIsAddModalOpen(true); }} className="btn btn-primary">
          <Plus size={18} /> Add New Book
        </button>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="glass-card" style={{ marginBottom: '1.5rem', padding: '1rem' }}>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <div className="search-box" style={{ flex: 1 }}>
            <Search size={18} className="search-icon" />
            <input
              type="text"
              className="form-control"
              placeholder="Search by Title, Author, ISBN, or Publisher..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div style={{ minWidth: '200px' }}>
            <select
              className="form-select"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Books Table */}
      <div className="glass-card">
        {loading ? (
          <div style={{ textAlign: 'center', padding: '2rem' }}>Loading Books...</div>
        ) : books.length === 0 ? (
          <div className="empty-state">No books found matching your criteria.</div>
        ) : (
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Book Details</th>
                  <th>Category</th>
                  <th>ISBN</th>
                  <th>Total Qty</th>
                  <th>Available</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {books.map((book) => (
                  <tr key={book.id}>
                    <td>
                      <div style={{ fontWeight: 600, color: '#f8fafc' }}>{book.title}</div>
                      <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>By {book.author} ({book.publication_year})</div>
                    </td>
                    <td>
                      <span className="badge badge-secondary">{book.category_name}</span>
                    </td>
                    <td style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>{book.isbn}</td>
                    <td>{book.total_quantity}</td>
                    <td>
                      <span className={`badge badge-${book.available_quantity > 0 ? 'success' : 'danger'}`}>
                        {book.available_quantity} Available
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button onClick={() => handleViewDetail(book)} className="btn btn-secondary btn-sm" title="View Details">
                          <Eye size={14} />
                        </button>
                        <button onClick={() => handleEditOpen(book)} className="btn btn-secondary btn-sm" title="Edit">
                          <Edit2 size={14} />
                        </button>
                        <button onClick={() => handleDelete(book.id, book.title)} className="btn btn-danger btn-sm" title="Delete">
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

      {/* Add / Edit Form Modal */}
      <Modal
        isOpen={isAddModalOpen || isEditModalOpen}
        onClose={() => { setIsAddModalOpen(false); setIsEditModalOpen(false); }}
        title={isAddModalOpen ? "Add New Book" : "Edit Book"}
      >
        <form onSubmit={isAddModalOpen ? handleAddSubmit : handleEditSubmit}>
          <div className="form-group">
            <label className="form-label">Book Title *</label>
            <input type="text" name="title" className="form-control" value={formData.title} onChange={handleInputChange} required />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Author *</label>
              <input type="text" name="author" className="form-control" value={formData.author} onChange={handleInputChange} required />
            </div>

            <div className="form-group">
              <label className="form-label">Category *</label>
              <select name="category" className="form-select" value={formData.category} onChange={handleInputChange} required>
                <option value="">Select Category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">ISBN *</label>
              <input type="text" name="isbn" className="form-control" value={formData.isbn} onChange={handleInputChange} required />
            </div>

            <div className="form-group">
              <label className="form-label">Publisher *</label>
              <input type="text" name="publisher" className="form-control" value={formData.publisher} onChange={handleInputChange} required />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Publication Year</label>
              <input type="number" name="publication_year" className="form-control" value={formData.publication_year} onChange={handleInputChange} required />
            </div>

            <div className="form-group">
              <label className="form-label">Total Quantity</label>
              <input type="number" min="1" name="total_quantity" className="form-control" value={formData.total_quantity} onChange={handleInputChange} required />
            </div>

            <div className="form-group">
              <label className="form-label">Available Qty</label>
              <input type="number" min="0" name="available_quantity" className="form-control" value={formData.available_quantity} onChange={handleInputChange} required />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea name="description" className="form-control" value={formData.description} onChange={handleInputChange} placeholder="Optional summary or notes..." />
          </div>

          <div className="modal-footer" style={{ paddingLeft: 0, paddingRight: 0, paddingBottom: 0 }}>
            <button type="button" onClick={() => { setIsAddModalOpen(false); setIsEditModalOpen(false); }} className="btn btn-secondary">Cancel</button>
            <button type="submit" className="btn btn-primary">{isAddModalOpen ? "Save Book" : "Update Book"}</button>
          </div>
        </form>
      </Modal>

      {/* Book Detail Modal */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title="Book Information"
      >
        {selectedBook && (
          <div>
            <h2 style={{ fontSize: '1.25rem', color: '#f8fafc', marginBottom: '0.25rem' }}>{selectedBook.title}</h2>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '1rem' }}>By {selectedBook.author}</p>
            
            <div style={{ background: 'rgba(15,23,42,0.5)', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', fontSize: '0.875rem' }}>
                <div><strong>Category:</strong> {selectedBook.category_name}</div>
                <div><strong>ISBN:</strong> {selectedBook.isbn}</div>
                <div><strong>Publisher:</strong> {selectedBook.publisher}</div>
                <div><strong>Year:</strong> {selectedBook.publication_year}</div>
                <div><strong>Total Stock:</strong> {selectedBook.total_quantity}</div>
                <div><strong>Available:</strong> {selectedBook.available_quantity}</div>
              </div>
            </div>

            <div style={{ fontSize: '0.875rem', color: '#cbd5e1' }}>
              <strong>Description:</strong>
              <p style={{ marginTop: '0.35rem', color: '#94a3b8' }}>{selectedBook.description || 'No description provided.'}</p>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Books;
