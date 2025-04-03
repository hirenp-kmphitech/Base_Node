class AppError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = true; // Mark as operational error (not a bug)
        
        Error.captureStackTrace(this, this.constructor);
    }
}

module.exports = AppError;
