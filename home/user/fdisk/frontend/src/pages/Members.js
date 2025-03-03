import React, { useState, useEffect } from 'react';
import { getMembers, createMember, updateMember } from '../services/members';
import Sidebar from '../components/Sidebar';
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

            const response = await fetch('http://10.0.0.130:5000/api/members', {  // Update URL to match your backend
                headers: { 
                    'Authorization': userData.token,  // Remove template literal
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
                ? `http://10.0.0.130:5000/api/members/${editingId}`
                : 'http://10.0.0.130:5000/api/members';
                
            const method = editingId ? 'PUT' : 'POST';
            
            const userData = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null;
            if (!userData || !userData.token) {
                throw new Error('Not authenticated');
            }

            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': userData.token
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
        // Format dates from DD.MM.YYYY to YYYY-MM-DD if they exist
        const formatDate = (dateStr) => {
            if (!dateStr) return '';
            const [day, month, year] = dateStr.split('.');
            return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
        };

        setFormData({
            ...member,
            geburtsdatum: formatDate(member.geburtsdatum),
            eintrittsdatum: formatDate(member.eintrittsdatum)
        });
        setEditingId(member.id);
        setShowForm(true);
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
                            </select>
                        </div>
                        <div className="form-actions">
                            <button type="submit">{editingId ? 'Änderungen speichern' : 'Erstellen'}</button>
                            <button type="button" onClick={() => {
                                setShowForm(false);
                                setEditingId(null);
                                setFormData({
                                    vorname: '',
                                    nachname: '',
                                    dienstgrad: '',
                                    geburtsdatum: '',
                                    eintrittsdatum: '',
                                    telefonnummer: '',
                                    status: 'active'
                                });
                            }}>Abbrechen</button>
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
                                <th>Telefon</th>
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
                                    <td>{member.geburtsdatum}</td>
                                    <td>{member.eintrittsdatum}</td>
                                    <td>{member.telefonnummer}</td>
                                    <td>{member.status === 'active' ? 'Aktiv' : 'Inaktiv'}</td>
                                    <td>
                                        <button onClick={() => handleEdit(member)}>Bearbeiten</button>
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