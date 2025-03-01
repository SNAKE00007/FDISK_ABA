const logger = require('../utils/logger');

class AppError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
        this.isOperational = true;

        Error.captureStackTrace(this, this.constructor);
    }
}

const handleJWTError = () => new AppError('Invalid token. Please log in again.', 401);
const handleJWTExpiredError = () => new AppError('Your token has expired. Please log in again.', 401);
const handleValidationError = (err) => {
    const errors = Object.values(err.errors).map(el => el.message);
    return new AppError(`Invalid input data. ${errors.join('. ')}`, 400);
};

const errorHandler = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    // Log error
    logger.error('Error:', {
        error: err.message,
        stack: err.stack,
        statusCode: err.statusCode,
        path: req.path,
        method: req.method,
        body: req.body,
        params: req.params,
        query: req.query
    });

    if (process.env.NODE_ENV === 'development') {
        res.status(err.statusCode).json({
            status: err.status,
            error: err,
            message: err.message,
            stack: err.stack
        });
    } else {
        // Operational, trusted error: send message to client
        if (err.isOperational) {
            res.status(err.statusCode).json({
                status: err.status,
                message: err.message
            });
        } 
        // Programming or other unknown error: don't leak error details
        else {
            res.status(500).json({
                status: 'error',
                message: 'Something went wrong!'
            });
        }
    }
};

const asyncHandler = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};

module.exports = {
    AppError,
    errorHandler,
    asyncHandler,
    handleJWTError,
    handleJWTExpiredError,
    handleValidationError
}; 