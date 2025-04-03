const config = require('../config/common.config');
const ResponseFormatter = require('../utils/helper/response-formatter');
const formatter = new ResponseFormatter();
const VersionMaster = require('../models/VersionMaster');


const routeMiddlewares = {
    validateRequest: function (requestSchema) {
        return (req, res, next) => {
            req.user_Ip = req.socket.remoteAddress;
            ['headers', 'params', 'query', 'body']
                .map(key => {
                    const schema = requestSchema[key];
                    const value = req[key];
                    if (schema) {
                        const { error } = schema.validate(value);
                        if (error) {
                            const { details } = error;
                            const message = details.map(i => i.message).join(',')

                            const finalRes = formatter.formatResponse({}, 422, message, false);
                            return res.status(finalRes.statusCode).send(finalRes);
                        }
                        else {
                            next();
                        }
                    }
                });

        };
    },
    checkVersion: async function (req, res, next) {
        let device_version = req.headers.versioncode ?? 1;
        let deviceType = req.headers.devicetype ?? "android";
        let current_version = await VersionMaster.findOne({ deviceType: deviceType }).exec();
        if (current_version && current_version.versionCode > device_version.toString()) {
            const finalRes = formatter.formatResponse({}, 426, config.messages["update_app_message"], false);
            return res.status(finalRes.statusCode).send(finalRes);
        } else {
            return next();
        }
    }
};

module.exports = routeMiddlewares;