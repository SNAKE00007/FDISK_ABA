const bcrypt = require('bcryptjs');
const { db } = require('../index');

exports.getAllUsers = (req, res) => {
    db.query('SELECT id, username, role, status, dienstgrad, vorname, nachname, geburtsdatum, eintrittsdatum, telefonnummer FROM users', (error, results) => {
        if (error) {
            return res.status(500).json({ message: 'Server error' });
        }
        res.json(results);
    });
};

exports.getUserById = (req, res) => {
    const { id } = req.params;
    db.query('SELECT id, username, role, status, dienstgrad, vorname, nachname, geburtsdatum, eintrittsdatum, telefonnummer FROM users WHERE id = ?', [id], (error, results) => {
        if (error) {
            return res.status(500).json({ message: 'Server error' });
        }
        if (results.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(results[0]);
    });
};

exports.createUser = async (req, res) => {
    const { username, password, role, status, dienstgrad, vorname, nachname, geburtsdatum, eintrittsdatum, telefonnummer } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    db.query('INSERT INTO users (username, password, role, status, dienstgrad, vorname, nachname, geburtsdatum, eintrittsdatum, telefonnummer) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [username, hashedPassword, role, status, dienstgrad, vorname, nachname, geburtsdatum, eintrittsdatum, telefonnummer],
        (error, result) => {
            if (error) {
                return res.status(500).json({ message: 'Server error' });
            }
            res.status(201).json({ message: 'User created successfully', userId: result.insertId });
        }
    );
};

exports.updateUser = async (req, res) => {
    const { id } = req.params;
    const { username, password, role, status, dienstgrad, vorname, nachname, geburtsdatum, eintrittsdatum, telefonnummer } = req.body;

    let updateQuery = 'UPDATE users SET username = ?, role = ?, status = ?, dienstgrad = ?, vorname = ?, nachname = ?, geburtsdatum = ?, eintrittsdatum = ?, telefonnummer = ?';
    let queryParams = [username, role, status, dienstgrad, vorname, nachname, geburtsdatum, eintrittsdatum, telefonnummer];

    if (password) {
        const hashedPassword = await bcrypt.hash(password, 10);
        updateQuery += ', password = ?';
        queryParams.push(hashedPassword);
    }

    updateQuery += ' WHERE id = ?';
    queryParams.push(id);

    db.query(updateQuery, queryParams, (error, result) => {
        if (error) {
            return res.status(500).json({ message: 'Server error' });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json({ message: 'User updated successfully' });
    });
};

exports.deleteUser = (req, res) => {
    const { id } = req.params;
    db.query('DELETE FROM users WHERE id = ?', [id], (error, result) => {
        if (error) {
            return res.status(500).json({ message: 'Server error' });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json({ message: 'User deleted successfully' });
    });
};