const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('../db');

exports.login = async (req, res) => {
    const { username, password } = req.body;

    try {
        console.log('Login attempt:', username);

        const [results] = await db.query(`
            SELECT u.*, m.* 
            FROM users u 
            LEFT JOIN members m ON u.member_id = m.id 
            WHERE u.username = ?
        `, [username]);

        if (results.length === 0) {
            console.log('User not found:', username);
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const user = results[0];
        // bcrypt.compare automatically detects rounds from hash
        const isPasswordValid = await bcrypt.compare(password, user.password);
        console.log('Password validation result:', isPasswordValid);

        if (!isPasswordValid) {
            console.log('Invalid password for user:', username);
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // ...existing code...
    } catch (error) {
        console.error('Server error during login:', error.message);
        console.error('Stack trace:', error.stack);
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};