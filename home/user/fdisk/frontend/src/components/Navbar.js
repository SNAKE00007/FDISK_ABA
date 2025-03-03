import React from 'react';
import { useLocation } from 'react-router-dom';
import { isAuthenticated, logout } from '../services/auth';
import '../styles/Navbar.css';

const Navbar = () => {
  const location = useLocation();
  
  if (!isAuthenticated() || location.pathname !== '/dashboard') return null;

  return (
    <nav className="top-nav">
      <button className="logout-button" onClick={logout}>Abmelden</button>
    </nav>
  );
};

export default Navbar;