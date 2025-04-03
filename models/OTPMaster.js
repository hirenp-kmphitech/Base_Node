const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const OTPMaster = new Schema({
  userId: { type: String, default: "" },
  otpCode: { type: Number, required: [true, "Please enter OTP"] },
  email: { type: String },
  phone: { type: String },
  ccode: { type: String },
  createdAt: { type: Date, default: Date.now },
  expireAt: { type: Date, default: Date.now, index: { expires: '10m' } },
}, { collection: 'otp_master' });


module.exports = mongoose.model('otp_master', OTPMaster);