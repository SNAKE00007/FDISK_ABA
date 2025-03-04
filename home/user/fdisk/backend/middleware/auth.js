const jwt = require('jsonwebtoken');
const db = require('../db');

const authenticateToken = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'No token provided' });
    }

    try {
        const user = jwt.verify(token, process.env.JWT_SECRET);
        
        // Get user's roles and permissions
        const [roles] = await db.query(`
            SELECT r.name as role_name, ur.bfv_id, ur.department_id 
            FROM user_roles ur 
            JOIN roles r ON ur.role_id = r.id 
            WHERE ur.user_id = ? AND ur.is_active = true
        `, [user.id]);

        const [permissions] = await db.query(`
            SELECT p.name 
            FROM user_permissions up 
            JOIN permissions p ON up.permission_id = p.id 
            WHERE up.user_id = ?
        `, [user.id]);

        // Add role and permission info to req.user
        req.user = {
            ...user,
            roles: roles.map(r => ({
                name: r.role_name,
                bfv_id: r.bfv_id,
                department_id: r.department_id
            })),
            permissions: permissions.map(p => p.name),
            isLFV: roles.some(r => ['LBD', 'LBDS', 'LFR'].includes(r.role_name))
        };

        next();
    } catch (error) {
        return res.status(403).json({ message: 'Invalid token' });
    }
};

const checkPermission = (requiredPermission) => {
    return async (req, res, next) => {
        if (!req.user) {
            return res.status(403).json({ message: 'Not authenticated' });
        }

        // LFV roles have all permissions
        if (req.user.isLFV) {
            return next();
        }

        // Check if user has the required permission
        if (req.user.permissions.includes(requiredPermission)) {
            return next();
        }

        return res.status(403).json({ message: 'Insufficient permissions' });
    };
};

const checkBFVAccess = (bfvIdParam = 'bfv_id') => {
    return async (req, res, next) => {
        if (!req.user) {
            return res.status(403).json({ message: 'Not authenticated' });
        }

        // LFV roles have access to all BFVs
        if (req.user.isLFV) {
            return next();
        }

        const bfvId = req.params[bfvIdParam] || req.body[bfvIdParam];
        
        // Check if user has a role in this BFV
        const hasAccess = req.user.roles.some(r => r.bfv_id === parseInt(bfvId));
        
        if (!hasAccess) {
            return res.status(403).json({ message: 'Not authorized for this BFV' });
        }

        next();
    };
};

const checkDepartmentAccess = (deptIdParam = 'department_id') => {
    return async (req, res, next) => {
        if (!req.user) {
            return res.status(403).json({ message: 'Not authenticated' });
        }

        // LFV roles have access to all departments
        if (req.user.isLFV) {
            return next();
        }

        const deptId = req.params[deptIdParam] || req.body[deptIdParam];

        // Get department's BFV
        const [dept] = await db.query(`
            SELECT d.id, d.abschnitt_id, a.bfv_id 
            FROM departments d 
            LEFT JOIN abschnitte a ON d.abschnitt_id = a.id 
            WHERE d.id = ?
        `, [deptId]);

        if (dept.length === 0) {
            return res.status(404).json({ message: 'Department not found' });
        }

        // Check if user has access through BFV role or department role
        const hasAccess = req.user.roles.some(r => 
            (r.bfv_id === dept[0].bfv_id) || 
            (r.department_id === parseInt(deptId))
        );

        if (!hasAccess) {
            return res.status(403).json({ message: 'Not authorized for this department' });
        }

        next();
    };
};

module.exports = {
    authenticateToken,
    checkPermission,
    checkBFVAccess,
    checkDepartmentAccess
};