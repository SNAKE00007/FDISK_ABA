import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from '../components/Sidebar';
import '../styles/Equipment.css';

const Equipment = () => {
  const [equipment, setEquipment] = useState([]);

  useEffect(() => {
    const fetchEquipment = async () => {
      try {
        const token = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')).token : null;
        const response = await axios.get('http://localhost:5000/api/equipment', {
          headers: { Authorization: token }
        });
        setEquipment(response.data);
      } catch (error) {
        console.error('Error fetching equipment:', error);
      }
    };

    fetchEquipment();
  }, []);

  return (
    <>
      <Sidebar />
      <div className="equipment-page">
        <div className="equipment-header">
          <h1>Geräte</h1>
          <button>Neues Gerät hinzufügen</button>
        </div>
        <div className="equipment-list">
          {equipment.map(item => (
            <div key={item.id} className="equipment-item">
              <h3>{item.name}</h3>
              <p>Status: {item.status}</p>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default Equipment;