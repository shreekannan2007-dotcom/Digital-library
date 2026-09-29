import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { ArrowUpRight, BookOpen, Users, Calendar, AlertCircle } from 'lucide-react';

const BorrowBook = ({ showNotification }) => {
  const navigate = useNavigate();
  const [members, setMembers] = useState([]);
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  const getTodayStr = () => new Date().toISOString().split('T')[0];
  const getDueStr = () => {
    const d = new Date();
    d.setDate(d.getDate() + 14); // 14 days default loan period
    return d.toISOString().split('T')[0];
  };

  const [formData, setFormData] = useState({
    member: '',
    book: '',
    borrow_date: getTodayStr(),
    due_date: getDueStr(),
  });

  const [selectedBookObj, setSelectedBookObj] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [memRes, bookRes] = await Promise.all([
          api.get('/members/'),
          api.get('/books/'),
        ]);
        setMembers(memRes.data);
        setBooks(bookRes.data);
      } catch (err) {
        console.error(err);
        showNotification('error', 'Failed to load members or books.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleBookChange = (e) => {
    const bId = e.target.value;
    setFormData((prev) => ({ ...prev, book: bId }));
    const found = books.find((b) => b.id === parseInt(bId));
    setSelectedBookObj(found || null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedBookObj) {
      showNotification('warning', 'Please select a book.');
      return;
    }

    // Client-side guard: Do not allow borrowing when available quantity is 0
    if (selectedBookObj.available_quantity <= 0) {
      showNotification('error', `Cannot borrow "${selectedBookObj.title}". This book is out of stock!`);
      return;
    }

    try {
      await api.post('/borrows/borrow_book/', formData);
      showNotification('success', `Book successfully borrowed to member! Available stock updated.`);
      navigate('/records');
    } catch (err) {
      console.error(err);
      const errMsg = err.response?.data?.error || 'Failed to process borrow request.';
      showNotification('error', errMsg);
    }
  };

  return (
    <div className="page-wrapper" style={{ maxWidth: '800px' }}>
      <div className="page-header">
        <div>
          <h1 className="page-title"><ArrowUpRight size={28} color="#6366f1" /> Issue / Borrow Book</h1>
          <p className="page-subtitle">Select a member and book to issue a new library loan</p>
        </div>
      </div>

      <div className="glass-card">
        {loading ? (
          <div style={{ textAlign: 'center', padding: '2rem' }}>Loading Borrow Form...</div>
        ) : (
          <form onSubmit={handleSubmit}>
            {/* Select Member */}
            <div className="form-group">
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Users size={16} /> Select Member *
              </label>
              <select
                name="member"
                className="form-select"
                value={formData.member}
                onChange={(e) => setFormData({ ...formData, member: e.target.value })}
                required
              >
                <option value="">-- Choose Member --</option>
                {members.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} ({m.email})
                  </option>
                ))}
              </select>
            </div>

            {/* Select Book */}
            <div className="form-group">
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <BookOpen size={16} /> Select Book *
              </label>
              <select
                name="book"
                className="form-select"
                value={formData.book}
                onChange={handleBookChange}
                required
              >
                <option value="">-- Choose Book --</option>
                {books.map((b) => (
                  <option key={b.id} value={b.id} disabled={b.available_quantity <= 0}>
                    {b.title} by {b.author} [{b.available_quantity > 0 ? `Stock: ${b.available_quantity}` : 'OUT OF STOCK'}]
                  </option>
                ))}
              </select>
            </div>

            {/* Book Availability Notice */}
            {selectedBookObj && (
              <div
                style={{
                  padding: '0.875rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  marginBottom: '1.25rem',
                  background: selectedBookObj.available_quantity > 0 ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)',
                  border: `1px solid ${selectedBookObj.available_quantity > 0 ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem'
                }}
              >
                <AlertCircle size={20} color={selectedBookObj.available_quantity > 0 ? '#10b981' : '#ef4444'} />
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>
                    {selectedBookObj.title}
                  </div>
                  <div style={{ fontSize: '0.8rem', opacity: 0.8 }}>
                    Total Quantity: {selectedBookObj.total_quantity} | Available Quantity: {selectedBookObj.available_quantity}
                  </div>
                </div>
              </div>
            )}

            {/* Dates */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Calendar size={16} /> Borrow Date *
                </label>
                <input
                  type="date"
                  name="borrow_date"
                  className="form-control"
                  value={formData.borrow_date}
                  onChange={(e) => setFormData({ ...formData, borrow_date: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Calendar size={16} /> Due Date *
                </label>
                <input
                  type="date"
                  name="due_date"
                  className="form-control"
                  value={formData.due_date}
                  onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                  required
                />
              </div>
            </div>

            <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button type="button" onClick={() => navigate('/records')} className="btn btn-secondary">
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={!selectedBookObj || selectedBookObj.available_quantity <= 0}
              >
                Confirm & Issue Book
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default BorrowBook;
