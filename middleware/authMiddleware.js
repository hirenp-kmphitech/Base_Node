const config = require('../config/common.config');
const ResponseFormatter = require('../utils/helper/response-formatter');
const formatter = new ResponseFormatter();
const jwt = require('jsonwebtoken');
const AdminMaster = require('../models/AdminMaster');
const authController = require('../controllers/authController');


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

                const finalRes = formatter.formatResponse({}, 401, config.messages[errorCode], false);
                return res.status(finalRes.statusCode).send(finalRes);
            }


            jwt.verify(token, config.jwt.secret, async (err, decoded) => {
                if (err || !decoded || !decoded.userId) {
                    errorCode = "incorrect_token";
                    const finalRes = formatter.formatResponse({}, 401, config.messages[errorCode], false);
                    return res.status(finalRes.statusCode).send(finalRes);
                }
                console.log('decoded', decoded);
                // TODO : enable this code if user context is required in auth protected APIs
                const user = await authController.getUserDetail(decoded.userId);
                if (user == null) {
                    console.error("authorize failure - ");
                    const finalRes = formatter.formatResponse({}, 404, config.messages["invalid_userId"], false);
                    return res.status(finalRes.statusCode).send(finalRes);
                }
                // eslint-disable-next-line no-param-reassign
                req.user = user;
                req.token = token;
                return next();
            });
        } catch (errorCode) {
            console.error("authorize failure - ", errorCode);
            const finalRes = formatter.formatResponse({}, 407, config.messages[errorCode], false);
            return res.status(finalRes.statusCode).send(finalRes);
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

                const finalRes = formatter.formatResponse({}, 404, config.messages[errorCode], false);
                return res.send(finalRes);
            }


            jwt.verify(token, config.jwt.secret, async (err, decoded) => {
                if (err || !decoded || !decoded.userId) {
                    errorCode = "incorrect_token";
                    const finalRes = formatter.formatResponse({}, 401, config.messages[errorCode], false);
                    return res.status(401).send(finalRes);
                }
                console.log('decoded', decoded);
                // TODO : enable this code if user context is required in auth protected APIs
                const user = await AdminMaster.findOne({ _id: decoded.userId });
                if (user == null) {
                    console.error("authorize failure - ");
                    const finalRes = formatter.formatResponse({}, 404, config.messages["incorrect_token"], false);
                    return res.send(finalRes);
                }
                // eslint-disable-next-line no-param-reassign
                req.user = user;
                return next();
            });
        } catch (errorCode) {
            console.error("authorize failure - ", errorCode);
            const finalRes = formatter.formatResponse({}, 407, config.messages[errorCode], false);
            return res.send(finalRes);
        }
    },
};

module.exports = authMiddleware;