let adminService = {};
const adminRepository = require('../repositories/adminRepository');
const userRepository = require('../repositories/userRepository');
const sendMail = require("../utils/services/sendMail");
const { forgotPasswordMail } = require("../utils/helper/ContentProvider");
const jwt = require('jsonwebtoken');
const Users = require('../models/Users');
const ApiResponse = require('../utils/services/ApiResponse');
const commonConfig = require('../config/common.config');

const login = async (email, password) => {
  let response;
  try {
    const findAdmin = await adminRepository.findOne({ email: email.toLowerCase() })
    if (findAdmin) {
      if (password == findAdmin.password) {
        const token = jwt.sign({ userId: findAdmin._id }, commonConfig.jwt.secret, { expiresIn: commonConfig.jwt.token_expiry })
        findAdmin._doc.token = token;
        response = ApiResponse.success(findAdmin, commonConfig.messages['login_success']);
      } else {
        response = ApiResponse.conflict(commonConfig.messages['incorrect_password']);
      }
    } else {
      response = ApiResponse.notFound(commonConfig.messages['incorrect_email']);
    }
  } catch (error) {
    throw error;
  }


  return response;

};

const forgotPassword = async (email) => {
  let response;
  try {
    const randomOTP = Math.floor(Math.random() * (9999 - 1000 + 1)) + 1000
    const findAdmin = await adminRepository.findOne({ email: email.toLowerCase() })
    if (!findAdmin) {
      response = ApiResponse.notFound(commonConfig.messages['incorrect_email']);
    } else {
      const updateOTP = await adminRepository.findUserAndUpdate({ email: email.toLowerCase() }, { otp: randomOTP }, { new: true })
      if (updateOTP) {
        let mailContent = forgotPasswordMail(findAdmin.name, randomOTP);
        sendMail(email.toLowerCase(), "Forgot Password Mail", mailContent);
        response = ApiResponse.success(updateOTP, commonConfig.messages['otp_verified']);
      }
    }
  } catch (error) {
    throw error;
  }
  return response;
};


const verifyOTP = async (email, otp) => {
  let response;
  try {
    let findAdmin = await adminRepository.findOne({ email: email.toLowerCase() })
    if (!findAdmin) {
      deferred.reject("incorrect_email")
      response = ApiResponse.notFound(commonConfig.messages['incorrect_email']);
    }
    if (otp == findAdmin.otp) {
      if (findAdmin.otp != null) {
        findAdmin.otp = null
        findAdmin.save()
        response = ApiResponse.success({}, commonConfig.messages['otp_verified']);
      }
    } else {
      response = ApiResponse.conflict(commonConfig.messages['invalid_otp']);
    }
  } catch (error) {
    throw error;
  }
  return response;
};


const resetPassword = async (email, newPassword) => {
  let response;
  try {
    let adminDetails = await adminRepository.findOne({ email: email });

    if (adminDetails != null) {
      if (adminDetails.password != newPassword) {
        let userResponseObj = await adminRepository.findUserAndUpdate({ email: email }, { password: newPassword });
        response = ApiResponse.success(userResponseObj, commonConfig.messages['password_change_success']);
      } else {
        response = ApiResponse.conflict(commonConfig.messages['check_password']);
      }
    }
    else {
      response = ApiResponse.notFound(commonConfig.messages['incorrect_email']);
    }
  } catch (error) {
    throw error;
  }
  return response;
}

const getUserList = async (page, limit, search, user_type, status) => {
  let response;
  try {
    const matchQuery = { user_type: user_type, profile_status: status, deletedAt: null };

    const result = await paginateData(Users, ['name', 'email', 'phone', 'adres'], page, limit, search, matchQuery, { name: 1, email: 1, adres: 1, phone: 1, bio: 1, profile: 1, });
    response = ApiResponse.success(result, commonConfig.messages['list_success']);
  } catch (error) {
    throw error;
  }
  return response;
}

const deleteUser = async (userId, deleteReason) => {
  let response;
  try {
    const updateUser = await userRepository.findUserAndUpdate({ _id: userId }, { deletedAt: new Date(), deleteReason: deleteReason })
    if (updateUser) {
      response = ApiResponse.success({}, commonConfig.messages['delete_success']);
    }
    else {
      response = ApiResponse.notFound(commonConfig.messages['invalid_userId']);
    }
  } catch (error) {
    throw error;
  }
  return response;
}


adminService = {
  forgotPassword,
  verifyOTP,
  login,
  resetPassword,
  getUserList,
  deleteUser,
};

module.exports = adminService;

function makeid(length) {
  let result = '';
  let characters = '0123456789';
  let charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() *
      charactersLength));
  }
  return result;
}
