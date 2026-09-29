import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import StatCard from '../components/StatCard';
import { BookOpen, Users, ArrowUpRight, AlertTriangle, Plus, RotateCcw } from 'lucide-react';

const Dashboard = ({ showNotification }) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await api.get('/dashboard/stats/');
      setStats(res.data);
    } catch (err) {
      console.error(err);
      showNotification('error', 'Failed to load dashboard statistics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return <div className="page-wrapper" style={{ textAlign: 'center', paddingTop: '4rem' }}>Loading Dashboard...</div>;
  }

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <div>
          <h1 className="page-title">Library Overview</h1>
          <p className="page-subtitle">Welcome to Digital Library Management Dashboard</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button onClick={() => navigate('/borrow')} className="btn btn-primary">
            <ArrowUpRight size={18} /> Borrow Book
          </button>
          <button onClick={() => navigate('/return')} className="btn btn-secondary">
            <RotateCcw size={18} /> Return Book
          </button>
        </div>
      </div>

      <div className="stats-grid">
        <StatCard title="Total Books" value={stats?.total_books || 0} icon={<BookOpen size={24} />} color="#6366f1" />
        <StatCard title="Total Members" value={stats?.total_members || 0} icon={<Users size={24} />} color="#0ea5e9" />
        <StatCard title="Active Borrows" value={stats?.active_borrows || 0} icon={<ArrowUpRight size={24} />} color="#10b981" />
        <StatCard title="Overdue Borrows" value={stats?.overdue_borrows || 0} icon={<AlertTriangle size={24} />} color="#ef4444" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
        {/* Recent Activity Table */}
        <div className="glass-card">
          <h3 style={{ marginBottom: '1rem', fontSize: '1.1rem' }}>Recent Borrowing Activity</h3>
          {stats?.recent_borrows?.length === 0 ? (
            <div className="empty-state">No recent borrowing activity recorded.</div>
          ) : (
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>Member</th>
                    <th>Book</th>
                    <th>Due Date</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {stats?.recent_borrows?.map((record) => (
                    <tr key={record.id}>
                      <td>
                        <div style={{ fontWeight: 500 }}>{record.member_name}</div>
                        <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{record.member_email}</div>
                      </td>
                      <td>{record.book_title}</td>
                      <td>{record.due_date}</td>
                      <td>
                        <span className={`badge badge-${record.status === 'Returned' ? 'success' : record.status === 'Overdue' ? 'danger' : 'warning'}`}>
                          {record.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Category Breakdown */}
        <div className="glass-card">
          <h3 style={{ marginBottom: '1rem', fontSize: '1.1rem' }}>Books by Category</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {stats?.category_stats?.map((cat, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '0.625rem 0.875rem',
                  background: 'rgba(15, 23, 42, 0.4)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-color)'
                }}
              >
                <span style={{ fontSize: '0.9rem', color: '#f8fafc' }}>{cat.name}</span>
                <span className="badge badge-secondary">{cat.book_count} books</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
