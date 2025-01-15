const express = require('express');
const router = express.Router();
const db = require('../db');
const { verifyToken } = require('../middleware/auth');

router.use(verifyToken);

router.get('/', async (req, res) => {
    try {
        const reports = await db.query(`
            SELECT r.*, 
                   COALESCE(GROUP_CONCAT(rm.member_id), '') as member_ids
            FROM reports r 
            LEFT JOIN report_members rm ON r.id = rm.report_id 
            WHERE r.department_id = ?
            GROUP BY r.id, r.date, r.start_time, r.end_time, r.duration, r.type, r.description
        `, [req.departmentId]);
        
        const formattedReports = reports.map(report => {
            const reportDate = new Date(report.date);
            return {
                ...report,
                date: reportDate.toLocaleDateString('de-DE'),
                members: report.member_ids ? report.member_ids.split(',').map(Number) : []
            };
        });

        res.json(formattedReports);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ message: 'Error fetching reports' });
    }
});

router.post('/', async (req, res) => {
    try {
        const { date, start_time, end_time, duration, type, description, members } = req.body;

        const result = await db.query(
            'INSERT INTO reports (department_id, date, start_time, end_time, duration, type, description) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [req.departmentId, date, start_time, end_time, duration, type, description]
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
            department_id: req.departmentId,
            date,
            start_time,
            end_time,
            duration,
            type,
            description,
            members 
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ message: 'Error creating report' });
    }
});

// ... Continue with PUT and DELETE endpoints?
// ...continuing with PUT and DELETE endpoints

router.put('/:id', async (req, res) => {
    try {
        const { date, start_time, end_time, duration, type, description, members } = req.body;
        
        // Verify department ownership
        const [report] = await db.query(
            'SELECT * FROM reports WHERE id = ? AND department_id = ?',
            [req.params.id, req.departmentId]
        );

        if (!report) {
            return res.status(404).json({ message: 'Report not found or access denied' });
        }

        await db.query(
            'UPDATE reports SET date = ?, start_time = ?, end_time = ?, duration = ?, type = ?, description = ? WHERE id = ? AND department_id = ?',
            [date, start_time, end_time, duration, type, description, req.params.id, req.departmentId]
        );
        
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
            department_id: req.departmentId,
            date,
            start_time,
            end_time,
            duration,
            type,
            description,
            members 
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ message: 'Error updating report' });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        // Verify department ownership
        const [report] = await db.query(
            'SELECT * FROM reports WHERE id = ? AND department_id = ?',
            [req.params.id, req.departmentId]
        );

        if (!report) {
            return res.status(404).json({ message: 'Report not found or access denied' });
        }

        await db.query('DELETE FROM report_members WHERE report_id = ?', [req.params.id]);
        await db.query('DELETE FROM reports WHERE id = ? AND department_id = ?', [req.params.id, req.departmentId]);
        
        res.json({ message: 'Report deleted successfully' });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ message: 'Error deleting report' });
    }
});

module.exports = router;