import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/api';

const ReportForm = ({ report, onSubmit, onCancel }) => {
    const { auth } = useAuth();
    const [formData, setFormData] = useState({
        date: '',
        start_time: '',
        end_time: '',
        duration: '',
        type: '',
        description: '',
        members: []
    });
    const [availableMembers, setAvailableMembers] = useState([]);

    useEffect(() => {
        const fetchMembers = async () => {
            try {
                const response = await api.get('/members');
                setAvailableMembers(response.data);
            } catch (error) {
                console.error('Error fetching members:', error);
            }
        };

        fetchMembers();

        if (report) {
            setFormData(report);
        }
    }, [report]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (report) {
                await api.put(`/reports/${report.id}`, formData);
            } else {
                await api.post('/reports', formData);
            }
            onSubmit();
        } catch (error) {
            console.error('Error saving report:', error);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="report-form">
            <h3>{report ? 'Edit' : 'New'} Report - {auth.user.department_name}</h3>
            
            <div className="form-group">
                <label>Date</label>
                <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                    required
                />
            </div>

            <div className="form-group">
                <label>Start Time</label>
                <input
                    type="time"
                    value={formData.start_time}
                    onChange={(e) => setFormData(prev => ({ ...prev, start_time: e.target.value }))}
                    required
                />
            </div>

            <div className="form-group">
                <label>End Time</label>
                <input
                    type="time"
                    value={formData.end_time}
                    onChange={(e) => setFormData(prev => ({ ...prev, end_time: e.target.value }))}
                />
            </div>

            <div className="form-group">
                <label>Type</label>
                <input
                    type="text"
                    value={formData.type}
                    onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                    required
                />
            </div>

            <div className="form-group">
                <label>Description</label>
                <textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                />
            </div>

            <div className="form-group">
                <label>Members</label>
                <select
                    multiple
                    value={formData.members}
                    onChange={(e) => setFormData(prev => ({
                        ...prev,
                        members: Array.from(e.target.selectedOptions, option => Number(option.value))
                    }))}
                >
                    {availableMembers.map(member => (
                        <option key={member.id} value={member.id}>
                            {member.dienstgrad} {member.vorname} {member.nachname}
                        </option>
                    ))}
                </select>
            </div>

            <div className="form-actions">
                <button type="submit">{report ? 'Update' : 'Create'} Report</button>
                <button type="button" onClick={onCancel}>Cancel</button>
            </div>
        </form>
    );
};

export default ReportForm;