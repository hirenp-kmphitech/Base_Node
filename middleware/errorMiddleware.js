const appError = require('../utils/services/appError');
const logger = require('../utils/services/logger');

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

    logger.error(`Error occurred: ${message} - StatusCode: ${statusCode}`);

    // Respond with a standardized error object 
    res.status(statusCode).json(new appError(message, statusCode));
};

module.exports = errorHandler;
