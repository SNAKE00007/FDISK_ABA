const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config();

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    dateStrings: true // This helps with date handling
});

const query = async (sql, params) => {
    try {
        const [results] = await pool.execute(sql, params || []);
        return results;
    } catch (error) {
        console.error('Database query error:', error);
        throw error;
    }
};

module.exports = { query };