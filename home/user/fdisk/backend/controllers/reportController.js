const { db } = require('../index');

exports.getAllReports = (req, res) => {
    db.query('SELECT * FROM reports', (error, results) => {
        if (error) {
            return res.status(500).json({ message: 'Server error' });
        }
        res.json(results);
    });
};

exports.getReportById = (req, res) => {
    const { id } = req.params;
    db.query('SELECT * FROM reports WHERE id = ?', [id], (error, results) => {
        if (error) {
            return res.status(500).json({ message: 'Server error' });
        }
        if (results.length === 0) {
            return res.status(404).json({ message: 'Report not found' });
        }
        res.json(results[0]);
    });
};

exports.createReport = (req, res) => {
    const { date, time, type, members } = req.body;
    db.query('INSERT INTO reports (date, time, type, members) VALUES (?, ?, ?, ?)',
        [date, time, type, JSON.stringify(members)],
        (error, result) => {
            if (error) {
                return res.status(500).json({ message: 'Server error' });
            }
            res.status(201).json({ message: 'Report created successfully', reportId: result.insertId });
        }
    );
};

exports.updateReport = (req, res) => {
    const { id } = req.params;
    const { date, time, type, members } = req.body;
    db.query('UPDATE reports SET date = ?, time = ?, type = ?, members = ? WHERE id = ?',
        [date, time, type, JSON.stringify(members), id],
        (error, result) => {
            if (error) {
                return res.status(500).json({ message: 'Server error' });
            }
            if (result.affectedRows === 0) {
                return res.status(404).json({ message: 'Report not found' });
            }
            res.json({ message: 'Report updated successfully' });
        }
    );
};

exports.deleteReport = (req, res) => {
    const { id } = req.params;
    db.query('DELETE FROM reports WHERE id = ?', [id], (error, result) => {
        if (error) {
            return res.status(500).json({ message: 'Server error' });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Report not found' });
        }
        res.json({ message: 'Report deleted successfully' });
    });
};