import React, { useState, useEffect } from 'react';
import { getMembers, createMember, updateMember } from '../services/members';
import '../styles/Members.css';

const Members = () => {
    const [members, setMembers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedMember, setSelectedMember] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        vorname: '',
        nachname: '',
        dienstgrad: '',
        geburtsdatum: '',
        eintrittsdatum: '',
        telefonnummer: '',
        status: 'active'
    });
    const [editingId, setEditingId] = useState(null);

    useEffect(() => {
        fetchMembers();
    }, []);

    const fetchMembers = async () => {
        try {
            const userData = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null;
            if (!userData || !userData.token) {
                throw new Error('Not authenticated');
            }

            const response = await fetch('http://localhost:5000/api/members', {
                headers: { 
                    'Authorization': `${userData.token}`,
                    'Content-Type': 'application/json'
                },
                credentials: 'include'
            });

            if (!response.ok) {
                throw new Error('Failed to fetch members');
            }

            const data = await response.json();
            setMembers(data);
        } catch (error) {
            console.error('Error fetching members:', error);
            alert(error.message);
        }
    };

    const handleSearch = (event) => {
        setSearchTerm(event.target.value);
    };

    const filteredMembers = members.filter(member =>
        member.nachname.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.vorname.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const url = editingId 
                ? `http://localhost:5000/api/members/${editingId}`
                : 'http://localhost:5000/api/members';
                
            const method = editingId ? 'PUT' : 'POST';
            
            // Get the full user object from localStorage
            const userData = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null;
            if (!userData || !userData.token) {
                throw new Error('Not authenticated');
            }

            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `${userData.token}` // Make sure token is properly formatted
                },
                credentials: 'include',
                body: JSON.stringify(formData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to save member');
            }

            // Refresh member list and reset form
            await fetchMembers();
            setFormData({
                vorname: '',
                nachname: '',
                dienstgrad: '',
                geburtsdatum: '',
                eintrittsdatum: '',
                telefonnummer: '',
                status: 'active'
            });
            setEditingId(null);
            setShowForm(false);
        } catch (error) {
            console.error('Error saving member:', error);
            alert(error.message);
        }
    };

    const handleEdit = (member) => {
        setFormData(member);
        setEditingId(member.id);
        setShowForm(true);
    };

    return (
        <div className="members-page">
            <div className="members-header">
                <h1>Member Management</h1>
                <button onClick={() => {
                    setShowForm(true);
                    setSelectedMember(null);
                    setFormData({
                        vorname: '',
                        nachname: '',
                        dienstgrad: '',
                        geburtsdatum: '',
                        eintrittsdatum: '',
                        telefonnummer: '',
                        status: 'active'
                    });
                }}>Add New Member</button>
            </div>

            <div className="search-bar">
                <input
                    type="text"
                    placeholder="Search members..."
                    value={searchTerm}
                    onChange={handleSearch}
                />
            </div>

            {showForm && (
                <form onSubmit={handleSubmit} className="member-form">
                    <h2>{selectedMember ? 'Edit Member' : 'New Member'}</h2>
                    <div className="form-group">
                        <label>First Name:</label>
                        <input
                            type="text"
                            value={formData.vorname}
                            onChange={(e) => setFormData({...formData, vorname: e.target.value})}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Last Name:</label>
                        <input
                            type="text"
                            value={formData.nachname}
                            onChange={(e) => setFormData({...formData, nachname: e.target.value})}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Rank:</label>
                        <input
                            type="text"
                            value={formData.dienstgrad}
                            onChange={(e) => setFormData({...formData, dienstgrad: e.target.value})}
                        />
                    </div>
                    <div className="form-group">
                        <label>Birth Date:</label>
                        <input
                            type="date"
                            value={formData.geburtsdatum}
                            onChange={(e) => setFormData({...formData, geburtsdatum: e.target.value})}
                        />
                    </div>
                    <div className="form-group">
                        <label>Entry Date:</label>
                        <input
                            type="date"
                            value={formData.eintrittsdatum}
                            onChange={(e) => setFormData({...formData, eintrittsdatum: e.target.value})}
                        />
                    </div>
                    <div className="form-group">
                        <label>Phone Number:</label>
                        <input
                            type="tel"
                            value={formData.telefonnummer}
                            onChange={(e) => setFormData({...formData, telefonnummer: e.target.value})}
                        />
                    </div>
                    <div className="form-group">
                        <label>Status:</label>
                        <select
                            value={formData.status}
                            onChange={(e) => setFormData({...formData, status: e.target.value})}
                        >
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                        </select>
                    </div>
                    <div className="form-actions">
                        <button type="submit">{selectedMember ? 'Update' : 'Create'}</button>
                        <button type="button" onClick={() => setShowForm(false)}>Cancel</button>
                    </div>
                </form>
            )}

            <div className="table-container">
                <table className="members-table">
                    <thead>
                        <tr>
                            <th>Rank</th>
                            <th>First Name</th>
                            <th>Last Name</th>
                            <th>Birth Date</th>
                            <th>Entry Date</th>
                            <th>Phone</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredMembers.map(member => (
                            <tr key={member.id}>
                                <td>{member.dienstgrad}</td>
                                <td>{member.vorname}</td>
                                <td>{member.nachname}</td>
                                <td>{member.geburtsdatum}</td>
                                <td>{member.eintrittsdatum}</td>
                                <td>{member.telefonnummer}</td>
                                <td>{member.status}</td>
                                <td>
                                    <button onClick={() => handleEdit(member)}>Edit</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Members;