const Joi = require('joi');

const validate = (schema) => {
    return (req, res, next) => {
        const { error } = schema.validate(req.body, { abortEarly: false });
        
        if (error) {
            const errors = error.details.map(detail => ({
                field: detail.path.join('.'),
                message: detail.message
            }));
            
            return res.status(400).json({
                status: 'error',
                message: 'Validation failed',
                errors
            });
        }
        
        next();
    };
};

// Common validation schemas
const schemas = {
    login: Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().min(6).required()
    }),
    
    register: Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().min(6).required(),
        name: Joi.string().min(2).required(),
        role: Joi.string().valid('admin', 'user').default('user')
    }),
    
    equipment: Joi.object({
        name: Joi.string().required(),
        type: Joi.string().required(),
        status: Joi.string().valid('available', 'in-use', 'maintenance').required(),
        location: Joi.string().required(),
        lastMaintenanceDate: Joi.date().iso(),
        notes: Joi.string().allow('', null)
    })
};

module.exports = {
    validate,
    schemas
}; 