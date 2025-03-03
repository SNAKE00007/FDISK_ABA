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

  if (!user) return <div>Lädt...</div>;

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div>
          <h1>Dashboard</h1>
          <div className="user-info">
            <p>Willkommen, {user.member.vorname} {user.member.nachname}</p>
            <p>Rolle: {user.role}</p>
            <p>Dienstgrad: {user.member.dienstgrad}</p>
          </div>
        </div>
      </div>

      <div className="dashboard-content">
        <div className="quick-actions">
          <h2>Schnellzugriff</h2>
          <button onClick={() => history.push('/members/list')}>Mitglieder verwalten</button>
          <button onClick={() => history.push('/users')}>Benutzer verwalten</button>
          <button onClick={() => history.push('/equipment')}>Geräte</button>
          <button onClick={() => history.push('/reports')}>Tätigkeitsberichte</button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;