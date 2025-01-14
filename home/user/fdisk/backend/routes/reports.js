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
                   COALESCE(GROUP_CONCAT(rm.member_id), '') as member_ids
            FROM reports r 
            LEFT JOIN report_members rm ON r.id = rm.report_id 
            GROUP BY r.id, r.start_datetime, r.end_datetime, r.duration, r.type, r.description
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
        const { date, start_time, end_time, duration, type, description, members } = req.body;
        
        // Ensure required fields are present
        if (!date || !start_time || !type) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        // Combine date and time into datetime format
        const start_datetime = `${date} ${start_time}`;
        let end_datetime = end_time ? `${date} ${end_time}` : null;
        let calculatedDuration = duration || null;

        if (end_time && !duration) {
            // Calculate duration if end_time is provided
            const start = new Date(start_datetime);
            const end = new Date(end_datetime);
            const diff = Math.abs(end - start);
            calculatedDuration = Math.floor(diff / (1000 * 60));
        } else if (!end_time && duration) {
            // Calculate end_time if duration is provided
            const start = new Date(start_datetime);
            end_datetime = new Date(start.getTime() + duration * 60000).toISOString().slice(0, 19).replace('T', ' ');
        }

        // Insert the report with null checks
        const result = await db.query(
            'INSERT INTO reports (start_datetime, end_datetime, duration, type, description) VALUES (?, ?, ?, ?, ?)',
            [
                start_datetime,
                end_datetime || null,
                calculatedDuration || null,
                type,
                description || null
            ]
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
            end_datetime: end_datetime || null,
            duration: calculatedDuration || null,
            type,
            description: description || null,
            members: members || [] 
        });
    } catch (error) {
        console.error('Error creating report:', error);
        res.status(500).json({ message: 'Error creating report', error: error.message });
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