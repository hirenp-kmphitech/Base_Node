const ApiResponse = require('../../utils/services/ApiResponse');
const { default: rateLimit } = require('express-rate-limit');

const rateLimitMin = process.env.RATE_LIMIT_MIN_SETTING || 5;
const rateLimitRequestPerMin = process.env.RATE_LIMIT_REQUEST_PER_MIN_SETTING || 100;

const limiter = rateLimit({
    windowMs: parseInt(rateLimitMin) * 60 * 1000, // 5 minutes
    max: parseInt(rateLimitRequestPerMin), // limit each IP to 100 requests per windowMs
    message: ApiResponse.internalError("Too many requests from this IP, please try again after 5 minutes"),
    keyGenerator: (req) => req.ip, // Use the extracted IP address for rate limiting
});
module.exports = limiter;