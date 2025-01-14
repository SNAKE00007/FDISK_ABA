const express = require('express');
const router = express.Router();
const db = require('../db');
const { verifyToken } = require('../middleware/auth');

router.use(verifyToken);

// Get all reports
router.get('/', async (req, res) => {
    try {
        // Simplified query to debug the issue
        const reports = await db.query(`
            SELECT r.id, 
                   r.start_datetime,
                   r.end_datetime,
                   r.duration,
                   r.type,
                   r.description,
                   COALESCE(GROUP_CONCAT(rm.member_id), '') as member_ids
            FROM reports r 
            LEFT JOIN report_members rm ON r.id = rm.report_id 
            GROUP BY r.id
        `);
        
        // Add debug logging
        console.log('Raw reports:', reports);
        
        const formattedReports = reports.map(report => ({
            id: report.id,
            start_datetime: report.start_datetime,
            end_datetime: report.end_datetime,
            duration: report.duration,
            type: report.type,
            description: report.description,
            members: report.member_ids ? report.member_ids.split(',').map(Number) : []
        }));

        // Add debug logging
        console.log('Formatted reports:', formattedReports);
        
        return res.json(formattedReports);
    } catch (error) {
        console.error('Detailed error:', error);
        return res.status(500).json({ 
            message: 'Error fetching reports',
            error: error.message,
            stack: error.stack
        });
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

        // Combine date and start time into datetime format
        const start_datetime = new Date(`${date}T${start_time}`).toISOString().slice(0, 19).replace('T', ' ');
        
        // Calculate end_datetime and duration
        let end_datetime = null;
        let calculatedDuration = null;

        if (end_time) {
            end_datetime = new Date(`${date}T${end_time}`).toISOString().slice(0, 19).replace('T', ' ');
            const diffMs = new Date(`${date}T${end_time}`) - new Date(`${date}T${start_time}`);
            calculatedDuration = Math.floor(diffMs / (1000 * 60)); // Convert to minutes
        } else if (duration) {
            const startDate = new Date(`${date}T${start_time}`);
            const endDate = new Date(startDate.getTime() + duration * 60000);
            end_datetime = endDate.toISOString().slice(0, 19).replace('T', ' ');
            calculatedDuration = duration;
        }

        // Insert the report
        const result = await db.query(
            'INSERT INTO reports (start_datetime, end_datetime, duration, type, description) VALUES (?, ?, ?, ?, ?)',
            [start_datetime, end_datetime, calculatedDuration, type, description]
        );
        
        // Insert member assignments if any
        if (members && members.length > 0) {
            const values = members.map(memberId => [result.insertId, memberId]);
            await db.query(
                'INSERT INTO report_members (report_id, member_id) VALUES ?',
                [values]
            );
        }
        
        res.status(201).json({ 
            id: result.insertId,
            start_datetime,
            end_datetime,
            duration: calculatedDuration,
            type,
            description,
            members: members || []
        });
    } catch (error) {
        console.error('Error creating report:', error);
        res.status(500).json({ message: 'Error creating report' });
    }
});

// Update report
router.put('/:id', async (req, res) => {
    try {
        const { date, start_time, end_time, duration, type, description, members } = req.body;
        
        const start_datetime = new Date(`${date}T${start_time}`).toISOString().slice(0, 19).replace('T', ' ');
        let end_datetime = null;
        let calculatedDuration = null;

        if (end_time) {
            end_datetime = new Date(`${date}T${end_time}`).toISOString().slice(0, 19).replace('T', ' ');
            const diffMs = new Date(`${date}T${end_time}`) - new Date(`${date}T${start_time}`);
            calculatedDuration = Math.floor(diffMs / (1000 * 60));
        } else if (duration) {
            const startDate = new Date(`${date}T${start_time}`);
            const endDate = new Date(startDate.getTime() + duration * 60000);
            end_datetime = endDate.toISOString().slice(0, 19).replace('T', ' ');
            calculatedDuration = duration;
        }

        await db.query(
            'UPDATE reports SET start_datetime = ?, end_datetime = ?, duration = ?, type = ?, description = ? WHERE id = ?',
            [start_datetime, end_datetime, calculatedDuration, type, description, req.params.id]
        );

        // Update member assignments
        await db.query('DELETE FROM report_members WHERE report_id = ?', [req.params.id]);
        
        if (members && members.length > 0) {
            const values = members.map(memberId => [req.params.id, memberId]);
            await db.query(
                'INSERT INTO report_members (report_id, member_id) VALUES ?',
                [values]
            );
        }

        res.json({
            id: req.params.id,
            start_datetime,
            end_datetime,
            duration: calculatedDuration,
            type,
            description,
            members: members || []
        });
    } catch (error) {
        console.error('Error updating report:', error);
        res.status(500).json({ message: 'Error updating report' });
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