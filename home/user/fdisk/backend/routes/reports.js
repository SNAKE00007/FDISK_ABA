const express = require('express');
const router = express.Router();
const db = require('../db');
const { verifyToken } = require('../middleware/auth');

router.use(verifyToken);

// Get all reports
router.get('/', async (req, res) => {
    try {
        const reports = await db.query(`
            SELECT r.*, GROUP_CONCAT(rm.member_id) as member_ids 
            FROM reports r 
            LEFT JOIN report_members rm ON r.id = rm.report_id 
            GROUP BY r.id
        `);
        
        res.json(reports.map(report => ({
            ...report,
            members: report.member_ids ? report.member_ids.split(',').map(Number) : []
        })));
    } catch (error) {
        console.error('Error fetching reports:', error);
        res.status(500).json({ message: 'Error fetching reports' });
    }
});

// Create report
router.post('/', async (req, res) => {
    try {
        const { date, time, type, description, members } = req.body;
        
        const result = await db.query(
            'INSERT INTO reports (date, time, type, description) VALUES (?, ?, ?, ?)',
            [date, time, type, description]
        );
        
        if (members && members.length > 0) {
            const values = members.map(memberId => [result.insertId, memberId]);
            await db.query(
                'INSERT INTO report_members (report_id, member_id) VALUES ?',
                [values]
            );
        }
        
        res.status(201).json({ 
            id: result.insertId,
            date,
            time,
            type,
            description,
            members 
        });
    } catch (error) {
        console.error('Error creating report:', error);
        res.status(500).json({ message: 'Error creating report' });
    }
});

module.exports = router;