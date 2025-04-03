const { createLogger, format, transports } = require('winston');
const commonConfig = require('../../config/common.config');
const { combine, timestamp, printf, errors } = format;

// Custom log format
const customFormat = printf(({ level, message, timestamp, stack }) => {
    return `${timestamp} [${level.toUpperCase()}]: ${stack || message}`;
});

// Logger configuration
const logger = createLogger({
    level: 'info', // Log all levels 'info' and below (e.g., error, warn)
    format: combine(
        timestamp({ format: commonConfig.loggerDateFormat }),
        errors({ stack: true }), // Log error stack traces
        customFormat
    ),
    transports: [
        new transports.Console(), // Log to the console
        new transports.File({ filename: 'logs/errors.log', level: 'error' }), // Log only errors to errors.log
        new transports.File({ filename: 'logs/combined.log' }) // Log all levels to combined.log
    ],
});

module.exports = logger;
