const config = require('../config/common.config');
const ResponseFormatter = require('../utils/helper/response-formatter');
const formatter = new ResponseFormatter();
const AppVersion = require('../models/AppVersion');
const ApiResponse = require('../utils/services/ApiResponse');
let response;

const routeMiddlewares = {
    validateRequest: function (requestSchema) {
        return (req, res, next) => {
            req.user_Ip = req.socket.remoteAddress;
            for (let key of ['headers', 'params', 'query', 'body']) {
                const schema = requestSchema[key];

                if (schema) {
                    const { error } = schema.validate(req[key]);

                    if (error) {
                        const { details } = error;
                        const message = details.map(i => i.message).join(',');
                        response = ApiResponse.unprocessEntity(message);
                        return res.status(response.statusCode).send(response);
                    }
                }
            }
            next();

        };
    },
    checkVersion: async function (req, res, next) {
        let deviceVersion = req.headers.versioncode;
        let deviceType = req.headers.devicetype;
        if (!deviceVersion || !deviceType) {
            return next();
        }
        let current_version = await AppVersion.findOne({ deviceType: deviceType }).exec();
        if (current_version && current_version.versionCode > deviceVersion.toString()) {
            response = ApiResponse.appupdate(config.messages["update_app_message"]);
            return res.status(response.statusCode).send(response);
        } else {
            return next();
        }
    }
};

module.exports = routeMiddlewares;