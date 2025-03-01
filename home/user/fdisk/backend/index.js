const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const compression = require('compression');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const logger = require('./utils/logger');
const { errorHandler } = require('./middleware/errorHandler');
const db = require('./db'); // Import the db module

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const equipmentRoutes = require('./routes/equipment');
const reportRoutes = require('./routes/reports');
const memberRoutes = require('./routes/members');

dotenv.config();

const app = express();

// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api', limiter);

// Body parser
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data sanitization against XSS
app.use(xss());

// Prevent parameter pollution
app.use(hpp({
    whitelist: ['status', 'type', 'location'] // Add parameters that can be duplicated
}));

// Compression
app.use(compression());

// CORS configuration
app.use(cors({
    origin: ['http://localhost:3000', 'http://10.0.0.130:3000'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: ['Content-Range', 'X-Content-Range'],
    maxAge: 600 // 10 minutes
}));

// Request logging
app.use((req, res, next) => {
    logger.info(`${req.method} ${req.path}`, {
        query: req.query,
        params: req.params,
        ip: req.ip
    });
    next();
});

// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/equipment', equipmentRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/members', memberRoutes);

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

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'success',
        message: 'Server is healthy',
        timestamp: new Date().toISOString()
    });
});

// Error handling
app.use(errorHandler);

// Handle unhandled routes
app.all('*', (req, res, next) => {
    res.status(404).json({
        status: 'error',
        message: `Can't find ${req.originalUrl} on this server!`
    });
});

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
    logger.info(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
    logger.error('UNHANDLED REJECTION! 💥 Shutting down...', err);
    server.close(() => {
        process.exit(1);
    });
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
    logger.error('UNCAUGHT EXCEPTION! 💥 Shutting down...', err);
    process.exit(1);
});