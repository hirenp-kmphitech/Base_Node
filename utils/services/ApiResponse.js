const commonConfig = require("../../config/common.config");

class ApiResponse {
    constructor(isSuccess, statusCode, message, data = null) {
        this.version = commonConfig.version; // API version, can be made dynamic if needed
        this.statusCode = statusCode;
        this.isSuccess = isSuccess;
        this.data = data;
        let resMessage = commonConfig.messages[message] ?? message;
        if (!resMessage) {
            resMessage = (typeof message === "object") ? ((message.message != null) ? message.message : message) : message
        }

        this.message = resMessage;
    }

    /**
     * Success response
     * @param {*} data - Response data
     * @param {string} message - Success message
     * @param {number} statusCode - HTTP status code (default: 200)
     * @returns {ApiResponse}
     */
    static success(data, message = "Operation Executed Successfully", statusCode = 200) {
        return new ApiResponse(true, statusCode, message, data);
    }

    /**
     * Not found response
     * @param {string} message - Error message (default: "Resource not found")
     * @param {*} data - Additional error data
     * @returns {ApiResponse}
     */
    static notFound(message = "Resource not found", data = null) {
        return new ApiResponse(false, 404, message, data);
    }

    /**
     * Conflict response
     * @param {string} message - Error message (default: "Conflict occurred")
     * @param {*} data - Additional error data
     * @returns {ApiResponse}
     */
    static conflict(message = "Conflict occurred", data = null) {
        return new ApiResponse(false, 409, message, data);
    }

    /**
     * Bad request response
     * @param {string} message - Error message (default: "Invalid request")
     * @param {*} data - Additional error data
     * @returns {ApiResponse}
     */
    static badRequest(message = "Invalid request", data = null) {
        return new ApiResponse(false, 400, message, data);
    }

    /**
     * Internal server error response
     * @param {string} message - Error message (default: "Internal server error")
     * @param {*} data - Additional error data
     * @returns {ApiResponse}
     */
    static internalError(message = "Internal server error", data = null) {
        return new ApiResponse(false, 500, message, data);
    }

    /**
     * Unauthorized response
     * @param {string} message - Error message (default: "Unauthorized access")
     * @param {*} data - Additional error data
     * @returns {ApiResponse}
     */
    static unauthorized(message = "Unauthorized access", data = null) {
        return new ApiResponse(false, 401, message, data);
    }

    /**
     * Forbidden response
     * @param {string} message - Error message (default: "Forbidden access")
     * @param {*} data - Additional error data
     * @returns {ApiResponse}
     */
    static forbidden(message = "Forbidden access", data = null) {
        return new ApiResponse(false, 403, message, data);
    }
}

module.exports = ApiResponse;
