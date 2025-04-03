const authController = {};
const fs = require('fs');

const publicPath = basedir + "/public/";
const authService = require('../services/authService');
const userRepository = require("../repositories/userRepository");
const ApiResponse = require("../utils/services/ApiResponse");


/** APIs */

authController.refreshToken = async function (req, res, next) {
    let response;
    const { userId } = req.body;

    try {
        response = await authService.refreshToken(userId);
    } catch (errorCode) {
        console.error("authController.refreshToken - ", errorCode);
        return next(ApiResponse.badRequest(errorCode));
    }
    return res.status(response.statusCode).send(response);
}

authController.getUserDetail = async (userId) => {
    let checkUser = await userRepository.findUser({ _id: userId, deletedAt: null });
    return checkUser;
}


authController.sendOTP = async (req, res, next) => {
    let response;
    const { email } = req.body;
    try {
        response = await authService.sendOTP(email);
    } catch (error) {
        console.log("authController.sendOTP - ", error);
        return next(ApiResponse.badRequest(errorCode));
    }
    return res.status(response.statusCode).send(response);
};

authController.signUp = async (req, res, next) => {
    let response;
    try {
        response = await authService.Registration(req)
    } catch (errorCode) {
        console.error("authController.signUp - ", errorCode);
        return next(ApiResponse.badRequest(errorCode));
    }
    return res.status(response.statusCode).send(response);
}

authController.isRegister = async (req, res, next) => {
    let response;
    try {

        response = await authService.isRegister(req.body);

    } catch (errorCode) {
        console.error("authController.isRegister- ", errorCode);
        return next(ApiResponse.badRequest(errorCode));
    }

    return res.status(response.statusCode).send(response);
}

authController.login = async (req, res, next) => {
    let response;

    const { email, pass, deviceToken = "", deviceType = "" } = req.body;
    try {
        response = await authService.login(email, pass, deviceToken, deviceType)

    } catch (errorCode) {
        return next(ApiResponse.badRequest(errorCode));
    }
    return res.status(response.statusCode).send(response);
}

authController.forgotPassword = async function (req, res, next) {
    let response;
    const { email } = req.body;
    try {

        response = await authService.forgotPassword(email);
    } catch (errorCode) {
        console.error("authController.forgotPassword - ", errorCode);
        return next(ApiResponse.badRequest(errorCode));
    }
    return res.status(response.statusCode).send(response);
}

authController.verifyOTP = async function (req, res, next) {
    let response;
    const { email, otp } = req.body;
    try {

        response = await authService.verifyOTP(email, otp);
    } catch (errorCode) {
        console.error("authController.verifyOTP - ", errorCode);
        return next(ApiResponse.badRequest(errorCode));
    }
    return res.status(response.statusCode).send(response);
}

authController.verifyForgotPassOTP = async function (req, res, next) {
    let response;
    try {
        response = await authService.verifyForgotPassOTP(req.body);
    } catch (errorCode) {
        console.error("authController.verifyForgotPassOTP - ", errorCode);
        return next(ApiResponse.badRequest(errorCode));
    }
    return res.status(response.statusCode).send(response);
}

authController.updatePassword = async function (req, res, next) {
    let response;
    const { userId, new_password } = req.body;
    try {
        response = await authService.updatePassword(userId, new_password);

    } catch (errorCode) {
        console.error("authController.updatePassword - ", errorCode);
        return next(ApiResponse.badRequest(errorCode));
    }
    return res.status(response.statusCode).send(response);
}
module.exports = authController;