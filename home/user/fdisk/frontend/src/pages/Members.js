import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Sidebar from '../components/Sidebar';
import '../styles/Members.css';

const Members = () => {
    const { auth } = useAuth();
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
        if (auth?.token) {
            fetchMembers();
        }
    }, [auth]);

    const fetchMembers = async () => {
        try {
            if (!auth?.token) {
                throw new Error('Not authenticated');
            }

            const response = await fetch('http://10.0.0.130:5000/api/members', {
                headers: { 
                    'Authorization': `Bearer ${auth.token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch members');
            }

            const data = await response.json();
            setMembers(data);
        } catch (error) {
            console.error('Error fetching members:', error);
        }
    };

    const handleSearch = (event) => {
        setSearchTerm(event.target.value);
    };

    const handleDelete = async (memberId) => {
        if (!window.confirm('Sind Sie sicher, dass Sie dieses Mitglied löschen möchten?')) {
            return;
        }

        try {
            if (!auth?.token) {
                throw new Error('Not authenticated');
            }

            const response = await fetch(`http://10.0.0.130:5000/api/members/${memberId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${auth.token}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to delete member');
            }

            await fetchMembers();
        } catch (error) {
            console.error('Error deleting member:', error);
            alert(error.message);
        }
    };

    const filteredMembers = members.filter(member =>
        member.nachname.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.vorname.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (!auth?.token) {
                throw new Error('Not authenticated');
            }

            const url = editingId 
                ? `http://10.0.0.130:5000/api/members/${editingId}`
                : 'http://10.0.0.130:5000/api/members';
                
            const method = editingId ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${auth.token}`
                },
                body: JSON.stringify(formData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to save member');
            }

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
        console.log('Member data received:', member);
        console.log('Dates:', {
            geburtsdatum: member.geburtsdatum,
            eintrittsdatum: member.eintrittsdatum
        });
        
        // Try to ensure dates are in correct format
        const formattedData = {
            ...member,
            geburtsdatum: member.geburtsdatum ? member.geburtsdatum.split('T')[0] : '',
            eintrittsdatum: member.eintrittsdatum ? member.eintrittsdatum.split('T')[0] : ''
        };
        
        console.log('Formatted data:', formattedData);
        setFormData(formattedData);
        setEditingId(member.id);
        setShowForm(true);
    };

    const formatDateForDisplay = (dateStr) => {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}.${month}.${year}`;
    };

    return (
        <>
            <Sidebar />
            <div className="members-page">
                <div className="members-header">
                    <h1>Mitgliederverwaltung</h1>
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
                    }}>Neues Mitglied hinzufügen</button>
                </div>

                <div className="search-bar">
                    <input
                        type="text"
                        placeholder="Mitglieder suchen..."
                        value={searchTerm}
                        onChange={handleSearch}
                    />
                </div>

                {showForm && (
                    <form onSubmit={handleSubmit} className="member-form">
                        <h2>{editingId ? 'Mitglied bearbeiten' : 'Neues Mitglied'}</h2>
                        <div className="form-group">
                            <label>Vorname:</label>
                            <input
                                type="text"
                                value={formData.vorname}
                                onChange={(e) => setFormData({...formData, vorname: e.target.value})}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Nachname:</label>
                            <input
                                type="text"
                                value={formData.nachname}
                                onChange={(e) => setFormData({...formData, nachname: e.target.value})}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Dienstgrad:</label>
                            <select
                                value={formData.dienstgrad}
                                onChange={(e) => setFormData({...formData, dienstgrad: e.target.value})}
                                required
                            >
                                <option value="">Dienstgrad auswählen</option>
                                <option value="JFM">JFM</option>
                                <option value="PFM">PFM</option>
                                <option value="FM">FM</option>
                                <option value="OFM">OFM</option>
                                <option value="HFM">HFM</option>
                                <option value="LM">LM</option>
                                <option value="OLM">OLM</option>
                                <option value="HLM">HLM</option>
                                <option value="BM">BM</option>
                                <option value="OBM">OBM</option>
                                <option value="HBM">HBM</option>
                                <option value="LM d. V.">LM d. V.</option>
                                <option value="LM d. F.">LM d. F.</option>
                                <option value="OLM d. V.">OLM d. V.</option>
                                <option value="OLM d. F.">OLM d. F.</option>
                                <option value="HLM d. V.">HLM d. V.</option>
                                <option value="HLM d. F.">HLM d. F.</option>
                                <option value="BM d. V.">BM d. V.</option>
                                <option value="BM d. F.">BM d. F.</option>
                                <option value="OBM d. V.">OBM d. V.</option>
                                <option value="OBM d. F.">OBM d. F.</option>
                                <option value="HBM d. V.">HBM d. V.</option>
                                <option value="HBM d. F.">HBM d. F.</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Geburtsdatum:</label>
                            <input
                                type="date"
                                value={formData.geburtsdatum || ''}
                                onChange={(e) => setFormData({...formData, geburtsdatum: e.target.value})}
                            />
                        </div>
                        <div className="form-group">
                            <label>Eintrittsdatum:</label>
                            <input
                                type="date"
                                value={formData.eintrittsdatum || ''}
                                onChange={(e) => setFormData({...formData, eintrittsdatum: e.target.value})}
                            />
                        </div>
                        <div className="form-group">
                            <label>Telefonnummer:</label>
                            <input
                                type="tel"
                                value={formData.telefonnummer || ''}
                                onChange={(e) => setFormData({...formData, telefonnummer: e.target.value})}
                            />
                        </div>
                        <div className="form-group">
                            <label>Status:</label>
                            <select
                                value={formData.status}
                                onChange={(e) => setFormData({...formData, status: e.target.value})}
                            >
                                <option value="active">Aktiv</option>
                                <option value="inactive">Inaktiv</option>
                                <option value="reserve">Reserve</option>
                            </select>
                        </div>
                        <div className="form-actions">
                            <button type="submit">{editingId ? 'Aktualisieren' : 'Erstellen'}</button>
                            <button type="button" onClick={() => setShowForm(false)}>Abbrechen</button>
                        </div>
                    </form>
                )}

                <div className="table-container">
                    <table className="members-table">
                        <thead>
                            <tr>
                                <th>Dienstgrad</th>
                                <th>Vorname</th>
                                <th>Nachname</th>
                                <th>Geburtsdatum</th>
                                <th>Eintrittsdatum</th>
                                <th>Telefonnummer</th>
                                <th>Status</th>
                                <th>Aktionen</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredMembers.map(member => (
                                <tr key={member.id}>
                                    <td>{member.dienstgrad}</td>
                                    <td>{member.vorname}</td>
                                    <td>{member.nachname}</td>
                                    <td>{formatDateForDisplay(member.geburtsdatum)}</td>
                                    <td>{formatDateForDisplay(member.eintrittsdatum)}</td>
                                    <td>{member.telefonnummer}</td>
                                    <td>{member.status === 'active' ? 'Aktiv' : member.status === 'inactive' ? 'Inaktiv' : 'Reserve'}</td>
                                    <td>
                                        <button onClick={() => handleEdit(member)}>Bearbeiten</button>
                                        <button 
                                            onClick={() => handleDelete(member.id)}
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

export default Members;