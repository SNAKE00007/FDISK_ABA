const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { db } = require('../index');

exports.login = async (req, res) => {
    const { username, password } = req.body;

    try {
        console.log('Login attempt:', username);

        const [results] = await db.promise().query('SELECT * FROM users WHERE username = ?', [username]);

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

        console.log('JWT_SECRET:', process.env.JWT_SECRET);
        const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });

        console.log('Login successful for user:', username);
        res.json({ token, user: { id: user.id, username: user.username, role: user.role } });
    } catch (error) {
        console.error('Server error during login:', error.message);
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};