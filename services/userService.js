let userService = {};
const userRepository = require('./../repositories/userRepository');
const sendMail = require("./../utils/services/sendMail");
const { contactUsMail, registerMail, forgotPasswordMail } = require("./../utils/helper/ContentProvider");
const ApiResponse = require('../utils/services/ApiResponse');
const commonConfig = require('./../config/common.config');


const updateProfile = async (req, userId) => {
  let response;
  try {
    let profile = req.file ? (req.file.filename ?? '') : '';
    req.body.profile = profile;
    if (profile == '') {
      delete req.body.profile;
    }
    else {
      let oldPath = publicPath + "profile/" + req.user.profile;
      fs.unlink(oldPath, (err) => {
        if (err) {
          console.error(err);
        }
        // console.log('file removed');
      })
    }

    let userResponseObj = await userRepository.findUserAndUpdate({ _id: userId }, req.body);
    if (userResponseObj) {
      userResponseObj._doc.token = req.token;
      response = ApiResponse.success(userResponseObj, commonConfig.messages['profile_update']);
    }
    else {
      response = ApiResponse.notFound(commonConfig.messages['invalid_userId']);
    }
  } catch (error) {
    throw error;
  }

  return response;
}

const changePassword = async (userId, oldPassword, newPassword, token) => {
  let response;
  try {
    let getUser = await userRepository.findUser({ _id: userId });

    if (getUser != null) {
      if (getUser.password != oldPassword) {
        response = ApiResponse.conflict(commonConfig.messages['check_old_password']);
      }
      else if (getUser.password == newPassword) {
        response = ApiResponse.conflict(commonConfig.messages['check_password']);
      }
      else {
        let userResponseObj = await userRepository.findUserAndUpdate({ _id: userId }, { password: newPassword });
        userResponseObj.token = token;
        response = ApiResponse.success(userResponseObj, commonConfig.messages['password_change_success']);
      }

    }
    else {
      response = ApiResponse.notFound(commonConfig.messages['invalid_userId']);
    }
  } catch (error) {
    throw error;
  }
  return response;
}

const logOut = async (userId) => {
  let response;
  try {
    let userResponseObj = await userRepository.findUserAndUpdate({ _id: userId }, { deviceToken: "", deviceType: "" });
    if (userResponseObj) {
      response = ApiResponse.success({}, commonConfig.messages['logout_success']);
    }
    else {
      response = ApiResponse.notFound(commonConfig.messages['invalid_userId']);
    }
  } catch (error) {
    throw error;
  }

  return response;
}

const deleteAccount = async (userId, deleteReason) => {
  let response;
  try {
    let userResponseObj = await userRepository.findUserAndUpdate({ _id: userId }, { deviceToken: "", deviceType: "", deletedAt: new Date(), deleteReason: deleteReason });
    if (userResponseObj) {
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


const contactUs = async (email, name, subject, message) => {
  let response;
  try {
    // let clientEmail = process.env.CLIENT_EMAIL || "mayur.kmphasis@gmail.com";
    // let mailContent = await contactUsMail(name, email, subject, message);
    // sendMail(clientEmail, "Contact Us email from " + APP_NAME, mailContent);
    response = ApiResponse.success({}, commonConfig.messages['contact_us_msg']);

  } catch (error) {
    throw error;
  }
  return response;
}


userService = {
  updateProfile,
  changePassword,
  logOut,
  deleteAccount,
  contactUs
};

module.exports = userService;