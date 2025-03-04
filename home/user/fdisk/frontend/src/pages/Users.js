import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import '../styles/Users.css';

const Users = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [members, setMembers] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    member_id: '',
    role: '',
    is_active: true,
    permissions: []
  });

  // Fetch users from the same department as the logged-in user
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get(`/api/users/department/${user.department_id}`);
        setUsers(response.data);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };

    fetchUsers();
  }, [user.department_id]);

  // Fetch available members from the same department
  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const response = await axios.get(`/api/members/department/${user.department_id}`);
        setMembers(response.data);
      } catch (error) {
        console.error('Error fetching members:', error);
      }
    };

    fetchMembers();
  }, [user.department_id]);

  // Fetch available permissions
  useEffect(() => {
    const fetchPermissions = async () => {
      try {
        const response = await axios.get('/api/permissions');
        setPermissions(response.data);
      } catch (error) {
        console.error('Error fetching permissions:', error);
      }
    };

    fetchPermissions();
  }, []);

  const handleCreate = () => {
    setSelectedUser(null);
    setFormData({
      username: '',
      member_id: '',
      role: '',
      is_active: true,
      permissions: []
    });
    setIsModalOpen(true);
  };

  const handleEdit = (user) => {
    setSelectedUser(user);
    setFormData({
      username: user.username,
      member_id: user.member_id,
      role: user.role,
      is_active: user.is_active,
      permissions: user.permissions.map(p => p.id)
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const userData = {
        ...formData,
        department_id: user.department_id
      };

      if (!selectedUser) {
        // Creating new user
        userData.password = 'CHANGEME';
        await axios.post('/api/users', userData);
      } else {
        // Updating existing user
        await axios.put(`/api/users/${selectedUser.id}`, userData);
      }

      // Refresh users list
      const response = await axios.get(`/api/users/department/${user.department_id}`);
      setUsers(response.data);
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error saving user:', error);
    }
  };

  const handleResetPassword = async (userId) => {
    try {
      await axios.post(`/api/users/${userId}/reset-password`, {
        password: 'CHANGEME'
      });
      alert('Password has been reset to CHANGEME');
    } catch (error) {
      console.error('Error resetting password:', error);
    }
  };

  const handlePermissionChange = (permissionId) => {
    setFormData(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permissionId)
        ? prev.permissions.filter(id => id !== permissionId)
        : [...prev.permissions, permissionId]
    }));
  };

  return (
    <div className="users-page">
      <div className="users-header">
        <h1>Users Management</h1>
        <button onClick={handleCreate} className="create-button">Create New User</button>
      </div>

      <table className="users-table">
        <thead>
          <tr>
            <th>Username</th>
            <th>Role</th>
            <th>Member</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user.id}>
              <td>{user.username}</td>
              <td>{user.role}</td>
              <td>
                {members.find(m => m.id === user.member_id)?.dienstgrad || 'None'}
              </td>
              <td className={user.is_active ? 'status-active' : 'status-inactive'}>
                {user.is_active ? 'Active' : 'Inactive'}
              </td>
              <td>
                <button onClick={() => handleEdit(user)} className="edit-button">Edit</button>
                <button onClick={() => handleResetPassword(user.id)} className="reset-button">Reset Password</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>{selectedUser ? 'Edit User' : 'Create New User'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="close-button">&times;</button>
            </div>
            <form onSubmit={handleSubmit} className="user-form">
              <div className="form-group">
                <label>Username</label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Member</label>
                <select
                  value={formData.member_id}
                  onChange={(e) => setFormData({ ...formData, member_id: e.target.value })}
                >
                  <option value="">Select a member</option>
                  {members.map(member => (
                    <option key={member.id} value={member.id}>
                      {member.dienstgrad} - {member.vorname} {member.nachname}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Role</label>
                <input
                  type="text"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  />
                  Active
                </label>
              </div>

              <div className="form-group">
                <label>Permissions</label>
                <div className="permissions-list">
                  {permissions.map(permission => (
                    <label key={permission.id} className="permission-checkbox">
                      <input
                        type="checkbox"
                        checked={formData.permissions.includes(permission.id)}
                        onChange={() => handlePermissionChange(permission.id)}
                      />
                      {permission.name}
                    </label>
                  ))}
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" onClick={() => setIsModalOpen(false)} className="cancel-button">Cancel</button>
                <button type="submit" className="save-button">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;