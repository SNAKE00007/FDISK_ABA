const express = require('express');
const router = express.Router();
const db = require('../db');
const { verifyToken } = require('../middleware/auth');

router.use(verifyToken);

// Create report
router.post('/', async (req, res) => {
    try {
        const { date, time, type, description, members } = req.body;
        console.log('Creating report with:', { date, time, type, description, members });

        // Start transaction
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
            
            // Commit transaction
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
        console.error('Detailed error:', error);
        res.status(500).json({ 
            message: 'Error creating report',
            error: error.message 
        });
    }
});

// Get all reports
router.get('/', async (req, res) => {
    try {
        const reports = await db.query(`
            SELECT r.*, 
                   COALESCE(GROUP_CONCAT(rm.member_id), '') as member_ids,
                   r.description 
            FROM reports r 
            LEFT JOIN report_members rm ON r.id = rm.report_id 
            GROUP BY r.id, r.date, r.time, r.type, r.description
        `);
        
        const formattedReports = reports.map(report => ({
            ...report,
            members: report.member_ids ? report.member_ids.split(',').map(Number) : []
        }));

        res.json(formattedReports);
    } catch (error) {
        console.error('Detailed error:', error);
        res.status(500).json({ 
            message: 'Error fetching reports',
            error: error.message 
        });
    }
});

module.exports = router;