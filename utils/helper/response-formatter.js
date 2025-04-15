const config = require("../../config/common.config");
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
        let errorMsg = config.messages[messageCode] ?? messageCode.message;
        if (!errorMsg) {
            errorMsg = messageCode;
        }
        if (typeof errorMsg === 'object' && errorMsg !== null) {
            console.log('data-->>' + data);
            console.log('errorMsg-->>' + errorMsg);
            errorMsg = 'Something went wrong, Please try again';
        }

        const response = {
            version: config.version,
            statusCode: code,
            isSuccess: result,
            data: data,
            message: errorMsg
        };
        return response;
    };
};
module.exports = responseFormatter;