import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import Modal from '../components/Modal';
import { FileText, Search, Filter, Eye } from 'lucide-react';

const BorrowRecords = ({ showNotification }) => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  const [selectedRecord, setSelectedRecord] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const fetchRecords = async () => {
    try {
      setLoading(true);
      let url = '/borrows/?';
      if (searchTerm) url += `search=${encodeURIComponent(searchTerm)}&`;
      if (selectedStatus) url += `status=${selectedStatus}&`;
      const res = await api.get(url);
      setRecords(res.data);
    } catch (err) {
      console.error(err);
      showNotification('error', 'Failed to fetch borrow records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, [searchTerm, selectedStatus]);

  const handleViewDetail = (rec) => {
    setSelectedRecord(rec);
    setIsDetailModalOpen(true);
  };

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <div>
          <h1 className="page-title"><FileText size={28} color="#6366f1" /> Borrow Records & History</h1>
          <p className="page-subtitle">Track all current and historical book loan transactions</p>
        </div>
      </div>

      <div className="glass-card" style={{ marginBottom: '1.5rem', padding: '1rem' }}>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <div className="search-box" style={{ flex: 1 }}>
            <Search size={18} className="search-icon" />
            <input
              type="text"
              className="form-control"
              placeholder="Search by Member name, Email, Book title or ISBN..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div style={{ minWidth: '180px' }}>
            <select
              className="form-select"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="Borrowed">Borrowed (Active)</option>
              <option value="Returned">Returned</option>
              <option value="Overdue">Overdue</option>
            </select>
          </div>
        </div>
      </div>

      <div className="glass-card">
        {loading ? (
          <div style={{ textAlign: 'center', padding: '2rem' }}>Loading Borrow Records...</div>
        ) : records.length === 0 ? (
          <div className="empty-state">No borrow records found matching criteria.</div>
        ) : (
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Record ID</th>
                  <th>Member</th>
                  <th>Book Title</th>
                  <th>Borrow Date</th>
                  <th>Due Date</th>
                  <th>Return Date</th>
                  <th>Status</th>
                  <th>Details</th>
                </tr>
              </thead>
              <tbody>
                {records.map((rec) => (
                  <tr key={rec.id}>
                    <td style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>REC-{rec.id}</td>
                    <td>
                      <div style={{ fontWeight: 600, color: '#f8fafc' }}>{rec.member_name}</div>
                      <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{rec.member_email}</div>
                    </td>
                    <td style={{ fontWeight: 500 }}>{rec.book_title}</td>
                    <td>{rec.borrow_date}</td>
                    <td>{rec.due_date}</td>
                    <td>{rec.return_date || '—'}</td>
                    <td>
                      <span
                        className={`badge badge-${
                          rec.status === 'Returned'
                            ? 'success'
                            : rec.status === 'Overdue'
                            ? 'danger'
                            : 'warning'
                        }`}
                      >
                        {rec.status}
                      </span>
                    </td>
                    <td>
                      <button
                        onClick={() => handleViewDetail(rec)}
                        className="btn btn-secondary btn-sm"
                        title="View Full Record"
                      >
                        <Eye size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Record Detail Modal */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title="Transaction Details"
      >
        {selectedRecord && (
          <div style={{ fontSize: '0.9rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', background: 'rgba(15,23,42,0.6)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
              <div><strong>Borrow Record ID:</strong> REC-{selectedRecord.id}</div>
              <div><strong>Current Status:</strong> <span className={`badge badge-${selectedRecord.status === 'Returned' ? 'success' : selectedRecord.status === 'Overdue' ? 'danger' : 'warning'}`}>{selectedRecord.status}</span></div>
              <div><strong>Member Name:</strong> {selectedRecord.member_name}</div>
              <div><strong>Member Email:</strong> {selectedRecord.member_email}</div>
              <div><strong>Book Title:</strong> {selectedRecord.book_title}</div>
              <div><strong>Book ISBN:</strong> {selectedRecord.book_isbn}</div>
              <div><strong>Borrow Date:</strong> {selectedRecord.borrow_date}</div>
              <div><strong>Due Date:</strong> {selectedRecord.due_date}</div>
              <div><strong>Return Date:</strong> {selectedRecord.return_date || 'Not yet returned'}</div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default BorrowRecords;
