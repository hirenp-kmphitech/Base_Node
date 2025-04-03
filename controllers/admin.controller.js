const Q = require('q')
const config = require('../config/common.config')
const jwt = require('jsonwebtoken')
const fs = require('fs')
const AdminMaster = require('../models/AdminMaster');
const sendMail = require('../utils/sendMail')
const { forgotPasswordMail } = require('../utils/ContentProvider');
const { ObjectId } = require('mongodb')

const UserMaster = require('../models/UserMaster');
const paginateData = require('../utils/paginateData');
const { default: mongoose } = require('mongoose');
const publicPath = global.basedir + "/public/";

(async () => {
    try {
        const findAdmin = await AdminMaster.findOne({ email: "admin@gmail.com" })
        if (!findAdmin) {
            const adminOBJ = new AdminMaster({
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

const login = async (req, res) => {
    const deferred = Q.defer()
    const { email, password } = req.body
    try {
        const findAdmin = await AdminMaster.findOne({ email: email.toLowerCase() })
        if (findAdmin) {
            if (password == findAdmin.password) {
                const token = jwt.sign({ userId: findAdmin._id }, config.jwt.secret, { expiresIn: config.jwt.token_expiry })
                findAdmin._doc.token = token
                deferred.resolve(findAdmin);
            } else {
                deferred.reject("incorrect_password")
                return deferred.promise;
            }
        } else {
            deferred.reject("incorrect_email")
        }
    } catch (error) {
        deferred.reject(error.message)
    }
    return deferred.promise;
}

const forgotPassword = async (req, res) => {
    const deferred = Q.defer()
    const { email } = req.body;
    try {
        const randomOTP = Math.floor(Math.random() * (9999 - 1000 + 1)) + 1000
        const findAdmin = await AdminMaster.findOne({ email: email.toLowerCase() })
        if (!findAdmin) {
            deferred.reject("incorrect_email")
            return deferred.promise;
        } else {
            const updateOTP = await AdminMaster.findOneAndUpdate({ email: email.toLowerCase() }, { otp: randomOTP }, { new: true })
            if (updateOTP) {
                let mailContent = await forgotPasswordMail(findAdmin.name, randomOTP);
                sendMail(email.toLowerCase(), "Forgot Password Mail", mailContent);
                deferred.resolve(updateOTP);
            }
        }
    } catch (error) {
        deferred.reject(error.message);
    }
    return deferred.promise;
}

const verifyOTP = async (req, res) => {
    const deferred = Q.defer()
    const { otp, email } = req.body
    try {
        let findAdmin = await AdminMaster.findOne({ email: email.toLowerCase() })
        if (!findAdmin) {
            deferred.reject("incorrect_email")
            return deferred.promise;
        }
        if (otp == findAdmin.otp) {
            if (findAdmin.otp != null) {
                findAdmin.otp = null
                findAdmin.save()
                deferred.resolve({});
            }
        } else {
            deferred.reject("invalid_otp")
        }
    } catch (error) {
        deferred.reject(error.message);
    }
    return deferred.promise
}

const resetPassword = async (req, res) => {
    const deferred = Q.defer();
    const { email, new_password } = req.body;
    try {
        let adminDetails = await AdminMaster.findOne({ email: email });

        if (adminDetails != null) {
            if (adminDetails.password != new_password) {
                let userResponseObj = await AdminMaster.findOneAndUpdate({ email: email }, { password: new_password }, { new: true });
                deferred.resolve(userResponseObj);
            } else {
                deferred.reject('check_password');
            }
        }
        else {
            deferred.reject("incorrect_email");
        }
    } catch (error) {
        deferred.reject(error.message);
    }
    return deferred.promise;
}

const userList = async (req, res) => {
    const deferred = Q.defer();
    const { user_type, page = 1, limit, search, status } = req.body;
    try {
        const matchQuery = { user_type: user_type, profile_status: status, deleted_at: null };

        const result = await paginateData(UserMaster, ['name', 'email', 'phone', 'adres'], page, limit, search, matchQuery, { name: 1, email: 1, adres: 1, phone: 1, bio: 1, profile: 1, });
        deferred.resolve(result);
    } catch (error) {
        deferred.reject(error.message);
    }
    return deferred.promise;
};

const deleteUser = async (req, res) => {
    const deferred = Q.defer();
    const { user_id, delete_reason = "" } = req.body;
    try {
        const updateUser = await UserMaster.findOneAndUpdate({ _id: user_id }, { deleted_at: new Date(), delete_reason: delete_reason }, { new: true })
        if (updateUser) {
            await JobMaster.findOneAndDelete({ user_id: user_id });
            await AppliedUserMaster.findOneAndDelete({ user_id: user_id });
            await UserExperienceMaster.findOneAndDelete({ user_id: user_id });
            await NotificationMaster.findOneAndDelete({ user_id: user_id });
            await JobRatingMaster.findOneAndDelete({ user_id: user_id });
            await MessageMaster.findOneAndDelete({ $or: [{ sender_id: user_id }, { receiver_id: user_id }] });
        }
        deferred.resolve({});
    } catch (error) {
        deferred.reject(error.message);
    }
    return deferred.promise;
}


module.exports = {
    login,
    forgotPassword,
    verifyOTP,
    resetPassword,
    userList,
    deleteUser,
}