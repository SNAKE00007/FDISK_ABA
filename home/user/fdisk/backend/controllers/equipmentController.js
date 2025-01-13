const { db } = require('../index');

exports.getAllEquipment = (req, res) => {
    db.query('SELECT * FROM equipment', (error, results) => {
        if (error) {
            return res.status(500).json({ message: 'Server error' });
        }
        res.json(results);
    });
};

exports.getEquipmentById = (req, res) => {
    const { id } = req.params;
    db.query('SELECT * FROM equipment WHERE id = ?', [id], (error, results) => {
        if (error) {
            return res.status(500).json({ message: 'Server error' });
        }
        if (results.length === 0) {
            return res.status(404).json({ message: 'Equipment not found' });
        }
        res.json(results[0]);
    });
};

exports.createEquipment = (req, res) => {
    const { name, vehicle, replace_date, notes } = req.body;
    db.query('INSERT INTO equipment (name, vehicle, replace_date, notes) VALUES (?, ?, ?, ?)',
        [name, vehicle, replace_date, notes],
        (error, result) => {
            if (error) {
                return res.status(500).json({ message: 'Server error' });
            }
            res.status(201).json({ message: 'Equipment created successfully', equipmentId: result.insertId });
        }
    );
};

exports.updateEquipment = (req, res) => {
    const { id } = req.params;
    const { name, vehicle, replace_date, notes } = req.body;
    db.query('UPDATE equipment SET name = ?, vehicle = ?, replace_date = ?, notes = ? WHERE id = ?',
        [name, vehicle, replace_date, notes, id],
        (error, result) => {
            if (error) {
                return res.status(500).json({ message: 'Server error' });
            }
            if (result.affectedRows === 0) {
                return res.status(404).json({ message: 'Equipment not found' });
            }
            res.json({ message: 'Equipment updated successfully' });
        }
    );
};

exports.deleteEquipment = (req, res) => {
    const { id } = req.params;
    db.query('DELETE FROM equipment WHERE id = ?', [id], (error, result) => {
        if (error) {
            return res.status(500).json({ message: 'Server error' });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Equipment not found' });
        }
        res.json({ message: 'Equipment deleted successfully' });
    });
};