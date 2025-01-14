import React, { useState, useEffect } from 'react';
import '../styles/Reports.css';

const Reports = () => {
    const [reports, setReports] = useState([]);
    const [members, setMembers] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        date: '',
        time: '',
        type: '',
        members: [],
        description: ''
    });
    const [editingReport, setEditingReport] = useState(null);

    useEffect(() => {
        fetchReports();
        fetchMembers();
    }, []);

    const fetchReports = async () => {
        try {
            const userData = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null;
            if (!userData || !userData.token) {
                throw new Error('Not authenticated');
            }

            const response = await fetch('http://10.0.0.130:5000/api/reports', {
                headers: { 
                    'Authorization': userData.token,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch reports');
            }

            const data = await response.json();
            setReports(data);
        } catch (error) {
            console.error('Error fetching reports:', error);
            alert(error.message);
        }
    };

    const fetchMembers = async () => {
        try {
            const userData = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null;
            const response = await fetch('http://10.0.0.130:5000/api/members', {
                headers: { 
                    'Authorization': userData.token,
                    'Content-Type': 'application/json'
                }
            });
            const data = await response.json();
            setMembers(data);
        } catch (error) {
            console.error('Error fetching members:', error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const userData = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null;
            if (!userData || !userData.token) {
                throw new Error('Not authenticated');
            }

            const url = editingReport 
                ? `http://10.0.0.130:5000/api/reports/${editingReport.id}`
                : 'http://10.0.0.130:5000/api/reports';

            const response = await fetch(url, {
                method: editingReport ? 'PUT' : 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': userData.token
                },
                body: JSON.stringify(formData)
            });

            if (!response.ok) {
                throw new Error(editingReport ? 'Failed to update report' : 'Failed to create report');
            }

            await fetchReports();
            setFormData({
                date: '',
                time: '',
                type: '',
                members: [],
                description: ''
            });
            setEditingReport(null);
            setShowForm(false);
        } catch (error) {
            console.error('Error saving report:', error);
            alert(error.message);
        }
    };

    const handleEdit = (report) => {
        setEditingReport(report);
        setFormData({
            date: report.date,
            time: report.time,
            type: report.type,
            description: report.description,
            members: report.members || []
        });
        setShowForm(true);
    };

    const handleDelete = async (reportId) => {
        if (!window.confirm('Are you sure you want to delete this report?')) {
            return;
        }

        try {
            const userData = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null;
            if (!userData || !userData.token) {
                throw new Error('Not authenticated');
            }

            const response = await fetch(`http://10.0.0.130:5000/api/reports/${reportId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': userData.token
                }
            });

            if (!response.ok) {
                throw new Error('Failed to delete report');
            }

            await fetchReports();
        } catch (error) {
            console.error('Error deleting report:', error);
            alert(error.message);
        }
    };

    return (
        <div className="reports-page">
            <div className="reports-header">
                <h1>Activity Reports</h1>
                <button onClick={() => setShowForm(true)}>Create New Report</button>
            </div>

            {showForm && (
                <form onSubmit={handleSubmit} className="report-form">
                    <h2>{editingReport ? 'Edit Report' : 'New Activity Report'}</h2>
                    <div className="form-group">
                        <label>Date:</label>
                        <input
                            type="date"
                            value={formData.date}
                            onChange={(e) => setFormData({...formData, date: e.target.value})}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Time:</label>
                        <input
                            type="time"
                            value={formData.time}
                            onChange={(e) => setFormData({...formData, time: e.target.value})}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Type:</label>
                        <select
                            value={formData.type}
                            onChange={(e) => setFormData({...formData, type: e.target.value})}
                            required
                        >
                            <option value="">Select type</option>
                            <option value="exercise">Exercise</option>
                            <option value="emergency">Emergency</option>
                            <option value="training">Training</option>
                            <option value="maintenance">Maintenance</option>
                            <option value="other">Other</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label>Description:</label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({...formData, description: e.target.value})}
                            rows={4}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Members Present:</label>
                        <div className="members-select">
                            {members.map(member => (
                                <label key={member.id} className="member-checkbox">
                                    <input
                                        type="checkbox"
                                        checked={formData.members.includes(member.id)}
                                        onChange={(e) => {
                                            const newMembers = e.target.checked
                                                ? [...formData.members, member.id]
                                                : formData.members.filter(id => id !== member.id);
                                            setFormData({...formData, members: newMembers});
                                        }}
                                    />
                                    {member.dienstgrad} {member.vorname} {member.nachname}
                                </label>
                            ))}
                        </div>
                    </div>
                    <div className="form-actions">
                        <button type="submit">
                            {editingReport ? 'Update Report' : 'Create Report'}
                        </button>
                        <button type="button" onClick={() => {
                            setShowForm(false);
                            setEditingReport(null);
                            setFormData({
                                date: '',
                                time: '',
                                type: '',
                                members: [],
                                description: ''
                            });
                        }}>Cancel</button>
                    </div>
                </form>
            )}

            <div className="table-container">
                <table className="reports-table">
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Time</th>
                            <th>Type</th>
                            <th>Description</th>
                            <th>Members Present</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {reports.map(report => (
                            <tr 
                                key={report.id} 
                                onClick={() => handleEdit(report)}
                                style={{ cursor: 'pointer' }}
                            >
                                <td>{report.date}</td>
                                <td>{report.time}</td>
                                <td>{report.type}</td>
                                <td>{report.description}</td>
                                <td>
                                    {members
                                        .filter(member => report.members.includes(member.id))
                                        .map(member => `${member.dienstgrad} ${member.vorname} ${member.nachname}`)
                                        .join(', ')}
                                </td>
                                <td className="action-buttons" onClick={e => e.stopPropagation()}>
                                    <button onClick={() => handleEdit(report)}>Edit</button>
                                    <button 
                                        onClick={() => handleDelete(report.id)}
                                        className="delete-button"
                                    >Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Reports;