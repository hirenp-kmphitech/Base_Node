const config = require("../config/common.config");
const responseFormatter = function () {
    /**
     * Format response to send unique response and message
     *
     * @param success
     * @param message
     * @param result
     * @returns {{success: *, message: *, result: *}}
     */
    this.formatResponse = function (data, code, messageCode, result) {
        let errorMsg = config.messages[messageCode];
        if (!errorMsg) {
            errorMsg = messageCode;
        }

        const response = {
            version: config.version,
            data: data,
            statusCode: code,
            message: errorMsg,
            isSuccess: result
        };
        return response;
    };
};
module.exports = responseFormatter;