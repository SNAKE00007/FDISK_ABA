const jwt = require('jsonwebtoken');
const db = require('../db');

exports.verifyToken = async (req, res, next) => {
    try {
        const token = req.headers.authorization;
        if (!token) {
            return res.status(401).json({ message: 'No token provided' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Validate department access
        const [department] = await db.query(
            'SELECT * FROM departments WHERE id = ?',
            [decoded.department_id]
        );

        if (!department) {
            return res.status(403).json({ message: 'Invalid department access' });
        }

        req.user = decoded;
        req.departmentId = decoded.department_id;
        next();
    } catch (error) {
        res.status(401).json({ message: 'Invalid token' });
    }
};