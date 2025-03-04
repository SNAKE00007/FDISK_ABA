const express = require('express');
const router = express.Router();
const db = require('../db');
const { authenticateToken, checkPermission, checkBFVAccess, checkDepartmentAccess } = require('../middleware/auth');

// Get commander history for a department
router.get('/departments/:department_id/commanders', 
    authenticateToken, 
    checkDepartmentAccess('department_id'),
    async (req, res) => {
        try {
            const [history] = await db.query(`
                SELECT 
                    ch.*,
                    u.username,
                    u.first_name,
                    u.last_name,
                    assigned.username as assigned_by_username,
                    r.name as role_name
                FROM commander_history ch
                JOIN users u ON ch.user_id = u.id
                JOIN users assigned ON ch.assigned_by = assigned.id
                JOIN user_roles ur ON ch.user_id = ur.user_id AND ur.department_id = ch.department_id
                JOIN roles r ON ur.role_id = r.id
                WHERE ch.department_id = ?
                ORDER BY ch.start_date DESC
            `, [req.params.department_id]);
            
            res.json(history);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Server error' });
        }
    }
);

// Assign new commander to department
router.post('/departments/:department_id/commander',
    authenticateToken,
    checkPermission('assign_commander'),
    checkDepartmentAccess('department_id'),
    async (req, res) => {
        const conn = await db.getConnection();
        try {
            await conn.beginTransaction();

            const { user_id, role_type } = req.body; // role_type can be 'HBI' or 'OBI'
            const department_id = req.params.department_id;

            // Validate role_type
            if (!['HBI', 'OBI'].includes(role_type)) {
                throw new Error('Invalid role type. Must be either HBI or OBI');
            }

            // End current commander's term
            await conn.query(
                'UPDATE commander_history SET end_date = NOW() WHERE department_id = ? AND end_date IS NULL',
                [department_id]
            );

            // Add new commander history entry
            await conn.query(
                'INSERT INTO commander_history (department_id, user_id, assigned_by) VALUES (?, ?, ?)',
                [department_id, user_id, req.user.id]
            );

            // Get role ID
            const [role] = await conn.query('SELECT id FROM roles WHERE name = ?', [role_type]);
            if (role.length === 0) {
                throw new Error(`${role_type} role not found`);
            }

            // Deactivate previous commander roles for this department
            await conn.query(`
                UPDATE user_roles 
                SET is_active = false 
                WHERE department_id = ? AND role_id IN (
                    SELECT id FROM roles WHERE name IN ('HBI', 'OBI')
                ) AND user_id != ?
            `, [department_id, user_id]);

            // Add or activate new commander role
            const [existingRole] = await conn.query(`
                SELECT id FROM user_roles 
                WHERE user_id = ? AND department_id = ? AND role_id = ?
            `, [user_id, department_id, role[0].id]);

            if (existingRole.length > 0) {
                await conn.query(
                    'UPDATE user_roles SET is_active = true WHERE id = ?',
                    [existingRole[0].id]
                );
            } else {
                await conn.query(`
                    INSERT INTO user_roles (user_id, role_id, department_id, assigned_by)
                    VALUES (?, ?, ?, ?)
                `, [user_id, role[0].id, department_id, req.user.id]);
            }

            await conn.commit();
            res.status(200).json({ message: `${role_type} assigned successfully` });
        } catch (error) {
            await conn.rollback();
            console.error(error);
            res.status(500).json({ message: error.message || 'Server error' });
        } finally {
            conn.release();
        }
    }
);

// Get departments without active commanders
router.get('/departments/without-commander',
    authenticateToken,
    checkPermission('view_departments'),
    async (req, res) => {
        try {
            const [departments] = await db.query(`
                SELECT d.*, a.name as abschnitt_name, b.name as bfv_name
                FROM departments d
                LEFT JOIN abschnitte a ON d.abschnitt_id = a.id
                LEFT JOIN bfvs b ON a.bfv_id = b.id
                WHERE NOT EXISTS (
                    SELECT 1 FROM commander_history ch
                    WHERE ch.department_id = d.id
                    AND ch.end_date IS NULL
                )
                ORDER BY b.name, a.name, d.name
            `);
            
            res.json(departments);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Server error' });
        }
    }
);

// Get available commander roles for a department
router.get('/departments/:department_id/available-roles',
    authenticateToken,
    checkDepartmentAccess('department_id'),
    async (req, res) => {
        try {
            // Check which commander roles (HBI/OBI) are not currently active in the department
            const [activeRoles] = await db.query(`
                SELECT r.name
                FROM user_roles ur
                JOIN roles r ON ur.role_id = r.id
                WHERE ur.department_id = ?
                AND ur.is_active = true
                AND r.name IN ('HBI', 'OBI')
            `, [req.params.department_id]);

            const availableRoles = ['HBI', 'OBI'].filter(role => 
                !activeRoles.some(activeRole => activeRole.name === role)
            );

            res.json(availableRoles);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Server error' });
        }
    }
);

module.exports = router; 