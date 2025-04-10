const config = require('../config/common.config');
const ResponseFormatter = require('../utils/helper/response-formatter');
const formatter = new ResponseFormatter();
const jwt = require('jsonwebtoken');
const Admins = require('../models/Admins');
const authController = require('../controllers/authController');
const ApiResponse = require('../utils/services/ApiResponse');
let response;

const authMiddleware = {
    authorize: async function (req, res, next) {
        // TODO: check id user is active
        try {
            req.user_Ip = req.socket.remoteAddress;
            let token;
            let errorCode = "unknown_error";
            if (req.headers.authorization) {
                if (typeof req.headers.authorization !== 'string' || req.headers.authorization.indexOf('Bearer ') === -1) {
                    errorCode = "incorrect_token";
                } else {
                    token = req.headers.authorization.split(' ')[1];
                }
            } else if (req.headers && req.headers.token) {
                token = req.headers.token;
            } else {
                errorCode = "incorrect_token";
            }
            console.log('token', token);

            if (!token && errorCode) {
                response = ApiResponse.unauthorized(config.messages[errorCode]);
                return res.status(response.statusCode).send(response);
            }


            jwt.verify(token, config.jwt.secret, async (err, decoded) => {
                if (err || !decoded || !decoded.userId) {
                    if (err.name == "TokenExpiredError") {
                        errorCode = "token_expired";
                        response = ApiResponse.unauthorizedRefresh(config.messages[errorCode]);
                        return res.status(response.statusCode).send(response);
                    } else {
                        errorCode = "incorrect_token";
                        response = ApiResponse.unauthorized(config.messages[errorCode]);
                        return res.status(response.statusCode).send(response);
                    }
                }
                console.log('decoded', decoded);
                // TODO : enable this code if user context is required in auth protected APIs
                const user = await authController.getUserDetail(decoded.userId);
                if (user == null) {
                    console.error("authorize failure - ");
                    response = ApiResponse.notFound(config.messages["invalid_userId"]);
                    return res.status(response.statusCode).send(response);

                }
                // eslint-disable-next-line no-param-reassign
                req.user = user;
                req.token = token;
                return next();
            });
        } catch (errorCode) {
            console.error("authorize failure - ", errorCode);
            response = ApiResponse.badRequest(config.messages[errorCode]);
            return res.status(response.statusCode).send(response);
        }
    },
    authorizeAdmin: async function (req, res, next) {
        // TODO: check id user is active
        try {
            req.user_Ip = req.socket.remoteAddress;
            let token;
            let errorCode = "unknown_error";
            if (req.headers.authorization) {
                if (typeof req.headers.authorization !== 'string' || req.headers.authorization.indexOf('Bearer ') === -1) {
                    errorCode = "incorrect_token";
                } else {
                    token = req.headers.authorization.split(' ')[1];
                }
            } else if (req.headers && req.headers.token) {
                token = req.headers.token;
            } else {
                errorCode = "incorrect_token";
            }
            console.log('token', token);

            if (!token && errorCode) {
                response = ApiResponse.unauthorized(config.messages[errorCode]);
                return res.status(response.statusCode).send(response);
            }


            jwt.verify(token, config.jwt.secret, async (err, decoded) => {
                if (err || !decoded || !decoded.userId) {
                    if (err.name == "TokenExpiredError") {
                        errorCode = "token_expired";
                        response = ApiResponse.unauthorizedRefresh(config.messages[errorCode]);
                        return res.status(response.statusCode).send(response);
                    } else {
                        errorCode = "incorrect_token";
                        response = ApiResponse.unauthorized(config.messages[errorCode]);
                        return res.status(response.statusCode).send(response);

                    }
                }
                console.log('decoded', decoded);
                // TODO : enable this code if user context is required in auth protected APIs
                const user = await Admins.findOne({ _id: decoded.userId });
                if (user == null) {
                    response = ApiResponse.notFound(config.messages["invalid_userId"]);
                    return res.status(response.statusCode).send(response);
                }
                // eslint-disable-next-line no-param-reassign
                req.user = user;
                return next();
            });
        } catch (errorCode) {
            console.error("authorize failure - ", errorCode);
            response = ApiResponse.badRequest(config.messages[errorCode]);
            return res.status(response.statusCode).send(response);
        }
    },
};

module.exports = authMiddleware;