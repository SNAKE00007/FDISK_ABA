import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

const CommanderManagement = () => {
    const { user } = useAuth();
    const [departments, setDepartments] = useState([]);
    const [selectedDepartment, setSelectedDepartment] = useState(null);
    const [commanderHistory, setCommanderHistory] = useState([]);
    const [availableRoles, setAvailableRoles] = useState([]);
    const [selectedRole, setSelectedRole] = useState('');
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchDepartments();
    }, []);

    useEffect(() => {
        if (selectedDepartment) {
            fetchCommanderHistory(selectedDepartment);
            fetchAvailableRoles(selectedDepartment);
        }
    }, [selectedDepartment]);

    const fetchDepartments = async () => {
        try {
            const response = await axios.get('/api/commanders/departments/without-commander');
            setDepartments(response.data);
            setLoading(false);
        } catch (err) {
            setError('Failed to fetch departments');
            setLoading(false);
        }
    };

    const fetchCommanderHistory = async (departmentId) => {
        try {
            const response = await axios.get(`/api/commanders/departments/${departmentId}/commanders`);
            setCommanderHistory(response.data);
        } catch (err) {
            setError('Failed to fetch commander history');
        }
    };

    const fetchAvailableRoles = async (departmentId) => {
        try {
            const response = await axios.get(`/api/commanders/departments/${departmentId}/available-roles`);
            setAvailableRoles(response.data);
            if (response.data.length > 0) {
                setSelectedRole(response.data[0]);
            }
        } catch (err) {
            setError('Failed to fetch available roles');
        }
    };

    const fetchUsers = async (search) => {
        try {
            const response = await axios.get(`/api/users/search?q=${search}`);
            setUsers(response.data);
        } catch (err) {
            setError('Failed to fetch users');
        }
    };

    const assignCommander = async () => {
        if (!selectedDepartment || !selectedUser || !selectedRole) {
            setError('Please select all required fields');
            return;
        }

        try {
            await axios.post(`/api/commanders/departments/${selectedDepartment}/commander`, {
                user_id: selectedUser,
                role_type: selectedRole
            });

            // Refresh data
            fetchCommanderHistory(selectedDepartment);
            fetchAvailableRoles(selectedDepartment);
            fetchDepartments();

            // Reset selection
            setSelectedUser(null);
            setUsers([]);
        } catch (err) {
            setError('Failed to assign commander');
        }
    };

    if (loading) return <div>Loading...</div>;
    if (error) return <div className="text-red-500">{error}</div>;

    return (
        <div className="p-4">
            <h2 className="text-2xl font-bold mb-4">Commander Management</h2>

            {/* Department Selection */}
            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Select Department</label>
                <select
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    value={selectedDepartment || ''}
                    onChange={(e) => setSelectedDepartment(Number(e.target.value))}
                >
                    <option value="">Select a department...</option>
                    {departments.map((dept) => (
                        <option key={dept.id} value={dept.id}>
                            {dept.bfv_name} - {dept.abschnitt_name} - {dept.name}
                        </option>
                    ))}
                </select>
            </div>

            {selectedDepartment && (
                <>
                    {/* Role Selection */}
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700">Select Role</label>
                        <select
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            value={selectedRole}
                            onChange={(e) => setSelectedRole(e.target.value)}
                        >
                            {availableRoles.map((role) => (
                                <option key={role} value={role}>
                                    {role}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* User Search */}
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700">Search User</label>
                        <input
                            type="text"
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            placeholder="Search by name..."
                            onChange={(e) => fetchUsers(e.target.value)}
                        />
                        {users.length > 0 && (
                            <ul className="mt-2 border rounded-md">
                                {users.map((user) => (
                                    <li
                                        key={user.id}
                                        className="p-2 hover:bg-gray-100 cursor-pointer"
                                        onClick={() => setSelectedUser(user.id)}
                                    >
                                        {user.first_name} {user.last_name}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    {/* Assign Button */}
                    <button
                        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                        onClick={assignCommander}
                        disabled={!selectedUser || !selectedRole}
                    >
                        Assign Commander
                    </button>

                    {/* Commander History */}
                    <div className="mt-8">
                        <h3 className="text-xl font-semibold mb-4">Commander History</h3>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Commander
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Role
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Start Date
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            End Date
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Assigned By
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {commanderHistory.map((commander) => (
                                        <tr key={commander.id}>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {commander.first_name} {commander.last_name}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {commander.role_name}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {new Date(commander.start_date).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {commander.end_date
                                                    ? new Date(commander.end_date).toLocaleDateString()
                                                    : 'Current'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {commander.assigned_by_username}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default CommanderManagement; 