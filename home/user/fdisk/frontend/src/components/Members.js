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

    useEffect(() => {
        fetchMembers();
    }, []);

    const fetchMembers = async () => {
        try {
            const data = await getMembers();
            setMembers(data);
        } catch (error) {
            console.error('Error fetching members:', error);
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
            console.log('Submitting member data:', formData);
            if (selectedMember) {
                await updateMember(selectedMember.id, formData);
            } else {
                await createMember(formData);
            }
            await fetchMembers();
            setShowForm(false);
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
        } catch (error) {
            console.error('Error saving member:', error);
            alert('Failed to save member: ' + error.message);
        }
    };

    const handleEdit = (member) => {
        setSelectedMember(member);
        setFormData(member);
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

            <div className="members-list">
                {filteredMembers.map(member => (
                    <div key={member.id} className="member-card" onClick={() => handleEdit(member)}>
                        <h3>{member.dienstgrad} {member.vorname} {member.nachname}</h3>
                        <p>Status: {member.status}</p>
                        <p>Phone: {member.telefonnummer}</p>
                        <p>Entry Date: {member.eintrittsdatum}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Members;