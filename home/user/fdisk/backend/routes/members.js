const express = require('express');
const router = express.Router();
const db = require('../db');
const { authenticateToken } = require('../middleware/auth');

// Get all members
router.get('/', authenticateToken, async (req, res) => {
    try {
        const members = await db.query(
            'SELECT * FROM members WHERE department_id = ?', 
            [req.user.department_id]
        );
        res.json(members);
    } catch (error) {
        console.error('Error fetching members:', error);
        res.status(500).json({ message: 'Error fetching members' });
    }
});

// Get members by department
router.get('/department/:department_id', authenticateToken, async (req, res) => {
    try {
        // Check if user has access to this department
        const hasAccess = req.user.roles.some(r => 
            r.department_id === parseInt(req.params.department_id) || 
            req.user.isLFV
        );

        if (!hasAccess) {
            return res.status(403).json({ message: 'Not authorized to view members of this department' });
        }

        const members = await db.query(
            'SELECT * FROM members WHERE department_id = ?', 
            [req.params.department_id]
        );
        res.json(members);
    } catch (error) {
        console.error('Error fetching members:', error);
        res.status(500).json({ message: 'Error fetching members' });
    }
});

// Create member
router.post('/', authenticateToken, async (req, res) => {
    try {
        const { vorname, nachname, dienstgrad, geburtsdatum, eintrittsdatum, telefonnummer, status } = req.body;
        const result = await db.query(
            'INSERT INTO members (department_id, vorname, nachname, dienstgrad, geburtsdatum, eintrittsdatum, telefonnummer, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [req.user.department_id, vorname, nachname, dienstgrad, geburtsdatum, eintrittsdatum, telefonnummer, status]
        );
        res.status(201).json({ id: result.insertId, ...req.body });
    } catch (error) {
        console.error('Error creating member:', error);
        res.status(500).json({ message: 'Error creating member' });
    }
});

// Update member
router.put('/:id', authenticateToken, async (req, res) => {
    try {
        // First check if the member belongs to the user's department
        const [member] = await db.query(
            'SELECT department_id FROM members WHERE id = ?',
            [req.params.id]
        );

        if (!member || member.department_id !== req.user.department_id) {
            return res.status(403).json({ message: 'Not authorized to update this member' });
        }

        const { vorname, nachname, dienstgrad, geburtsdatum, eintrittsdatum, telefonnummer, status } = req.body;
        const result = await db.query(
            'UPDATE members SET vorname = ?, nachname = ?, dienstgrad = ?, geburtsdatum = ?, eintrittsdatum = ?, telefonnummer = ?, status = ? WHERE id = ? AND department_id = ?',
            [vorname, nachname, dienstgrad, geburtsdatum, eintrittsdatum, telefonnummer, status, req.params.id, req.user.department_id]
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

// Delete member
router.delete('/:id', authenticateToken, async (req, res) => {
    try {
        // First check if the member belongs to the user's department
        const [member] = await db.query(
            'SELECT department_id FROM members WHERE id = ?',
            [req.params.id]
        );

        if (!member || member.department_id !== req.user.department_id) {
            return res.status(403).json({ message: 'Not authorized to delete this member' });
        }

        const result = await db.query(
            'DELETE FROM members WHERE id = ? AND department_id = ?',
            [req.params.id, req.user.department_id]
        );

        if (result.affectedRows === 0) {
            res.status(404).json({ message: 'Member not found' });
        } else {
            res.json({ message: 'Member deleted successfully' });
        }
    } catch (error) {
        console.error('Error deleting member:', error);
        res.status(500).json({ message: 'Error deleting member' });
    }
});

module.exports = router;