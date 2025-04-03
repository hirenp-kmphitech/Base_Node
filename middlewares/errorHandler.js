const AppError = require('../utils/AppError');
const logger = require('../utils/logger');

const errorHandler = (err, req, res, next) => {
    let { statusCode, message } = err;

    // Set default values for unhandled errors
    if (!statusCode) statusCode = 500;
    if (!message) message = 'Something went wrong';

    // Handle specific cases (e.g., database, validation errors)
    if (err.name === 'ValidationError') {
        statusCode = 400;
        message = Object.values(err.errors).map(val => val.message).join(', ');
    }

    logger.error(`Error occurred: ${message} - StatusCode: ${statusCode} - Stack: ${err.stack}`);

    //TODO: mayur as per common response
    // Respond with a standardized error object 
    res.status(statusCode).json({
        isSuccess: false,
        statusCode,
        message,
    });
};

module.exports = errorHandler;
