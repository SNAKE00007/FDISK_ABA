const express = require('express');
const router = express.Router();
const db = require('../db');
const { verifyToken } = require('../middleware/auth');

router.use(verifyToken);

router.get('/', async (req, res) => {
    try {
        const members = await db.query(
            'SELECT * FROM members WHERE department_id = ? ORDER BY nachname, vorname',
            [req.departmentId]
        );
        res.json(members);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ message: 'Error fetching members' });
    }
});

router.post('/', async (req, res) => {
    try {
        const { dienstgrad, vorname, nachname, geburtsdatum, eintrittsdatum, telefonnummer, status } = req.body;
        
        const result = await db.query(
            'INSERT INTO members (department_id, dienstgrad, vorname, nachname, geburtsdatum, eintrittsdatum, telefonnummer, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [req.departmentId, dienstgrad, vorname, nachname, geburtsdatum, eintrittsdatum, telefonnummer, status]
        );
        
        res.status(201).json({
            id: result.insertId,
            department_id: req.departmentId,
            dienstgrad,
            vorname,
            nachname,
            geburtsdatum,
            eintrittsdatum,
            telefonnummer,
            status
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ message: 'Error creating member' });
    }
});

// Continue with PUT and DELETE endpoints?
router.put('/:id', async (req, res) => {
    try {
        const { dienstgrad, vorname, nachname, geburtsdatum, eintrittsdatum, telefonnummer, status } = req.body;
        
        // Verify department ownership
        const [member] = await db.query(
            'SELECT * FROM members WHERE id = ? AND department_id = ?',
            [req.params.id, req.departmentId]
        );

        if (!member) {
            return res.status(404).json({ message: 'Member not found or access denied' });
        }

        await db.query(
            'UPDATE members SET dienstgrad = ?, vorname = ?, nachname = ?, geburtsdatum = ?, eintrittsdatum = ?, telefonnummer = ?, status = ? WHERE id = ? AND department_id = ?',
            [dienstgrad, vorname, nachname, geburtsdatum, eintrittsdatum, telefonnummer, status, req.params.id, req.departmentId]
        );
        
        res.json({
            id: req.params.id,
            department_id: req.departmentId,
            dienstgrad,
            vorname,
            nachname,
            geburtsdatum,
            eintrittsdatum,
            telefonnummer,
            status
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ message: 'Error updating member' });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        // Verify department ownership
        const [member] = await db.query(
            'SELECT * FROM members WHERE id = ? AND department_id = ?',
            [req.params.id, req.departmentId]
        );

        if (!member) {
            return res.status(404).json({ message: 'Member not found or access denied' });
        }

        await db.query(
            'DELETE FROM members WHERE id = ? AND department_id = ?', 
            [req.params.id, req.departmentId]
        );
        
        res.json({ message: 'Member deleted successfully' });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ message: 'Error deleting member' });
    }
});

module.exports = router;