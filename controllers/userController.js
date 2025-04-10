const userController = {};
const fs = require('fs');
const publicPath = basedir + "/public/";
const userService = require('../services/userService');
const ApiResponse = require("../utils/services/ApiResponse");


/** APIs */

userController.updateProfile = async function (req, res, next) {
    let response;
    try {
        let userId = req.user._id;
        response = await userService.updateProfile(req, userId);

    } catch (errorCode) {
        console.error("userController.updateProfile - ", errorCode);
        return next(ApiResponse.badRequest(errorCode));
    }
    return res.status(response.statusCode).send(response);
}

userController.changePassword = async function (req, res, next) {
    let response;
    const { oldPassword, newPassword } = req.body;
    try {
        let userId = req.user._id;
        response = await userService.changePassword(userId, oldPassword, newPassword, req.token);

    } catch (errorCode) {
        console.error("userController.changePassword - ", errorCode);
        return next(ApiResponse.badRequest(errorCode));
    }
    return res.status(response.statusCode).send(response);
}

userController.logOut = async function (req, res, next) {
    let response;
    try {
        let userId = req.user._id;
        response = await userService.logOut(userId);

    } catch (errorCode) {
        console.error("userController.Logout - ", errorCode);
        return next(ApiResponse.badRequest(errorCode));
    }
    return res.status(response.statusCode).send(response);
}

userController.deleteAccount = async function (req, res, next) {
    let response;
    const { deleteReason } = req.body;
    try {
        let userId = req.user._id;
        response = await userService.deleteAccount(userId, deleteReason);

    } catch (errorCode) {
        console.error("userController.deleteAccount - ", errorCode);
        return next(ApiResponse.badRequest(errorCode));
    }
    return res.status(response.statusCode).send(response);
}

userController.contactUs = async function (req, res, next) {
    let response;
    const { email, name, subject, message } = req.body;
    try {
        response = await userService.contactUs(email, name, subject, message);

    } catch (errorCode) {
        console.error("userController.contactUs - ", errorCode);
        return next(ApiResponse.badRequest(errorCode));
    }
    return res.status(response.statusCode).send(response);
}

module.exports = userController;