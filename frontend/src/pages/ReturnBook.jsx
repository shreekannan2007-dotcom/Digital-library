import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import Modal from '../components/Modal';
import { ArrowDownLeft, Search, CheckCircle, Calendar } from 'lucide-react';

const ReturnBook = ({ showNotification }) => {
  const [activeRecords, setActiveRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const [selectedRecord, setSelectedRecord] = useState(null);
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
  const [returnDate, setReturnDate] = useState(new Date().toISOString().split('T')[0]);

  const fetchActiveBorrows = async () => {
    try {
      setLoading(true);
      const res = await api.get('/borrows/');
      // Filter for active loans (Borrowed or Overdue)
      const filtered = res.data.filter((r) => r.status === 'Borrowed' || r.status === 'Overdue');
      setActiveRecords(filtered);
    } catch (err) {
      console.error(err);
      showNotification('error', 'Failed to fetch active borrow records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActiveBorrows();
  }, []);

  const filteredRecords = activeRecords.filter((r) => {
    const term = searchTerm.toLowerCase();
    return (
      r.member_name.toLowerCase().includes(term) ||
      r.member_email.toLowerCase().includes(term) ||
      r.book_title.toLowerCase().includes(term) ||
      r.book_isbn.toLowerCase().includes(term)
    );
  });

  const handleReturnClick = (record) => {
    // Guard check against returning twice
    if (record.status === 'Returned') {
      showNotification('error', 'This book has already been marked as returned!');
      return;
    }
    setSelectedRecord(record);
    setIsReturnModalOpen(true);
  };

  const handleConfirmReturn = async (e) => {
    e.preventDefault();
    if (!selectedRecord) return;

    try {
      await api.post(`/borrows/${selectedRecord.id}/return_book/`, {
        return_date: returnDate,
      });
      showNotification('success', `Book "${selectedRecord.book_title}" returned successfully! Stock restored.`);
      setIsReturnModalOpen(false);
      setSelectedRecord(null);
      fetchActiveBorrows();
    } catch (err) {
      console.error(err);
      const errMsg = err.response?.data?.error || 'Failed to process book return.';
      showNotification('error', errMsg);
    }
  };

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <div>
          <h1 className="page-title"><ArrowDownLeft size={28} color="#6366f1" /> Return Book</h1>
          <p className="page-subtitle">Process incoming returns and restore book quantities</p>
        </div>
      </div>

      <div className="glass-card" style={{ marginBottom: '1.5rem', padding: '1rem' }}>
        <div className="search-box">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            className="form-control"
            placeholder="Search active loans by Member name, Email, Book title or ISBN..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="glass-card">
        {loading ? (
          <div style={{ textAlign: 'center', padding: '2rem' }}>Loading active loans...</div>
        ) : filteredRecords.length === 0 ? (
          <div className="empty-state">No active borrowed books to return.</div>
        ) : (
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Borrow ID</th>
                  <th>Member</th>
                  <th>Book Title</th>
                  <th>Borrow Date</th>
                  <th>Due Date</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredRecords.map((record) => (
                  <tr key={record.id}>
                    <td style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>BRW-{record.id}</td>
                    <td>
                      <div style={{ fontWeight: 600, color: '#f8fafc' }}>{record.member_name}</div>
                      <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{record.member_email}</div>
                    </td>
                    <td style={{ fontWeight: 500 }}>{record.book_title}</td>
                    <td>{record.borrow_date}</td>
                    <td>{record.due_date}</td>
                    <td>
                      <span className={`badge badge-${record.status === 'Overdue' ? 'danger' : 'warning'}`}>
                        {record.status}
                      </span>
                    </td>
                    <td>
                      <button
                        onClick={() => handleReturnClick(record)}
                        className="btn btn-success btn-sm"
                        style={{ gap: '0.35rem' }}
                      >
                        <CheckCircle size={14} /> Process Return
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Return Modal */}
      <Modal
        isOpen={isReturnModalOpen}
        onClose={() => setIsReturnModalOpen(false)}
        title="Confirm Return"
      >
        {selectedRecord && (
          <form onSubmit={handleConfirmReturn}>
            <p style={{ marginBottom: '1rem', color: '#cbd5e1' }}>
              Are you sure you want to mark this book as returned?
            </p>

            <div style={{ background: 'rgba(15,23,42,0.6)', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.25rem', fontSize: '0.875rem' }}>
              <div><strong>Book:</strong> {selectedRecord.book_title}</div>
              <div><strong>Borrower:</strong> {selectedRecord.member_name}</div>
              <div><strong>Due Date:</strong> {selectedRecord.due_date}</div>
            </div>

            <div className="form-group">
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Calendar size={16} /> Select Return Date *
              </label>
              <input
                type="date"
                className="form-control"
                value={returnDate}
                onChange={(e) => setReturnDate(e.target.value)}
                required
              />
            </div>

            <div className="modal-footer" style={{ paddingLeft: 0, paddingRight: 0, paddingBottom: 0 }}>
              <button type="button" onClick={() => setIsReturnModalOpen(false)} className="btn btn-secondary">
                Cancel
              </button>
              <button type="submit" className="btn btn-success">
                Complete Return
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};

export default ReturnBook;
