const userController = {};
const UserMaster = require("../models/UserMaster");
const config = require('../config/common.config');
const AppleUserMaster = require('../models/AppleUserMaster');

const fs = require('fs');
const responseFormatter = require('../utils/response-formatter');
const formatter = new responseFormatter();
const publicPath = basedir + "/public/";
const userService = require('../services/userService');
const userRepository = require("../repositories/userRepository");


/** APIs */

userController.refreshToken = async function (req, res) {
    let response;
    const { user_id } = req.body;

    try {
        response = await userService.refreshToken(user_id);
    } catch (errorCode) {
        
        // Log some information
        logger.info(`Processing request with ID: ${req.query.user_id}`);
        
        console.error("userController.refreshToken - ", errorCode);
        response = formatter.formatResponse({}, 0, errorCode, false);
        next(error); // Pass the error to the global error handler
    }
    return res.status(response.statusCode).send(response);
}

userController.getUserDetail = async (user_id) => {
    let checkUser = await userRepository.findUser({ _id: user_id, deleted_at: null });
    return checkUser;
}


userController.sendOTP = async (req, res) => {
    let response;
    const { email } = req.body;
    try {
        response = await userService.sendOTP(email);
    } catch (error) {
        console.log("userController.sendOTP - ", error);
        response = formatter.formatResponse({}, 0, error.message, false);
    }
    return res.status(response.statusCode).send(response);
};

userController.signUp = async (req, res) => {
    let response;
    try {
        response = await userService.Registration(req.body)
    } catch (errorCode) {
        console.error("userController.signUp - ", errorCode);
        response = formatter.formatResponse({}, 0, errorCode, false);
    }
    return res.status(response.statusCode).send(response);
}

userController.isRegister = async (req, res) => {
    let response;
    try {

        response = await userService.isRegister(req.body);

    } catch (errorCode) {
        console.error("userController.isRegister- ", errorCode);
        response = formatter.formatResponse({}, 0, errorCode, false);
    }

    return res.status(response.statusCode).send(response);
}

userController.login = async (req, res) => {
    let response;
    const { email, pass, device_token = "", device_type = "" } = req.body;
    try {
        response = await userService.login(email, pass, device_token, device_type)

    } catch (errorCode) {
        console.error("userController.login- ", errorCode);
        response = formatter.formatResponse({}, 0, errorCode, false);
    }
    return res.status(response.statusCode).send(response);
}

userController.updateProfile = async function (req, res) {
    let response;
    try {
        let user_id = req.user._id;
        response = await userService.updateProfile(req, user_id);

    } catch (errorCode) {
        console.error("userController.updateProfile - ", errorCode);
        response = formatter.formatResponse({}, 0, errorCode, false);
    }
    return res.status(response.statusCode).send(response);
}

userController.changePassword = async function (req, res) {
    let response;
    const { user_id, old_password, new_password } = req.body;
    try {
        response = await userService.changePassword(user_id, old_password, new_password);

    } catch (errorCode) {
        console.error("userController.changePassword - ", errorCode);
        response = formatter.formatResponse({}, 0, errorCode, false);
    }
    return res.status(response.statusCode).send(response);
}

userController.forgotPassword = async function (req, res) {
    let response;
    const { email } = req.body;
    try {

        response = await userService.forgotPassword(email);
    } catch (errorCode) {
        console.error("userController.forgotPassword - ", errorCode);
        response = formatter.formatResponse({}, 0, errorCode, false);
    }
    return res.status(response.statusCode).send(response);
}

userController.verifyOTP = async function (req, res) {
    let response;
    const { email, otp } = req.body;
    try {

        response = await userService.verifyOTP(email, otp);
    } catch (errorCode) {
        console.error("userController.verifyOTP - ", errorCode);
        response = formatter.formatResponse({}, 0, errorCode, false);
    }
    return res.status(response.statusCode).send(response);
}

userController.updatePassword = async function (req, res) {
    let response;
    const { user_id, new_password } = req.body;
    try {
        response = await userService.updatePassword(user_id, new_password);

    } catch (errorCode) {
        console.error("userController.updatePassword - ", errorCode);
        response = formatter.formatResponse({}, 0, errorCode, false);
    }
    return res.status(response.statusCode).send(response);
}

userController.logOut = async function (req, res) {
    let response;
    try {
        let user_id = req.user._id;
        response = await userService.logOut(user_id);

    } catch (errorCode) {
        console.error("userController.Logout - ", errorCode);
        response = formatter.formatResponse({}, 0, errorCode, false);
    }
    return res.status(response.statusCode).send(response);
}

userController.deleteAccount = async function (req, res) {
    let response;
    const { delete_reason } = req.body;
    try {
        let user_id = req.user._id;
        response = await userService.deleteAccount(user_id, delete_reason);

    } catch (errorCode) {
        console.error("userController.deleteAccount - ", errorCode);
        response = formatter.formatResponse({}, 0, errorCode, false);
    }
    return res.status(response.statusCode).send(response);
}

userController.contactUs = async function (req, res) {
    let response;
    const { email, name, subject, message } = req.body;
    try {
        response = await userService.deleteAccount(email, name, subject, message);

    } catch (errorCode) {
        console.error("userController.contactUs - ", errorCode);
        response = formatter.formatResponse({}, 0, errorCode, false);
    }
    return res.status(response.statusCode).send(response);
}

module.exports = userController;