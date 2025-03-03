import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import '../styles/Reports.css';

const Reports = () => {
    const [reports, setReports] = useState([]);
    const [members, setMembers] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [formData, setFormData] = useState({
        date: '',
        start_time: '',
        end_time: '',
        duration: '',
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
                start_time: '',
                end_time: '',
                duration: '',
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
            start_time: report.start_time,
            end_time: report.end_time,
            duration: report.duration,
            type: report.type,
            description: report.description,
            members: report.members || []
        });
        setShowForm(true);
    };

    const handleDelete = async (reportId) => {
        if (!window.confirm('Sind Sie sicher, dass Sie diesen Bericht löschen möchten?')) {
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

    const handleSearch = (event) => {
        setSearchTerm(event.target.value);
    };

    const filteredReports = reports.filter(report =>
        report.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <>
            <Sidebar />
            <div className="reports-page">
                <div className="reports-header">
                    <h1>Tätigkeitsberichte</h1>
                    <button onClick={() => {
                        setShowForm(true);
                        setEditingReport(null);
                        setFormData({
                            date: '',
                            start_time: '',
                            end_time: '',
                            duration: '',
                            type: '',
                            members: [],
                            description: ''
                        });
                    }}>Neuen Bericht erstellen</button>
                </div>

                <div className="search-bar">
                    <input
                        type="text"
                        placeholder="Berichte suchen..."
                        value={searchTerm}
                        onChange={handleSearch}
                    />
                </div>

                {showForm && (
                    <form onSubmit={handleSubmit} className="report-form">
                        <h2>{editingReport ? 'Bericht bearbeiten' : 'Neuer Bericht'}</h2>
                        <div className="form-group">
                            <label>Datum:</label>
                            <input
                                type="date"
                                value={formData.date}
                                onChange={(e) => setFormData({...formData, date: e.target.value})}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Startzeit:</label>
                            <input
                                type="time"
                                value={formData.start_time}
                                onChange={(e) => setFormData({...formData, start_time: e.target.value})}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Endzeit:</label>
                            <input
                                type="time"
                                value={formData.end_time}
                                onChange={(e) => setFormData({...formData, end_time: e.target.value})}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Dauer (optional):</label>
                            <input
                                type="text"
                                value={formData.duration}
                                onChange={(e) => setFormData({...formData, duration: e.target.value})}
                                placeholder="z.B. 2 Stunden"
                            />
                        </div>
                        <div className="form-group">
                            <label>Typ:</label>
                            <select
                                value={formData.type}
                                onChange={(e) => setFormData({...formData, type: e.target.value})}
                                required
                            >
                                <option value="">Typ auswählen</option>
                                <option value="exercise">Übung</option>
                                <option value="emergency">Einsatz</option>
                                <option value="training">Schulung</option>
                                <option value="maintenance">Wartung</option>
                                <option value="other">Sonstiges</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Beschreibung:</label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({...formData, description: e.target.value})}
                                rows={4}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Anwesende Mitglieder:</label>
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
                            <button type="submit">{editingReport ? 'Aktualisieren' : 'Erstellen'}</button>
                            <button type="button" onClick={() => setShowForm(false)}>Abbrechen</button>
                        </div>
                    </form>
                )}

                <div className="table-container">
                    <table className="reports-table">
                        <thead>
                            <tr>
                                <th>Datum</th>
                                <th>Zeit</th>
                                <th>Typ</th>
                                <th>Beschreibung</th>
                                <th>Anwesende Mitglieder</th>
                                <th>Aktionen</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredReports.map(report => (
                                <tr key={report.id}>
                                    <td>{report.date}</td>
                                    <td>{report.start_time} - {report.end_time}</td>
                                    <td>{report.type}</td>
                                    <td>{report.description}</td>
                                    <td>
                                        {members
                                            .filter(member => report.members.includes(member.id))
                                            .map(member => `${member.dienstgrad} ${member.vorname} ${member.nachname}`)
                                            .join(', ')}
                                    </td>
                                    <td>
                                        <button onClick={() => handleEdit(report)}>Bearbeiten</button>
                                        <button 
                                            onClick={() => handleDelete(report.id)}
                                            className="delete-button"
                                        >Löschen</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
};

export default Reports;