const express = require('express');
const router = express.Router();
const db = require('../db');
const { verifyToken } = require('../middleware/auth');

router.use(verifyToken);

// Get all reports
router.get('/', async (req, res) => {
    try {
        // First check if tables exist
        const tablesExist = await db.query(`
            SELECT COUNT(*) as count 
            FROM information_schema.tables 
            WHERE table_schema = DATABASE()
            AND table_name IN ('reports', 'report_members')
        `);

        if (tablesExist[0].count < 2) {
            return res.json([]);  // Return empty array if tables don't exist
        }

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
        res.status(500).json({ error: error.message });
    }
});

// Create report
router.post('/', async (req, res) => {
    try {
        const { date, time, type, description, members } = req.body;
        
        // Start a transaction
        await db.query('START TRANSACTION');
        
        try {
            // Insert the report
            const result = await db.query(
                'INSERT INTO reports (date, time, type, description) VALUES (?, ?, ?, ?)',
                [date, time, type, description]
            );
            
            // Insert member assignments if any
            if (members && members.length > 0) {
                const values = members.map(memberId => [result.insertId, memberId]);
                await db.query(
                    'INSERT INTO report_members (report_id, member_id) VALUES ?',
                    [values]
                );
            }
            
            // Commit the transaction
            await db.query('COMMIT');
            
            res.status(201).json({ 
                id: result.insertId,
                date,
                time,
                type,
                description,
                members 
            });
        } catch (error) {
            // Rollback on error
            await db.query('ROLLBACK');
            throw error;
        }
    } catch (error) {
        console.error('Error creating report:', error);
        res.status(500).json({ message: 'Error creating report: ' + error.message });
    }
});

module.exports = router;