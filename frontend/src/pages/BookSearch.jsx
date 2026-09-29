import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { Search, Filter, BookOpen, ArrowUpRight, CheckCircle, XCircle } from 'lucide-react';

const BookSearch = ({ showNotification }) => {
  const navigate = useNavigate();
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [query, setQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [availabilityFilter, setAvailabilityFilter] = useState('');

  const fetchCategories = async () => {
    try {
      const res = await api.get('/categories/');
      setCategories(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const executeSearch = async () => {
    try {
      setLoading(true);
      let url = '/books/?';
      if (query) url += `search=${encodeURIComponent(query)}&`;
      if (categoryFilter) url += `category=${categoryFilter}&`;
      if (availabilityFilter) url += `available=${availabilityFilter}&`;

      const res = await api.get(url);
      setBooks(res.data);
    } catch (err) {
      console.error(err);
      showNotification('error', 'Search request failed.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    executeSearch();
  }, [query, categoryFilter, availabilityFilter]);

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <div>
          <h1 className="page-title"><Search size={28} color="#6366f1" /> Advanced Book Search</h1>
          <p className="page-subtitle">Instantly search catalog by title, author, ISBN, category and live stock status</p>
        </div>
      </div>

      {/* Search Filters Bar */}
      <div className="glass-card" style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '1rem' }}>
          <div className="search-box">
            <Search size={18} className="search-icon" />
            <input
              type="text"
              className="form-control"
              placeholder="Search by Title, Author, ISBN, Publisher..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>

          <div>
            <select
              className="form-select"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div>
            <select
              className="form-select"
              value={availabilityFilter}
              onChange={(e) => setAvailabilityFilter(e.target.value)}
            >
              <option value="">All Stock Statuses</option>
              <option value="true">In Stock Only</option>
              <option value="false">Out of Stock Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results Section */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem' }}>Searching library catalog...</div>
      ) : books.length === 0 ? (
        <div className="glass-card empty-state">
          <BookOpen size={48} />
          <h3>No books match your criteria</h3>
          <p style={{ marginTop: '0.5rem', color: '#94a3b8' }}>Try adjusting your keywords or clearing selected filters.</p>
        </div>
      ) : (
        <div className="cards-grid">
          {books.map((book) => (
            <div key={book.id} className="glass-card book-card">
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                  <span className="badge badge-secondary">{book.category_name}</span>
                  <span className={`badge badge-${book.available_quantity > 0 ? 'success' : 'danger'}`}>
                    {book.available_quantity > 0 ? (
                      <><CheckCircle size={12} /> {book.available_quantity} In Stock</>
                    ) : (
                      <><XCircle size={12} /> Out of Stock</>
                    )}
                  </span>
                </div>

                <h3 className="book-card-title">{book.title}</h3>
                <div className="book-card-author">by {book.author} ({book.publication_year})</div>

                <div style={{ marginBottom: '1rem' }}>
                  <span className="book-meta-tag">ISBN: {book.isbn}</span>
                  <span className="book-meta-tag">{book.publisher}</span>
                </div>

                <p style={{ fontSize: '0.85rem', color: '#94a3b8', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {book.description || 'No description available for this book.'}
                </p>
              </div>

              <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                  Total Copies: <strong>{book.total_quantity}</strong>
                </div>
                <button
                  onClick={() => navigate('/borrow')}
                  className="btn btn-primary btn-sm"
                  disabled={book.available_quantity <= 0}
                >
                  <ArrowUpRight size={14} /> Borrow
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BookSearch;
