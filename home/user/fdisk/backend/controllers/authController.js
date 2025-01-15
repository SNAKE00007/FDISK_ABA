const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('../db');

exports.login = async (req, res) => {
    const { username, password } = req.body;

    try {
        console.log('Login attempt:', username);

        const results = await db.query(`
            SELECT u.*, m.*, d.name as department_name 
            FROM users u 
            LEFT JOIN members m ON u.member_id = m.id 
            LEFT JOIN departments d ON u.department_id = d.id
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
            { 
                id: user.id, 
                role: user.role, 
                department_id: user.department_id,
                member_id: user.member_id 
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