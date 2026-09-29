import React from 'react';
import { CheckCircle, AlertCircle, AlertTriangle, X } from 'lucide-react';

const Notification = ({ notification, onClose }) => {
  if (!notification) return null;

  const { type, message } = notification;

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle size={20} color="#10b981" />;
      case 'error':
        return <AlertCircle size={20} color="#ef4444" />;
      case 'warning':
        return <AlertTriangle size={20} color="#f59e0b" />;
      default:
        return <CheckCircle size={20} color="#6366f1" />;
    }
  };

  return (
    <div className="toast-container">
      <div className={`toast toast-${type}`}>
        {getIcon()}
        <span style={{ flex: 1, fontSize: '0.875rem' }}>{message}</span>
        <button
          onClick={onClose}
          style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
};

export default Notification;
