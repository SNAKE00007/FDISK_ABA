const express = require('express');
const router = express.Router();
const db = require('../db');

// Get all members
router.get('/', async (req, res) => {
    try {
        const members = await db.query('SELECT * FROM members');
        res.json(members);
    } catch (error) {
        console.error('Error fetching members:', error);
        res.status(500).json({ message: 'Error fetching members' });
    }
});

// Create member
router.post('/', async (req, res) => {
    try {
        const result = await db.query(
            'INSERT INTO members SET ?',
            [req.body]
        );
        res.status(201).json({ id: result.insertId, ...req.body });
    } catch (error) {
        console.error('Error creating member:', error);
        res.status(500).json({ message: 'Error creating member' });
    }
});

module.exports = router;