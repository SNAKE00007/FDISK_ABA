const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const db = require('./db'); // Import the db module
const authController = require('./controllers/authController'); // Import the authController

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.post('/api/auth/login', authController.login);

app.get('/', (req, res) => {
    res.send('Backend server is running');
});

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const equipmentRoutes = require('./routes/equipment');
const reportRoutes = require('./routes/reports');

// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/equipment', equipmentRoutes);
app.use('/api/reports', reportRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    db.connect((err) => {
        if (err) {
            console.error('Error connecting to the database:', err);
        } else {
            console.log('Connected to the database');
        }
    });
});

module.exports = { db };