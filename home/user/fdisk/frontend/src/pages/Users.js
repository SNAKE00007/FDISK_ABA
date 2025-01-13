import React, { useState, useEffect } from 'react';
import axios from 'axios';

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
    <div>
      <h1>Users</h1>
      <div>
        {users.map(user => (
          <div key={user.id}>
            <h3>{user.username}</h3>
            <p>Role: {user.role}</p>
            <p>Status: {user.status}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Users;