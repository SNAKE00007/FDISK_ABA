import React from 'react';
import { Link } from 'react-router-dom';
import { isAuthenticated, logout } from '../services/auth';

const Navbar = () => {
  if (!isAuthenticated()) return null;

  return (
    <nav>
      <ul>
        <li><Link to="/dashboard">Dashboard</Link></li>
        <li><Link to="/users">Users</Link></li>
        <li><Link to="/equipment">Equipment</Link></li>
        <li><Link to="/reports">Reports</Link></li>
        <li><button onClick={logout}>Logout</button></li>
      </ul>
    </nav>
  );
};

export default Navbar;