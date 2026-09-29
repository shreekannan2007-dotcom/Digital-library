import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, BookOpen, Bookmark, Users,
  ArrowUpRight, ArrowDownLeft, FileText, Search, Library
} from 'lucide-react';

const Sidebar = () => {
  const navItems = [
    { path: '/', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { path: '/books', label: 'Book Management', icon: <BookOpen size={20} /> },
    { path: '/categories', label: 'Category Management', icon: <Bookmark size={20} /> },
    { path: '/members', label: 'Member Management', icon: <Users size={20} /> },
    { path: '/borrow', label: 'Borrow Book', icon: <ArrowUpRight size={20} /> },
    { path: '/return', label: 'Return Book', icon: <ArrowDownLeft size={20} /> },
    { path: '/records', label: 'Borrow Records', icon: <FileText size={20} /> },
    { path: '/search', label: 'Book Search', icon: <Search size={20} /> },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <Library size={28} color="#6366f1" />
        <span className="sidebar-logo">DigiLibrary</span>
      </div>
      <ul className="sidebar-menu">
        {navItems.map((item) => (
          <li key={item.path}>
            <NavLink
              to={item.path}
              className={({ isActive }) =>
                `sidebar-link ${isActive ? 'active' : ''}`
              }
              end={item.path === '/'}
            >
              {item.icon}
              <span>{item.label}</span>
            </NavLink>
          </li>
        ))}
      </ul>
    </aside>
  );
};

export default Sidebar;
