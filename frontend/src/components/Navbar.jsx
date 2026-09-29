import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, BookMarked, User } from 'lucide-react';

const Navbar = () => {
  const navigate = useNavigate();

  return (
    <header className="navbar">
      <div style={{ fontSize: '0.9rem', color: '#94a3b8' }}>
        Digital Library System &bull; <span style={{ color: '#10b981' }}>● System Active</span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <button
          onClick={() => navigate('/search')}
          className="btn btn-secondary btn-sm"
          style={{ gap: '0.4rem' }}
        >
          <Search size={16} />
          <span>Quick Search</span>
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#f8fafc', fontSize: '0.875rem' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <User size={18} />
          </div>
          <span>Librarian</span>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
