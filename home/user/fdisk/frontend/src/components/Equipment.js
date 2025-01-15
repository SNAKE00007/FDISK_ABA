import React, { useState, useEffect } from 'react';
import axios from 'axios';

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
    <div>
      <h1>Equipment</h1>
      <div>
        {equipment.map(item => (
          <div key={item.id}>
            <h3>{item.name}</h3>
            <p>Status: {item.status}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Equipment;