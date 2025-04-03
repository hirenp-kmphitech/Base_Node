let otpRepository = {};
const OTPMaster = require('../models/OTPMaster');

const findOTPByEmail = async (email) => {
    return OTPMaster.findOne({ email });
};

const createOTP = async (email, otpCode) => {
    return OTPMaster.create({ email, otpCode });
};

const updateOTP = async (id, email, otpCode) => {
    return OTPMaster.findOneAndUpdate({ _id: id }, { email, otpCode });
};

const deleteOTP = async (id) => {
    return OTPMaster.findOneAndDelete({ "_id": id }).exec();
};

const findOTPByPhone = async (phone, ccode) => {
    return OTPMaster.findOne({ phone, ccode });
};

const findOTP = async (filter) => {
    return OTPMaster.findOne(filter);
};


otpRepository = {
    findOTP,
    findOTPByEmail,
    createOTP,
    updateOTP,
    deleteOTP,
    findOTPByPhone
};
module.exports = otpRepository
