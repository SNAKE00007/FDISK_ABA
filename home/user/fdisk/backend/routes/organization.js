const express = require('express');
const router = express.Router();
const db = require('../db');
const { authenticateToken, checkPermission } = require('../middleware/auth');

// Get all BFVs
router.get('/bfvs', authenticateToken, async (req, res) => {
    try {
        const [bfvs] = await db.query('SELECT * FROM bfvs ORDER BY name');
        res.json(bfvs);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get BFV by ID with its Abschnitte
router.get('/bfvs/:id', authenticateToken, async (req, res) => {
    try {
        const [bfv] = await db.query('SELECT * FROM bfvs WHERE id = ?', [req.params.id]);
        const [abschnitte] = await db.query('SELECT * FROM abschnitte WHERE bfv_id = ?', [req.params.id]);
        if (bfv.length === 0) {
            return res.status(404).json({ message: 'BFV not found' });
        }
        res.json({ ...bfv[0], abschnitte });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Create new BFV (LBD/LBDS only)
router.post('/bfvs', authenticateToken, checkPermission('manage_bfvs'), async (req, res) => {
    try {
        const { name } = req.body;
        const [result] = await db.query('INSERT INTO bfvs (name) VALUES (?)', [name]);
        res.status(201).json({ id: result.insertId, name });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get all Abschnitte
router.get('/abschnitte', authenticateToken, async (req, res) => {
    try {
        const [abschnitte] = await db.query(`
            SELECT a.*, b.name as bfv_name 
            FROM abschnitte a 
            JOIN bfvs b ON a.bfv_id = b.id 
            ORDER BY b.name, a.name
        `);
        res.json(abschnitte);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Create new Abschnitt (OBR/BR only)
router.post('/abschnitte', authenticateToken, checkPermission('manage_abschnitte'), async (req, res) => {
    try {
        const { name, bfv_id } = req.body;
        
        // Check if user has permission for this BFV
        const [userRole] = await db.query(
            'SELECT * FROM user_roles WHERE user_id = ? AND bfv_id = ? AND role_id IN (SELECT id FROM roles WHERE name IN ("OBR", "BR"))',
            [req.user.id, bfv_id]
        );
        
        if (userRole.length === 0 && !req.user.isLFV) {
            return res.status(403).json({ message: 'Not authorized for this BFV' });
        }

        const [result] = await db.query(
            'INSERT INTO abschnitte (name, bfv_id) VALUES (?, ?)',
            [name, bfv_id]
        );
        res.status(201).json({ id: result.insertId, name, bfv_id });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router; 