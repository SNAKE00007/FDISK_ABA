const express = require('express');
const router = express.Router();
const db = require('../db');
const { verifyToken } = require('../middleware/auth');

router.use(verifyToken);

// Get all reports
router.get('/', async (req, res) => {
    try {
        const reports = await db.query(`
            SELECT r.*, 
                   COALESCE(GROUP_CONCAT(rm.member_id), '') as member_ids,
                   r.description 
            FROM reports r 
            LEFT JOIN report_members rm ON r.id = rm.report_id 
            GROUP BY r.id, r.date, r.start_time, r.end_time, r.duration, r.type, r.description
        `);
        
        const formattedReports = reports.map(report => ({
            ...report,
            members: report.member_ids ? report.member_ids.split(',').map(Number) : []
        }));

        res.json(formattedReports);
    } catch (error) {
        console.error('Error fetching reports:', error);
        res.status(500).json({ message: 'Error fetching reports' });
    }
});

// Create report
router.post('/', async (req, res) => {
    try {
        const { start_datetime, end_datetime, duration, type, description, members } = req.body;
        
        // Calculate missing value (either end_datetime or duration)
        let calculatedEndDatetime = end_datetime;
        let calculatedDuration = duration;

        if (end_datetime && !duration) {
            // Calculate duration if end_datetime is provided
            const start = new Date(start_datetime);
            const end = new Date(end_datetime);
            const diff = Math.abs(end - start);
            calculatedDuration = Math.floor(diff / (1000 * 60)); // Duration in minutes
        } else if (!end_datetime && duration) {
            // Calculate end_datetime if duration is provided
            const start = new Date(start_datetime);
            calculatedEndDatetime = new Date(start.getTime() + duration * 60000); // Convert minutes to milliseconds
        }

        // Insert the report
        const result = await db.query(
            'INSERT INTO reports (start_datetime, end_datetime, duration, type, description) VALUES (?, ?, ?, ?, ?)',
            [start_datetime, calculatedEndDatetime, calculatedDuration, type, description]
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
            start_datetime,
            end_datetime: calculatedEndDatetime,
            duration: calculatedDuration,
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
        const { start_datetime, end_datetime, duration, type, description, members } = req.body;
        
        // Calculate missing value (either end_datetime or duration)
        let calculatedEndDatetime = end_datetime;
        let calculatedDuration = duration;

        if (end_datetime && !duration) {
            const start = new Date(start_datetime);
            const end = new Date(end_datetime);
            const diff = Math.abs(end - start);
            calculatedDuration = Math.floor(diff / (1000 * 60));
        } else if (!end_datetime && duration) {
            const start = new Date(start_datetime);
            calculatedEndDatetime = new Date(start.getTime() + duration * 60000);
        }

        // Update the report
        await db.query(
            'UPDATE reports SET start_datetime = ?, end_datetime = ?, duration = ?, type = ?, description = ? WHERE id = ?',
            [start_datetime, calculatedEndDatetime, calculatedDuration, type, description, req.params.id]
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
            start_datetime,
            end_datetime: calculatedEndDatetime,
            duration: calculatedDuration,
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