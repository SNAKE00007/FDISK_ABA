const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const db = require('./db'); // Import the db module
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const equipmentRoutes = require('./routes/equipment');
const reportRoutes = require('./routes/reports');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/equipment', equipmentRoutes);
app.use('/api/reports', reportRoutes);

app.get('/', (req, res) => {
    res.send('Backend server is running');
});

// Example of using the db pool to perform a query
app.get('/test-db', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT 1 + 1 AS solution');
        res.json({ solution: rows[0].solution });
    } catch (error) {
        console.error('Database query error:', error);
        res.status(500).json({ message: 'Database error', error: error.message });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

module.exports = { db };