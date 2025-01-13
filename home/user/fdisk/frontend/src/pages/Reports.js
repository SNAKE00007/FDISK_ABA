import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Reports = () => {
  const [reports, setReports] = useState([]);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const token = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')).token : null;
        const response = await axios.get('http://localhost:5000/api/reports', {
          headers: { Authorization: token }
        });
        setReports(response.data);
      } catch (error) {
        console.error('Error fetching reports:', error);
      }
    };

    fetchReports();
  }, []);

  return (
    <div>
      <h1>Reports</h1>
      <div>
        {reports.map(report => (
          <div key={report.id}>
            <h3>Report #{report.id}</h3>
            <p>Date: {report.date}</p>
            <p>Type: {report.type}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Reports;