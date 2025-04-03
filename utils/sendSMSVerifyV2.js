
const commonConfig = require('../config/common.config');
const twilio = require('twilio');
const client = twilio(commonConfig.TWILIO.ACCOUNT_SID, commonConfig.TWILIO.AUTH_TOKEN);


const sendSMS = async function (phoneNumber) {
    if (commonConfig.TWILIO.IS_TESTING == "true") return { response: "test sms", status: true };

    const verification = await client.verify.v2.services(commonConfig.TWILIO.VERIFY_SERVICE_SID)
        .verifications
        .create({ to: phoneNumber, channel: 'sms' });
    console.log("text message sent successfully.");
    return { response: verification, status: verification.status };
};

const verifySMSCode = async function (phoneNumber, code) {
    if (commonConfig.TWILIO.IS_TESTING == "true") return { response: "test sms", status: ((commonConfig.TWILIO.TESTING_OTP == code) ? true : false) };

    const verificationCheck = await client.verify.v2.services(commonConfig.TWILIO.VERIFY_SERVICE_SID)
        .verificationChecks
        .create({ to: phoneNumber, code });
    let verifyStatus;
    console.log('verificationCheck.status-->>', verificationCheck.status);

    if (verificationCheck.status === 'approved') {
        verifyStatus = true;
    }
    else {
        verifyStatus = false;
    }
    return { response: verificationCheck, status: verifyStatus };

};
module.exports = { sendSMS, verifySMSCode };
