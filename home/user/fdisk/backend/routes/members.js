const express = require('express');
const router = express.Router();
const db = require('../db');
const { verifyToken } = require('../middleware/auth');

// Protect all routes with authentication
router.use(verifyToken);

// Get all members
router.get('/', async (req, res) => {
    try {
        const members = await db.query(
            'SELECT * FROM members WHERE department_id = ?', 
            [req.departmentId]
        );
        res.json(members);
    } catch (error) {
        console.error('Error fetching members:', error);
        res.status(500).json({ message: 'Error fetching members' });
    }
});

// Create member
router.post('/', async (req, res) => {
    try {
        const { vorname, nachname, dienstgrad, geburtsdatum, eintrittsdatum, telefonnummer, status } = req.body;
        const result = await db.query(
            'INSERT INTO members (department_id, vorname, nachname, dienstgrad, geburtsdatum, eintrittsdatum, telefonnummer, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [req.departmentId, vorname, nachname, dienstgrad, geburtsdatum, eintrittsdatum, telefonnummer, status]
        );
        res.status(201).json({ id: result.insertId, ...req.body });
    } catch (error) {
        console.error('Error creating member:', error);
        res.status(500).json({ message: 'Error creating member' });
    }
});

// Update member
router.put('/:id', async (req, res) => {
    try {
        const { vorname, nachname, dienstgrad, geburtsdatum, eintrittsdatum, telefonnummer, status } = req.body;
        const result = await db.query(
            'UPDATE members SET vorname = ?, nachname = ?, dienstgrad = ?, geburtsdatum = ?, eintrittsdatum = ?, telefonnummer = ?, status = ? WHERE id = ?',
            [vorname, nachname, dienstgrad, geburtsdatum, eintrittsdatum, telefonnummer, status, req.params.id]
        );
        if (result.affectedRows === 0) {
            res.status(404).json({ message: 'Member not found' });
        } else {
            res.json({ id: req.params.id, ...req.body });
        }
    } catch (error) {
        console.error('Error updating member:', error);
        res.status(500).json({ message: 'Error updating member' });
    }
});

module.exports = router;