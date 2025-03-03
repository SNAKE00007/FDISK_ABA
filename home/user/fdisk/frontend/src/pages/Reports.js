import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import '../styles/Reports.css';

const Reports = () => {
    const [reports, setReports] = useState([]);
    const [members, setMembers] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [formData, setFormData] = useState({
        start_date: '',
        start_time: '',
        end_date: '',
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
                start_date: '',
                start_time: '',
                end_date: '',
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
        console.log('Report data received:', report);
        
        // Ensure date is in YYYY-MM-DD format for the date input and remove seconds from times
        const formattedData = {
            ...report,
            start_date: report.start_date ? report.start_date.split('T')[0] : '',
            end_date: report.end_date ? report.end_date.split('T')[0] : '',
            start_time: report.start_time ? report.start_time.slice(0, 5) : '',
            end_time: report.end_time ? report.end_time.slice(0, 5) : ''
        };
        
        console.log('Formatted data:', formattedData);
        setFormData(formattedData);
        setEditingReport(report);
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

    const formatDateForDisplay = (dateStr) => {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}.${month}.${year}`;
    };

    const filteredReports = reports.filter(report =>
        report.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Add helper functions for date/time calculations
    const calculateDuration = (startDate, startTime, endDate, endTime) => {
        if (!startDate || !startTime || !endDate || !endTime) return '';
        
        const start = new Date(`${startDate}T${startTime}`);
        const end = new Date(`${endDate}T${endTime}`);
        
        const diffMs = end - start;
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffMinutes = Math.round((diffMs % (1000 * 60 * 60)) / (1000 * 60));
        
        return `${diffHours}:${String(diffMinutes).padStart(2, '0')}`;
    };

    const calculateEndDateTime = (startDate, startTime, duration) => {
        if (!startDate || !startTime || !duration) return { endDate: '', endTime: '' };
        
        const [hours, minutes] = duration.split(':').map(Number);
        const start = new Date(`${startDate}T${startTime}`);
        const end = new Date(start.getTime() + (hours * 60 * 60 * 1000) + (minutes * 60 * 1000));
        
        return {
            endDate: end.toISOString().split('T')[0],
            endTime: end.toTimeString().slice(0, 5)
        };
    };

    // Add new helper functions for time formatting
    const formatTimeInput = (value) => {
        // Remove any non-digit characters
        let digits = value.replace(/\D/g, '');
        
        // Handle empty input
        if (!digits) return '';
        
        // Handle partial inputs
        if (digits.length === 1) {
            return digits;
        }
        if (digits.length === 2) {
            const hours = parseInt(digits);
            if (hours >= 24) return '23:';
            return `${digits.padStart(2, '0')}:`;
        }
        
        // Format complete time
        let hours = digits.slice(0, 2);
        let minutes = digits.slice(2, 4);
        
        // Validate hours and minutes
        hours = Math.min(parseInt(hours), 23).toString().padStart(2, '0');
        if (minutes) {
            minutes = Math.min(parseInt(minutes), 59).toString().padStart(2, '0');
        }
        
        return minutes ? `${hours}:${minutes}` : `${hours}:`;
    };

    const formatDurationDisplay = (duration) => {
        if (!duration) return '';
        
        const [hours, minutes] = duration.split(':').map(Number);
        const days = Math.floor(hours / 24);
        const remainingHours = hours % 24;
        
        let result = '';
        if (days > 0) {
            result += `${days}d `;
        }
        if (remainingHours > 0 || minutes > 0) {
            result += `${remainingHours}:${String(minutes).padStart(2, '0')}`;
        }
        return result.trim() || '0:00';
    };

    // Update handleDateTimeChange to include time formatting
    const handleDateTimeChange = (field, value) => {
        // Format time inputs
        if (field === 'start_time' || field === 'end_time') {
            value = formatTimeInput(value);
        }

        // First update the form data with the new value
        const newFormData = { ...formData, [field]: value };
        
        // Only proceed with calculations if we have valid values
        try {
            // If we have start date/time and duration, calculate end date/time
            if (field === 'start_date' || field === 'start_time' || field === 'duration') {
                if (newFormData.start_date && newFormData.start_time && newFormData.duration) {
                    const [hours, minutes] = newFormData.duration.split(':').map(Number);
                    if (!isNaN(hours) && !isNaN(minutes)) {
                        const start = new Date(`${newFormData.start_date}T${newFormData.start_time}`);
                        if (start.toString() !== 'Invalid Date') {
                            const end = new Date(start.getTime() + (hours * 60 * 60 * 1000) + (minutes * 60 * 1000));
                            newFormData.end_date = end.toISOString().split('T')[0];
                            newFormData.end_time = end.toTimeString().slice(0, 5);
                        }
                    }
                }
            }

            // If we have start and end date/time, calculate duration
            if (field === 'start_date' || field === 'start_time' || field === 'end_date' || field === 'end_time') {
                if (newFormData.start_date && newFormData.start_time && newFormData.end_date && newFormData.end_time) {
                    const start = new Date(`${newFormData.start_date}T${newFormData.start_time}`);
                    const end = new Date(`${newFormData.end_date}T${newFormData.end_time}`);
                    if (start.toString() !== 'Invalid Date' && end.toString() !== 'Invalid Date') {
                        const diffMs = end - start;
                        if (diffMs >= 0) {
                            const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
                            const diffMinutes = Math.round((diffMs % (1000 * 60 * 60)) / (1000 * 60));
                            newFormData.duration = `${diffHours}:${String(diffMinutes).padStart(2, '0')}`;
                        }
                    }
                }
            }
        } catch (error) {
            console.error('Error calculating dates:', error);
        }

        setFormData(newFormData);
    };

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
                            start_date: '',
                            start_time: '',
                            end_date: '',
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
                            <label>Startdatum:</label>
                            <input
                                type="date"
                                value={formData.start_date}
                                onChange={(e) => handleDateTimeChange('start_date', e.target.value)}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Startzeit:</label>
                            <input
                                type="text"
                                value={formData.start_time}
                                onChange={(e) => handleDateTimeChange('start_time', e.target.value)}
                                placeholder="HH:MM"
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Enddatum:</label>
                            <input
                                type="date"
                                value={formData.end_date}
                                onChange={(e) => handleDateTimeChange('end_date', e.target.value)}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Endzeit:</label>
                            <input
                                type="text"
                                value={formData.end_time}
                                onChange={(e) => handleDateTimeChange('end_time', e.target.value)}
                                placeholder="HH:MM"
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Dauer (HH:MM):</label>
                            <input
                                type="text"
                                value={formData.duration}
                                onChange={(e) => handleDateTimeChange('duration', e.target.value)}
                                placeholder="z.B. 2:30"
                                pattern="[0-9]{1,2}:[0-9]{2}"
                                title="Format: HH:MM (z.B. 2:30)"
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
                                <th>Startdatum</th>
                                <th>Startzeit</th>
                                <th>Enddatum</th>
                                <th>Endzeit</th>
                                <th>Dauer</th>
                                <th>Typ</th>
                                <th>Beschreibung</th>
                                <th>Anwesende Mitglieder</th>
                                <th>Aktionen</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredReports.map(report => (
                                <tr key={report.id}>
                                    <td>{formatDateForDisplay(report.start_date)}</td>
                                    <td>{report.start_time ? report.start_time.slice(0, 5) : ''}</td>
                                    <td>{formatDateForDisplay(report.end_date)}</td>
                                    <td>{report.end_time ? report.end_time.slice(0, 5) : ''}</td>
                                    <td>{formatDurationDisplay(report.duration)}</td>
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