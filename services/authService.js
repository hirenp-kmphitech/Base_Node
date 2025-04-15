let authService = {};
const userRepository = require('../repositories/userRepository');
const otpRepository = require('../repositories/otpRepository');
const config = require('../config/common.config');
const sendMail = require("../utils/services/sendMail");
const { contactUsMail, registerMail, forgotPasswordMail } = require("../utils/helper/ContentProvider");
const jwt = require('jsonwebtoken');
const appleUserRepository = require('../repositories/appleUserRepository');
const ApiResponse = require('../utils/services/ApiResponse');

const sendOTP = async (email) => {
  let response;
  try {

    const randomOTP = (config.IS_TESTING == "true") ? config.TESTING_OTP : Math.floor(Math.random() * (9999 - 1000 + 1)) + 1000;
    const emailLower = email.toLowerCase();
    const checkEmail = await userRepository.findUserByEmail(emailLower);

    if (!checkEmail) {
      const checkOTP = await otpRepository.findOTPByEmail(emailLower);

      if (!checkOTP) {
        await otpRepository.createOTP(emailLower, randomOTP);
      } else {
        await otpRepository.updateOTP(checkOTP._id, emailLower, randomOTP);
      }

      // Uncomment and adjust as needed to send mail
      // let mailContent = registerMail("", randomOTP);
      // await sendMail(email, "Registration OTP", mailContent);

      response = ApiResponse.success({ otpCode: randomOTP, email: email }, config.messages['otp_send']);
    } else {
      response = ApiResponse.conflict(config.messages['already_register']);
    }
  } catch (error) {
    throw error;
  }
  return response;
};

const forgotPassword = async (email) => {
  let response;
  try {
    let otpCode = (config.IS_TESTING == "true") ? config.TESTING_OTP : makeid(4);
    let emailLower = email.toLowerCase();
    const checkOTP = await otpRepository.findOTPByEmail(emailLower);
    if (!checkOTP) {
      await otpRepository.createOTP(emailLower, otpCode);
    } else {
      await otpRepository.updateOTP(checkOTP._id, emailLower, otpCode);
    }

    let userResponseObj = await userRepository.findUserAndUpdate({ email: emailLower }, { ucode: otpCode });
    if (userResponseObj) {
      let responseMsg = "";
      if (userResponseObj != null && userResponseObj.is_fb == 1) {
        responseMsg = emailLower + " " + config.messages['isFb_user'];
        response = ApiResponse.badRequest(responseMsg)
      }
      else if (userResponseObj != null && userResponseObj.is_google == 1) {
        responseMsg = emailLower + " " + config.messages['isGoogle_user'];
        response = ApiResponse.badRequest(responseMsg);
      }
      else if (userResponseObj != null && userResponseObj.is_apple == 1) {
        responseMsg = emailLower + " " + config.messages['isApple_user'];
        response = ApiResponse.badRequest(responseMsg);
      }
      else {
        // let mailContent = await forgotPasswordMail(userResponseObj.name, otpCode);
        // sendMail(email, "Forgot Password Mail", mailContent);
        response = ApiResponse.success({ otpCode: otpCode, email: email, _id: userResponseObj._id }, config.messages['reset_password_success']);
      }
    }
    else {
      response = ApiResponse.notFound(config.messages['invalid_userId']);
    }
  } catch (error) {
    throw error;
  }
  return response;
};


const verifyOTP = async (email, otp) => {
  let response;
  try {
    let checkOTP = await otpRepository.findOTP({ otpCode: otp, email });
    if (checkOTP != null) {
      await otpRepository.deleteOTP({ "_id": checkOTP._id });
      response = ApiResponse.success({}, config.messages['otp_verified']);
    }
    else {
      response = ApiResponse.notFound(config.messages['invalid_otp']);
    }
  } catch (error) {
    throw error;
  }
  return response;
};

const login = async (email, pass, deviceToken = "", deviceType = "") => {
  let response;
  try {
    let userResponseObj = await userRepository.findUser({ email: email.toLowerCase(), deletedAt: null });
    if (userResponseObj) {
      let responseMsg = "";
      if (userResponseObj != null && userResponseObj.is_fb == 1) {
        responseMsg = email + " " + config.messages['isFb_user'];
        response = ApiResponse.badRequest(responseMsg)
      }
      else if (userResponseObj != null && userResponseObj.is_google == 1) {
        responseMsg = email + " " + config.messages['isGoogle_user'];
        response = ApiResponse.badRequest(responseMsg);
      }
      else if (userResponseObj != null && userResponseObj.is_apple == 1) {
        responseMsg = email + " " + config.messages['isApple_user'];
        response = ApiResponse.badRequest(responseMsg);
      }
      else if (userResponseObj.password == pass) {
        await userRepository.findUserAndUpdate({ _id: userResponseObj._id }, { deviceToken: deviceToken, deviceType: deviceType });
        let token = jwt.sign({ userId: userResponseObj._id }, config.jwt.secret, { expiresIn: config.jwt.token_expiry });
        userResponseObj._doc.token = token;
        userResponseObj._doc.deviceToken = deviceToken;
        userResponseObj._doc.deviceType = deviceType;
        response = ApiResponse.success(userResponseObj, config.messages['login_success']);
      }
      else {
        response = ApiResponse.conflict(config.messages['incorrect_password']);
      }
    }
    else {
      response = ApiResponse.notFound(config.messages['incorrect_email']);
    }
  } catch (error) {
    throw error;
  }
  return response;
}

const refreshToken = async (userId) => {
  let response;
  try {
    let checkUser = await userRepository.findUser({ _id: userId, deletedAt: null });
    if (checkUser == null) {
      response = ApiResponse.notFound(config.messages['invalid_userId']);
    }
    else {
      let token = jwt.sign({ userId: userId }, config.jwt.secret, { expiresIn: config.jwt.token_expiry });
      response = ApiResponse.success({ token: token }, config.messages['token_updated_success']);
    }
  } catch (error) {
    throw error;
  }
  return response
}

const Registration = async (request) => {
  const { email, pass, name, deviceType, deviceToken, isFb, fbId, isGoogle, googleId, isApple, appleId, otpCode } = request.body;
  let response;
  try {
    let checkOTP = await otpRepository.findOTP({ otpCode: otpCode, email });
    if (!checkOTP) {
      response = ApiResponse.notFound(config.messages['invalid_otp']);
      return response;
    }
    await otpRepository.deleteOTP({ "_id": checkOTP._id });

    let checkUser = await userRepository.findUser({ email: email.toLowerCase(), deletedAt: null });
    if (checkUser != null && checkUser.isFb == 1) {
      response = ApiResponse.badRequest(config.messages['isFb_user'])
    }
    else if (checkUser != null && checkUser.isGoogle == 1) {
      response = ApiResponse.badRequest(config.messages['isGoogle_user']);
    }
    else if (checkUser != null && checkUser.isApple == 1) {
      response = ApiResponse.badRequest(config.messages['isApple_user']);
    }
    else if (checkUser != null) {
      response = ApiResponse.conflict(config.messages['already_register']);
    }
    else {
      let profile = request.file ? (request.file.filename ?? '') : '';

      let user = {};
      user.email = email.toLowerCase();
      user.password = pass;
      user.is_confirm = "1";
      user.name = name;
      user.profile = profile;
      user.token = "";
      user.isFb = isFb;
      user.fbId = fbId;
      user.isGoogle = isGoogle;
      user.googleId = googleId;
      user.isApple = isApple;
      user.appleId = appleId;
      user.deviceType = deviceType;
      user.deviceToken = deviceToken;

      let document = await userRepository.createUser(user);
      let token = jwt.sign({ userId: document._id }, config.jwt.secret, { expiresIn: config.jwt.token_expiry });
      document.token = token;

      response = ApiResponse.success(document, config.messages['register_success']);
    }
  } catch (error) {
    throw error;
  }
  return response;
}

const updatePassword = async (userId, newPassword) => {
  let response;
  try {
    let getUser = await userRepository.findUser({ _id: userId });

    if (getUser != null) {
      await userRepository.findUserAndUpdate({ _id: userId }, { password: newPassword });
      response = ApiResponse.success({}, config.messages['password_change_success']);

    }
    else {
      response = ApiResponse.notFound(config.messages['invalid_userId']);
    }
  } catch (error) {
    throw error;
  }
  return response;
}


const isRegister = async (requestData) => {
  let response;
  const { device_token, device_type, email, name, is_social_type, is_google, google_id, is_fb, fb_id, is_apple, apple_id } = requestData;
  try {
    if (is_fb == 0 && is_apple == 0 && is_google == 0 && email == "") {
      let resObj = new Object();
      resObj.message = "social_validation";
      resObj.code = 0;
      resObj.result = false;
      response = ApiResponse.badRequest(config.messages['social_validation']);
      return response;
    }
    let user_detail;
    if (email && email != '') {
      user_detail = await userRepository.findUser({ $or: [{ email: email.toLowerCase() }, { name: name.toLowerCase() }], deleted_at: null });
    }
    else {
      user_detail = await userRepository.findUser({ deleted_at: null, $or: [{ fb_id: fb_id, apple_id: apple_id, google_id: google_id }] });
    }

    if (user_detail && user_detail.is_fb == "0" && user_detail.is_apple == "0" && user_detail.is_google == "0") {
      let resObj = new Object();
      resObj.message = user_detail.email + '' + config.messages["is_normal_user"];
      resObj.code = 4;
      resObj.result = false;
      response = ApiResponse.success(resObj, resObj.message, 202);
    }
    else if (user_detail && user_detail[is_social_type] == "0" && user_detail.is_fb == "1") {

      let resObj = new Object();
      resObj.message = user_detail.email + '' + config.messages["is_fb_user"];
      resObj.code = 4;
      resObj.result = false;
      response = ApiResponse.success(resObj, resObj.message, 202);
    }
    else if (user_detail && user_detail[is_social_type] == "0" && user_detail.is_google == "1") {
      let resObj = new Object();
      resObj.message = user_detail.email + '' + config.messages["is_google_user"];
      resObj.code = 4;
      resObj.result = false;
      response = ApiResponse.success(resObj, resObj.message, 202);
    }
    else if (user_detail && user_detail[is_social_type] == "0" && user_detail.is_apple == "1") {
      let resObj = new Object();
      resObj.message = user_detail.email + '' + config.messages["is_apple_user"];
      resObj.code = 4;
      resObj.result = false;
      response = ApiResponse.success(resObj, resObj.message, 202);
    }
    else if (user_detail && (user_detail.is_apple == is_apple || user_detail.is_google == is_google || user_detail.is_fb == is_fb)) {
      await userRepository.findUserAndUpdate({ _id: user_detail._id }, { device_token: device_token, device_type: device_type });
      let token = jwt.sign({ userId: user_detail._id }, config.jwt.secret, { expiresIn: config.jwt.token_expiry });
      user_detail._doc.token = token;
      let calculatedAge = 0;
      if (user_detail.dob != "") {
        calculatedAge = calculateAge(user_detail.dob);
      }
      user_detail._doc.age = calculatedAge;
      response = ApiResponse.success(user_detail, config.messages['login_success']);
    }
    else {

      if (is_apple == 1) {
        let appleData = await appleUserRepository.findUser({ apple_id });
        if (appleData == null) {
          let newAppleUser = new Object();
          newAppleUser.apple_id = apple_id;
          newAppleUser.name = name;
          newAppleUser.email = email.toLowerCase();
          await appleUserRepository.insert(newAppleUser)

          let resObj = new Object();
          resObj.data = appleData;
          resObj.message = "not_registered_user";
          resObj.code = 3;
          resObj.result = false;
          response = ApiResponse.success(resObj, config.messages['not_registered_user'], 203);

        }
        else {
          let resObj = new Object();
          resObj.message = "not_registered_user";
          resObj.data = (appleData != null) ? appleData : {};
          resObj.code = 3;
          resObj.result = false;
          response = ApiResponse.success(resObj, config.messages['not_registered_user'], 203);
        }
      }
      else {
        let resObj = new Object();
        resObj.message = "not_registered_user";
        resObj.data = {};
        resObj.code = 3;
        resObj.result = false;
        response = ApiResponse.success(resObj, config.messages['not_registered_user'], 203);
      }
    }

  } catch (error) {
    console.log('errror' + error);
    throw error;
  }
  return response;
}


const verifyForgotPassOTP = async (requestData) => {
  const { otp, email } = requestData;
  let response;
  try {
    const userResponseObj = await userRepository.findUser({ $or: [{ email: email.toLowerCase() }], deletedAt: null });
    if (userResponseObj) {
      let checkOTP = await otpRepository.findOTP({ otpCode: otp, email: userResponseObj.email });

      if (checkOTP && checkOTP != null) {
        await otpRepository.deleteOTP({ "_id": checkOTP._id });
        response = ApiResponse.success({ userId: userResponseObj._id }, config.messages['otp_verified']);
      }
      else {
        response = ApiResponse.notFound(config.messages['invalid_otp'], 202);
      }
    }
    else {
      response = ApiResponse.notFound(config.messages['incorrect_email'], 202);
    }


  } catch (error) {
    throw error;
  }
  return response;
}

authService = {
  sendOTP,
  forgotPassword,
  verifyOTP,
  login,
  refreshToken,
  Registration,
  isRegister,
  updatePassword,
  verifyForgotPassOTP
};

module.exports = authService;

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
