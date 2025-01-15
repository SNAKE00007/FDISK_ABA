import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import '../styles/Dashboard.css';

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const history = useHistory();

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user'));
    if (!userData) {
      history.push('/');
      return;
    }
    setUser(userData.user);
  }, [history]);

  if (!user) return <div>Loading...</div>;

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Dashboard</h1>
        <div className="user-info">
          <p>Welcome, {user.member.vorname} {user.member.nachname}</p>
          <p>Role: {user.role}</p>
          <p>Rank: {user.member.dienstgrad}</p>
        </div>
      </div>

      <div className="dashboard-content">
        <div className="quick-actions">
          <h2>Quick Actions</h2>
          <button onClick={() => history.push('/members/list')}>Manage Members</button>
          <button onClick={() => history.push('/members/new')}>Create Member</button>
          <button onClick={() => history.push('/users')}>Manage Users</button>
          <button onClick={() => history.push('/equipment')}>Equipment</button>
          <button onClick={() => history.push('/reports')}>Reports</button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;