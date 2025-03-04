import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { isAuthenticated, logout } from '../services/auth';
import '../styles/Navbar.css';

const Navbar = () => {
  const location = useLocation();
  
  if (!isAuthenticated() || location.pathname === '/') return null;

  return (
    <nav className="top-nav">
      <div className="nav-links">
        <Link to="/dashboard" className={location.pathname === '/dashboard' ? 'active' : ''}>
          Dashboard
        </Link>
        <Link to="/members" className={location.pathname === '/members' ? 'active' : ''}>
          Members
        </Link>
        <Link to="/equipment" className={location.pathname === '/equipment' ? 'active' : ''}>
          Equipment
        </Link>
        <Link to="/reports" className={location.pathname === '/reports' ? 'active' : ''}>
          Reports
        </Link>
        <Link to="/commanders" className={location.pathname === '/commanders' ? 'active' : ''}>
          Commanders
        </Link>
      </div>
      <button className="logout-button" onClick={logout}>Abmelden</button>
    </nav>
  );
};

export default Navbar;