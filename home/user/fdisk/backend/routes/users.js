const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { authenticateToken, checkPermission } = require('../middleware/auth');
const pool = require('../db');

// Get users from a specific department
router.get('/department/:departmentId', authenticateToken, async (req, res) => {
  try {
    const { departmentId } = req.params;
    
    // Check if user has permission to view users or is HBI of the department
    const hasPermission = await checkPermission(req.user.id, 'manage_users');
    const isHBI = req.user.role === 'HBI' && req.user.department_id === parseInt(departmentId);
    
    if (!hasPermission && !isHBI) {
      return res.status(403).json({ message: 'Insufficient permissions' });
    }

    const query = `
      SELECT u.*, 
             array_agg(json_build_object('id', p.id, 'name', p.name)) as permissions
      FROM users u
      LEFT JOIN user_permissions up ON u.id = up.user_id
      LEFT JOIN permissions p ON up.permission_id = p.id
      WHERE u.department_id = $1
      GROUP BY u.id
    `;
    
    const result = await pool.query(query, [departmentId]);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new user
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { username, password, member_id, role, is_active, department_id, permissions } = req.body;
    
    // Check permissions
    const hasPermission = await checkPermission(req.user.id, 'manage_users');
    const isHBI = req.user.role === 'HBI' && req.user.department_id === department_id;
    
    if (!hasPermission && !isHBI) {
      return res.status(403).json({ message: 'Insufficient permissions' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Start transaction
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Insert user
      const userResult = await client.query(
        'INSERT INTO users (username, password, member_id, role, is_active, department_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
        [username, hashedPassword, member_id, role, is_active, department_id]
      );

      const userId = userResult.rows[0].id;

      // Insert permissions
      if (permissions && permissions.length > 0) {
        const permissionValues = permissions.map(permissionId => 
          `(${userId}, ${permissionId}, ${req.user.id})`
        ).join(',');
        
        await client.query(`
          INSERT INTO user_permissions (user_id, permission_id, granted_by)
          VALUES ${permissionValues}
        `);
      }

      await client.query('COMMIT');
      res.status(201).json({ message: 'User created successfully' });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { username, member_id, role, is_active, department_id, permissions } = req.body;
    
    // Check if user exists and get their department
    const userCheck = await pool.query('SELECT department_id FROM users WHERE id = $1', [id]);
    if (userCheck.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check permissions
    const hasPermission = await checkPermission(req.user.id, 'manage_users');
    const isHBI = req.user.role === 'HBI' && req.user.department_id === userCheck.rows[0].department_id;
    
    if (!hasPermission && !isHBI) {
      return res.status(403).json({ message: 'Insufficient permissions' });
    }

    // Start transaction
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Update user
      await client.query(
        'UPDATE users SET username = $1, member_id = $2, role = $3, is_active = $4, department_id = $5 WHERE id = $6',
        [username, member_id, role, is_active, department_id, id]
      );

      // Update permissions
      await client.query('DELETE FROM user_permissions WHERE user_id = $1', [id]);
      
      if (permissions && permissions.length > 0) {
        const permissionValues = permissions.map(permissionId => 
          `(${id}, ${permissionId}, ${req.user.id})`
        ).join(',');
        
        await client.query(`
          INSERT INTO user_permissions (user_id, permission_id, granted_by)
          VALUES ${permissionValues}
        `);
      }

      await client.query('COMMIT');
      res.json({ message: 'User updated successfully' });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Reset password
router.post('/:id/reset-password', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { password } = req.body;

    // Check if user exists and get their department
    const userCheck = await pool.query('SELECT department_id FROM users WHERE id = $1', [id]);
    if (userCheck.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check permissions
    const hasPermission = await checkPermission(req.user.id, 'manage_users');
    const isHBI = req.user.role === 'HBI' && req.user.department_id === userCheck.rows[0].department_id;
    
    if (!hasPermission && !isHBI) {
      return res.status(403).json({ message: 'Insufficient permissions' });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update password
    await pool.query('UPDATE users SET password = $1 WHERE id = $2', [hashedPassword, id]);
    
    res.json({ message: 'Password reset successfully' });
  } catch (error) {
    console.error('Error resetting password:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;