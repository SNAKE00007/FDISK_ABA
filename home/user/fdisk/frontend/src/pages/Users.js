import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Checkbox } from 'semantic-ui-react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

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

  const handleSubmit = async () => {
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
    <div>
      <h1>Users Management</h1>
      <Button primary onClick={handleCreate}>Create New User</Button>

      <Table celled>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell>Username</Table.HeaderCell>
            <Table.HeaderCell>Role</Table.HeaderCell>
            <Table.HeaderCell>Member</Table.HeaderCell>
            <Table.HeaderCell>Status</Table.HeaderCell>
            <Table.HeaderCell>Actions</Table.HeaderCell>
          </Table.Row>
        </Table.Header>

        <Table.Body>
          {users.map(user => (
            <Table.Row key={user.id}>
              <Table.Cell>{user.username}</Table.Cell>
              <Table.Cell>{user.role}</Table.Cell>
              <Table.Cell>
                {members.find(m => m.id === user.member_id)?.dienstgrad || 'None'}
              </Table.Cell>
              <Table.Cell>{user.is_active ? 'Active' : 'Inactive'}</Table.Cell>
              <Table.Cell>
                <Button onClick={() => handleEdit(user)}>Edit</Button>
                <Button onClick={() => handleResetPassword(user.id)}>Reset Password</Button>
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table>

      <Modal open={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <Modal.Header>{selectedUser ? 'Edit User' : 'Create New User'}</Modal.Header>
        <Modal.Content>
          <Form>
            <Form.Input
              label="Username"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            />

            <Form.Select
              label="Member"
              options={members.map(member => ({
                key: member.id,
                text: `${member.dienstgrad} - ${member.vorname} ${member.nachname}`,
                value: member.id
              }))}
              value={formData.member_id}
              onChange={(e, { value }) => setFormData({ ...formData, member_id: value })}
            />

            <Form.Input
              label="Role"
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            />

            <Form.Checkbox
              label="Active"
              checked={formData.is_active}
              onChange={(e, { checked }) => setFormData({ ...formData, is_active: checked })}
            />

            <div className="field">
              <label>Permissions</label>
              {permissions.map(permission => (
                <div key={permission.id} className="permission-checkbox">
                  <Checkbox
                    label={permission.name}
                    checked={formData.permissions.includes(permission.id)}
                    onChange={() => handlePermissionChange(permission.id)}
                  />
                </div>
              ))}
            </div>
          </Form>
        </Modal.Content>
        <Modal.Actions>
          <Button onClick={() => setIsModalOpen(false)}>Cancel</Button>
          <Button primary onClick={handleSubmit}>Save</Button>
        </Modal.Actions>
      </Modal>
    </div>
  );
};

export default Users;