import React from 'react';
import { Link } from 'react-router-dom';
import { isAuthenticated, logout } from '../services/auth';

const Navbar = () => {
  if (!isAuthenticated()) return null;

  return (
    <nav>
      <ul>
        <li><Link to="/dashboard">Dashboard</Link></li>
        <li><Link to="/users">Benutzer</Link></li>
        <li><Link to="/equipment">Geräte</Link></li>
        <li><Link to="/reports">Tätigkeitsberichte</Link></li>
        <li><button onClick={logout}>Abmelden</button></li>
      </ul>
    </nav>
  );
};

export default Navbar;