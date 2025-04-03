const commonConfig = require("../../config/common.config");

class appError {
    constructor(msg, statusCode) {

        this.version = commonConfig.version;
        this.statusCode = statusCode || 500; // Default to 500 if no status code is provided
        this.isSucess = false;
        this.data = null;
        this.message = msg;
    }
}

module.exports = appError;