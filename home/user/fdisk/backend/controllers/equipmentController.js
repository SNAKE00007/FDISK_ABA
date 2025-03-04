const db = require('../db');

exports.getAllEquipment = async (req, res) => {
    try {
        const results = await db.query('SELECT * FROM equipment');
        res.json(results);
    } catch (error) {
        console.error('Error getting equipment:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getEquipmentById = async (req, res) => {
    try {
        const { id } = req.params;
        const results = await db.query('SELECT * FROM equipment WHERE id = ?', [id]);
        if (results.length === 0) {
            return res.status(404).json({ message: 'Equipment not found' });
        }
        res.json(results[0]);
    } catch (error) {
        console.error('Error getting equipment by id:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.createEquipment = async (req, res) => {
    try {
        const { name, vehicle, replace_date, notes } = req.body;
        const result = await db.query(
            'INSERT INTO equipment (name, vehicle, replace_date, notes) VALUES (?, ?, ?, ?)',
            [name, vehicle, replace_date, notes]
        );
        res.status(201).json({ message: 'Equipment created successfully', equipmentId: result.insertId });
    } catch (error) {
        console.error('Error creating equipment:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.updateEquipment = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, vehicle, replace_date, notes } = req.body;
        const result = await db.query(
            'UPDATE equipment SET name = ?, vehicle = ?, replace_date = ?, notes = ? WHERE id = ?',
            [name, vehicle, replace_date, notes, id]
        );
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Equipment not found' });
        }
        res.json({ message: 'Equipment updated successfully' });
    } catch (error) {
        console.error('Error updating equipment:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.deleteEquipment = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await db.query('DELETE FROM equipment WHERE id = ?', [id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Equipment not found' });
        }
        res.json({ message: 'Equipment deleted successfully' });
    } catch (error) {
        console.error('Error deleting equipment:', error);
        res.status(500).json({ message: 'Server error' });
    }
};