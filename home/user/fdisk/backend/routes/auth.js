const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');

router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        const [user] = await db.query(`
            SELECT u.*, d.name as department_name, d.settings as department_settings 
            FROM users u
            JOIN departments d ON u.department_id = d.id
            WHERE u.username = ?
        `, [username]);

        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { 
                id: user.id, 
                role: user.role,
                department_id: user.department_id
            },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            token,
            user: {
                id: user.id,
                username: user.username,
                role: user.role,
                department_id: user.department_id,
                department_name: user.department_name,
                department_settings: user.department_settings
            }
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ message: 'Login failed' });
    }
});

module.exports = router;