import React from 'react';
import { isAuthenticated, logout } from '../services/auth';
import '../styles/Navbar.css';

const Navbar = () => {
  if (!isAuthenticated()) return null;

  return (
    <nav className="top-nav">
      <button className="logout-button" onClick={logout}>Abmelden</button>
    </nav>
  );
};

export default Navbar;