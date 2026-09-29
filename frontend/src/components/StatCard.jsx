import React from 'react';

const StatCard = ({ title, value, icon, color = '#6366f1' }) => {
  return (
    <div className="glass-card stat-card">
      <div className="stat-icon" style={{ background: `${color}20`, color: color }}>
        {icon}
      </div>
      <div>
        <div className="stat-label">{title}</div>
        <div className="stat-value">{value}</div>
      </div>
    </div>
  );
};

export default StatCard;
