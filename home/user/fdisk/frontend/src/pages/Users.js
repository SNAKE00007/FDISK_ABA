import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from '../components/Sidebar';
import '../styles/Users.css';

const Users = () => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')).token : null;
        const response = await axios.get('http://localhost:5000/api/users', {
          headers: { Authorization: token }
        });
        setUsers(response.data);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };

    fetchUsers();
  }, []);

  return (
    <>
      <Sidebar />
      <div className="users-page">
        <div className="users-header">
          <h1>Benutzer verwalten</h1>
          <button>Neuen Benutzer hinzufügen</button>
        </div>
        <div className="users-list">
          {users.map(user => (
            <div key={user.id} className="user-item">
              <h3>{user.username}</h3>
              <p>Rolle: {user.role}</p>
              <p>Status: {user.status}</p>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default Users;