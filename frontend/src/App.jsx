import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import Notification from './components/Notification';

import Dashboard from './pages/Dashboard';
import Books from './pages/Books';
import Categories from './pages/Categories';
import Members from './pages/Members';
import BorrowBook from './pages/BorrowBook';
import ReturnBook from './pages/ReturnBook';
import BorrowRecords from './pages/BorrowRecords';
import BookSearch from './pages/BookSearch';

import './App.css';

function App() {
  const [notification, setNotification] = useState(null);

  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  return (
    <Router>
      <div className="app-container">
        <Sidebar />
        <div className="main-content">
          <Navbar />
          <Notification notification={notification} onClose={() => setNotification(null)} />
          <Routes>
            <Route path="/" element={<Dashboard showNotification={showNotification} />} />
            <Route path="/books" element={<Books showNotification={showNotification} />} />
            <Route path="/categories" element={<Categories showNotification={showNotification} />} />
            <Route path="/members" element={<Members showNotification={showNotification} />} />
            <Route path="/borrow" element={<BorrowBook showNotification={showNotification} />} />
            <Route path="/return" element={<ReturnBook showNotification={showNotification} />} />
            <Route path="/records" element={<BorrowRecords showNotification={showNotification} />} />
            <Route path="/search" element={<BookSearch showNotification={showNotification} />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
