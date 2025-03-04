const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { authenticateToken, checkPermission } = require('../middleware/auth');
const pool = require('../db');

// Get users from a specific department
router.get('/department/:departmentId', 
    authenticateToken, 
    checkPermission('manage_users'),
    async (req, res) => {
        try {
            const { departmentId } = req.params;

            // Check if user has access to this department
            const hasAccess = req.user.roles.some(r => 
                r.department_id === parseInt(departmentId) || 
                req.user.isLFV
            );

            if (!hasAccess) {
                return res.status(403).json({ message: 'Not authorized to view users of this department' });
            }

            const [users] = await pool.query(`
                SELECT u.*, 
                    GROUP_CONCAT(p.id) as permission_ids,
                    GROUP_CONCAT(p.name) as permission_names
                FROM users u
                LEFT JOIN user_permissions up ON u.id = up.user_id
                LEFT JOIN permissions p ON up.permission_id = p.id
                WHERE u.department_id = ?
                GROUP BY u.id
            `, [departmentId]);

            const formattedUsers = users.map(user => ({
                ...user,
                permissions: user.permission_ids ? 
                    user.permission_ids.split(',').map((id, index) => ({
                        id: parseInt(id),
                        name: user.permission_names.split(',')[index]
                    })) : []
            }));

            res.json(formattedUsers);
        } catch (error) {
            console.error('Error fetching users:', error);
            res.status(500).json({ message: 'Server error' });
        }
});

// Create new user
router.post('/', 
    authenticateToken, 
    checkPermission('manage_users'),
    async (req, res) => {
        try {
            const { username, password, member_id, role, is_active, department_id, permissions } = req.body;

            // Check if user has access to this department
            const hasAccess = req.user.roles.some(r => 
                r.department_id === parseInt(department_id) || 
                req.user.isLFV
            );

            if (!hasAccess) {
                return res.status(403).json({ message: 'Not authorized to create users in this department' });
            }

            // Hash password
            const hashedPassword = await bcrypt.hash(password, 10);

            // Start transaction
            const conn = await pool.getConnection();
            try {
                await conn.beginTransaction();

                // Insert user
                const [userResult] = await conn.query(
                    'INSERT INTO users (username, password, member_id, role, is_active, department_id) VALUES (?, ?, ?, ?, ?, ?)',
                    [username, hashedPassword, member_id, role, is_active, department_id]
                );

                // Insert permissions
                if (permissions && permissions.length > 0) {
                    const permissionValues = permissions.map(permissionId => [userResult.insertId, permissionId, req.user.id]);
                    await conn.query(
                        'INSERT INTO user_permissions (user_id, permission_id, granted_by) VALUES ?',
                        [permissionValues]
                    );
                }

                await conn.commit();
                res.status(201).json({ message: 'User created successfully', userId: userResult.insertId });
            } catch (error) {
                await conn.rollback();
                throw error;
            } finally {
                conn.release();
            }
        } catch (error) {
            console.error('Error creating user:', error);
            res.status(500).json({ message: 'Server error' });
        }
});

// Update user
router.put('/:id', 
    authenticateToken, 
    checkPermission('manage_users'),
    async (req, res) => {
        try {
            const { id } = req.params;
            const { username, member_id, role, is_active, department_id, permissions } = req.body;

            // Check if user exists and get their department
            const [user] = await pool.query('SELECT department_id FROM users WHERE id = ?', [id]);
            if (!user.length) {
                return res.status(404).json({ message: 'User not found' });
            }

            // Check if user has access to both current and target departments
            const hasAccess = req.user.roles.some(r => 
                (r.department_id === user[0].department_id || r.department_id === parseInt(department_id)) || 
                req.user.isLFV
            );

            if (!hasAccess) {
                return res.status(403).json({ message: 'Not authorized to modify this user' });
            }

            // Start transaction
            const conn = await pool.getConnection();
            try {
                await conn.beginTransaction();

                // Update user
                await conn.query(
                    'UPDATE users SET username = ?, member_id = ?, role = ?, is_active = ?, department_id = ? WHERE id = ?',
                    [username, member_id, role, is_active, department_id, id]
                );

                // Update permissions
                await conn.query('DELETE FROM user_permissions WHERE user_id = ?', [id]);

                if (permissions && permissions.length > 0) {
                    const permissionValues = permissions.map(permissionId => [id, permissionId, req.user.id]);
                    await conn.query(
                        'INSERT INTO user_permissions (user_id, permission_id, granted_by) VALUES ?',
                        [permissionValues]
                    );
                }

                await conn.commit();
                res.json({ message: 'User updated successfully' });
            } catch (error) {
                await conn.rollback();
                throw error;
            } finally {
                conn.release();
            }
        } catch (error) {
            console.error('Error updating user:', error);
            res.status(500).json({ message: 'Server error' });
        }
});

// Reset password
router.post('/:id/reset-password', 
    authenticateToken, 
    checkPermission('manage_users'),
    async (req, res) => {
        try {
            const { id } = req.params;
            const { password } = req.body;

            // Check if user exists and get their department
            const [user] = await pool.query('SELECT department_id FROM users WHERE id = ?', [id]);
            if (!user.length) {
                return res.status(404).json({ message: 'User not found' });
            }

            // Check if user has access to this department
            const hasAccess = req.user.roles.some(r => 
                r.department_id === user[0].department_id || 
                req.user.isLFV
            );

            if (!hasAccess) {
                return res.status(403).json({ message: 'Not authorized to reset password for this user' });
            }

            // Hash new password
            const hashedPassword = await bcrypt.hash(password, 10);

            // Update password
            await pool.query('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, id]);

            res.json({ message: 'Password reset successfully' });
        } catch (error) {
            console.error('Error resetting password:', error);
            res.status(500).json({ message: 'Server error' });
        }
});

module.exports = router;