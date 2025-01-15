import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/api';

const Dashboard = () => {
    const { auth } = useAuth();
    const [reports, setReports] = useState([]);
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDepartmentData = async () => {
            try {
                const [reportsRes, membersRes] = await Promise.all([
                    api.get('/reports'),
                    api.get('/members')
                ]);
                setReports(reportsRes.data);
                setMembers(membersRes.data);
            } catch (error) {
                console.error('Error fetching department data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchDepartmentData();
    }, []);

    if (loading) return <div>Loading...</div>;

    return (
        <div className="dashboard">
            <h2>Welcome to {auth.user.department_name}</h2>
            <div className="dashboard-stats">
                <div className="stat-card">
                    <h3>Total Reports</h3>
                    <p>{reports.length}</p>
                </div>
                <div className="stat-card">
                    <h3>Active Members</h3>
                    <p>{members.filter(m => m.status === 'active').length}</p>
                </div>
            </div>
            {/* Additional dashboard content */}
        </div>
    );
};

export default Dashboard;