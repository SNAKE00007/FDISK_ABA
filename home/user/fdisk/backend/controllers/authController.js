const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { db } = require('../index');

exports.login = async (req, res) => {
    const { username, password } = req.body;

    try {
        const [results] = await db.promise().query('SELECT * FROM users WHERE username = ?', [username]);

        if (results.length === 0) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const user = results[0];
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.json({ token, user: { id: user.id, username: user.username, role: user.role } });
    } catch (error) {
        return res.status(500).json({ message: 'Server error' });
    }
};