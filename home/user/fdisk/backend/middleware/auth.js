const jwt = require('jsonwebtoken');

exports.verifyToken = (req, res, next) => {
    const token = req.headers['authorization'];
    if (!token) return res.status(403).send('No token provided');

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) return res.status(500).send('Failed to authenticate token');
        req.userId = decoded.id;
        req.userRole = decoded.role;
        req.departmentId = decoded.department_id; // Add department_id
        next();
    });
};

exports.isAdmin = (req, res, next) => {
    if (req.userRole !== 'admin') {
        return res.status(403).send('Access denied. Admin role required.');
    }
    next();
};

exports.validateDepartmentAccess = (req, res, next) => {
    const requestedDeptId = req.params.departmentId || req.body.department_id;
    if (requestedDeptId && requestedDeptId !== req.departmentId) {
        return res.status(403).json({ message: 'Access denied to this department' });
    }
    next();
};