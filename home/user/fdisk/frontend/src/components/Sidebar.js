import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { logout } from '../services/auth';
import '../styles/Sidebar.css';

const Sidebar = () => {
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname.includes(path) ? 'active' : '';
  };

  return (
    <div className="sidebar">
      <Link to="/dashboard" className="sidebar-logo">
        <h2>FDISK</h2>
      </Link>
      <nav className="sidebar-nav">
        <Link to="/members/list" className={`nav-item ${isActive('/members')}`}>
          Mitglieder verwalten
        </Link>
        <Link to="/users" className={`nav-item ${isActive('/users')}`}>
          Benutzer verwalten
        </Link>
        <Link to="/equipment" className={`nav-item ${isActive('/equipment')}`}>
          Geräte
        </Link>
        <Link to="/reports" className={`nav-item ${isActive('/reports')}`}>
          Tätigkeitsberichte
        </Link>
      </nav>
      <div className="sidebar-footer">
        <Link to="/dashboard" className="nav-item">
          Dashboard
        </Link>
        <button className="nav-item logout-button" onClick={logout}>
          Abmelden
        </button>
      </div>
    </div>
  );
};

export default Sidebar; 