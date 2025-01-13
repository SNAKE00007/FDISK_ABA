const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('../db');

exports.login = async (req, res) => {
    const { username, password } = req.body;

    try {
        console.log('Login attempt:', username);

        const results = await db.query(`
            SELECT u.*, m.* 
            FROM users u 
            LEFT JOIN members m ON u.member_id = m.id 
            WHERE u.username = ?
        `, [username]);

        console.log('Database results:', results);

        if (results.length === 0) {
            console.log('User not found:', username);
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const user = results[0];
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            console.log('Invalid password for user:', username);
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { id: user.id, role: user.role, member_id: user.member_id },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.json({
            token,
            user: {
                id: user.id,
                username: user.username,
                role: user.role,
                member: {
                    id: user.member_id,
                    vorname: user.vorname,
                    nachname: user.nachname,
                    dienstgrad: user.dienstgrad
                }
            }
        });
    } catch (error) {
        console.error('Server error during login:', error);
        return res.status(500).json({ message: 'Server error' });
    }
};