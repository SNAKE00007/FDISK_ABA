import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/api';

const MembersList = () => {
    const { auth } = useAuth();
    const [members, setMembers] = useState([]);

    useEffect(() => {
        const fetchMembers = async () => {
            try {
                const response = await api.get('/members');
                setMembers(response.data);
            } catch (error) {
                console.error('Error fetching members:', error);
            }
        };

        fetchMembers();
    }, []);

    return (
        <div className="members-list">
            <h2>Members - {auth.user.department_name}</h2>
            <table>
                <thead>
                    <tr>
                        <th>Rank</th>
                        <th>First Name</th>
                        <th>Last Name</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {members.map(member => (
                        <tr key={member.id}>
                            <td>{member.dienstgrad}</td>
                            <td>{member.vorname}</td>
                            <td>{member.nachname}</td>
                            <td>{member.status}</td>
                            <td>
                                <button onClick={() => handleEdit(member)}>Edit</button>
                                <button onClick={() => handleDelete(member.id)}>Delete</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default MembersList;