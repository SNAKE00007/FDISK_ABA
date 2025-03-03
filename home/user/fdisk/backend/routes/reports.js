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
            WHERE r.department_id = ?
            GROUP BY r.id
        `, [req.departmentId]);
        
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
        console.log('Creating report with:', { date, start_time, end_time, duration, type, description, members });

        // Add department_id to the report
        const result = await db.query(
            'INSERT INTO reports (department_id, date, start_time, end_time, duration, type, description) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [req.departmentId, date, start_time, end_time, duration, type, description]
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
        const { start_date, end_date, start_time, end_time, duration, type, description, members } = req.body;
        
        // Validate dates and required fields
        if (!start_date || !end_date || !start_time || !end_time || !type) {
            return res.status(400).json({ message: 'Required fields are missing' });
        }

        // Ensure all values are properly defined before database query
        const updateValues = {
            start_date: start_date || null,
            end_date: end_date || null,
            start_time: start_time || null,
            end_time: end_time || null,
            duration: duration || '',
            type: type || null,
            description: description || ''
        };
        
        // Update the report
        await db.query(
            'UPDATE reports SET start_date = ?, end_date = ?, start_time = ?, end_time = ?, duration = ?, type = ?, description = ? WHERE id = ?',
            [
                updateValues.start_date,
                updateValues.end_date,
                updateValues.start_time,
                updateValues.end_time,
                updateValues.duration,
                updateValues.type,
                updateValues.description,
                req.params.id
            ]
        );
        
        // Delete existing member assignments
        await db.query('DELETE FROM report_members WHERE report_id = ?', [req.params.id]);
        
        // Insert new member assignments if any
        if (members && Array.isArray(members) && members.length > 0) {
            const placeholders = members.map(() => '(?, ?)').join(', ');
            const values = members.reduce((acc, memberId) => {
                if (memberId) {  // Only add valid member IDs
                    acc.push(req.params.id, memberId);
                }
                return acc;
            }, []);

            if (values.length > 0) {  // Only run query if we have valid members
                await db.query(
                    `INSERT INTO report_members (report_id, member_id) VALUES ${placeholders}`,
                    values
                );
            }
        }
        
        res.json({ 
            id: req.params.id,
            ...updateValues,
            members: members || []
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

const handleEdit = (report) => {
    // Convert the German formatted date (dd.mm.yyyy) back to ISO format (yyyy-mm-dd)
    const [day, month, year] = report.date.split('.');
    const isoDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;

    setFormData({
        date: isoDate, // Set the ISO formatted date
        start_time: report.start_time,
        end_time: report.end_time || '',
        duration: report.duration || '',
        type: report.type,
        description: report.description,
        members: report.members || []
    });
    setEditingReport(report);
    setShowForm(true);
};

module.exports = router;