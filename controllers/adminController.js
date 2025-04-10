const fs = require('fs')
const Admins = require('../models/Admins');
const sendMail = require('../utils/services/sendMail')
const { forgotPasswordMail } = require('../utils/helper/ContentProvider');

const publicPath = global.basedir + "/public/";
const adminService = require('../services/adminService');
const ApiResponse = require('../utils/services/ApiResponse');

(async () => {
    try {
        const findAdmin = await Admins.findOne({ email: "admin@gmail.com" })
        if (!findAdmin) {
            new Admins({
                name: "admin",
                email: "admin@gmail.com",
                password: "12345678",
            }).save();
            return;
        }
    } catch (error) {
        return error;
    }
})();

const login = async (req, res, next) => {
    let response;
    const { email, password } = req.body
    try {
        response = await adminService.login(email, password)
    } catch (error) {
        return next(ApiResponse.badRequest(error));
    }
    return res.status(response.statusCode).send(response);
}

const forgotPassword = async (req, res, next) => {
    let response;
    const { email } = req.body;
    try {
        response = await adminService.forgotPassword(email);
    } catch (error) {
        return next(ApiResponse.badRequest(error));
    }
    return res.status(response.statusCode).send(response);
}

const verifyOTP = async (req, res, next) => {
    let response;
    const { otp, email } = req.body
    try {
        response = await adminService.verifyOTP(email, otp);
    } catch (error) {
        return next(ApiResponse.badRequest(error));
    }
    return res.status(response.statusCode).send(response);
}

const resetPassword = async (req, res, next) => {
    let response;
    const { email, newPassword } = req.body;
    try {
        response = await adminService.resetPassword(email, newPassword);
    } catch (error) {
        return next(ApiResponse.badRequest(error));
    }
    return res.status(response.statusCode).send(response);
}

const userList = async (req, res, next) => {
    let response;
    const { user_type, page = 1, limit, search, status } = req.body;
    try {
        response = await adminService.getUserList(page, limit, search, user_type, status);
    } catch (error) {
        return next(ApiResponse.badRequest(error));
    }
    return res.status(response.statusCode).send(response);
}

const deleteUser = async (req, res, next) => {
    let response;
    const { userId, deleteReason = "" } = req.body;
    try {
        response = await userService.deleteUser(userId, deleteReason);
    } catch (error) {
        return next(ApiResponse.badRequest(error));
    }
    return res.status(response.statusCode).send(response);
}


module.exports = {
    login,
    forgotPassword,
    verifyOTP,
    resetPassword,
    userList,
    deleteUser,
}