const express = require('express');
const router = express.Router();
const db = require('../db');
const { verifyToken } = require('../middleware/auth');

router.use(verifyToken);


//test
// Get all reports
router.get('/', async (req, res) => {
    try {
        const reports = await db.query(`
            SELECT r.*, 
                   COALESCE(GROUP_CONCAT(rm.member_id), '') as member_ids
            FROM reports r 
            LEFT JOIN report_members rm ON r.id = rm.report_id 
            GROUP BY r.id, r.start_datetime, r.end_datetime, r.duration, r.type, r.description
        `);
        
        const formattedReports = reports.map(report => {
            const reportDate = new Date(report.date);
            return {
                ...report,
                // Format date as dd.mm.yyyy for display
                date: reportDate.toLocaleDateString('de-DE', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric'
                }),
                members: report.member_ids ? report.member_ids.split(',').map(Number) : []
            };
        });

        res.json(formattedReports);
    } catch (error) {
        console.error('Error fetching reports:', error);
        res.status(500).json({ message: 'Error fetching reports' });
    }
});

// Create report
router.post('/', async (req, res) => {
    try {
        const { date, start_time, end_time, duration, type, description, members } = req.body;
        console.log('Creating report with:', { date, start_time, end_time, duration, type, description, members });

        // Insert the report
        const result = await db.query(
            'INSERT INTO reports (date, start_time, end_time, duration, type, description) VALUES (?, ?, ?, ?, ?, ?)',
            [date, start_time, end_time, duration, type, description]
        );
        
        // Insert member assignments if any
        if (members && members.length > 0) {
            const placeholders = members.map(() => '(?, ?)').join(', ');
            const values = members.reduce((acc, memberId) => {
                acc.push(result.insertId, memberId);
                return acc;
            }, []);

            await db.query(
                `INSERT INTO report_members (report_id, member_id) VALUES ${placeholders}`,
                values
            );
        }
        
        res.status(201).json({ 
            id: result.insertId,
            date,
            start_time,
            end_time,
            duration,
            type,
            description,
            members 
        });
    } catch (error) {
        console.error('Error creating report:', error);
        res.status(500).json({ message: 'Error creating report' });
    }
});

router.put('/:id', async (req, res) => {
    try {
        const { date, start_time, end_time, duration, type, description, members } = req.body;
        
        // Update the report
        await db.query(
            'UPDATE reports SET date = ?, start_time = ?, end_time = ?, duration = ?, type = ?, description = ? WHERE id = ?',
            [date, start_time, end_time, duration, type, description, req.params.id]
        );
        
        // Delete existing member assignments
        await db.query('DELETE FROM report_members WHERE report_id = ?', [req.params.id]);
        
        // Insert new member assignments if any
        if (members && members.length > 0) {
            const placeholders = members.map(() => '(?, ?)').join(', ');
            const values = members.reduce((acc, memberId) => {
                acc.push(req.params.id, memberId);
                return acc;
            }, []);

            await db.query(
                `INSERT INTO report_members (report_id, member_id) VALUES ${placeholders}`,
                values
            );
        }
        
        res.json({ 
            id: req.params.id,
            date,
            start_time,
            end_time,
            duration,
            type,
            description,
            members
        });
    } catch (error) {
        console.error('Error updating report:', error);
        res.status(500).json({ message: 'Error updating report', error: error.message });
    }
});

// Delete report
router.delete('/:id', async (req, res) => {
    try {
        await db.query('DELETE FROM report_members WHERE report_id = ?', [req.params.id]);
        await db.query('DELETE FROM reports WHERE id = ?', [req.params.id]);
        res.json({ message: 'Report deleted successfully' });
    } catch (error) {
        console.error('Error deleting report:', error);
        res.status(500).json({ message: 'Error deleting report' });
    }
});

module.exports = router;