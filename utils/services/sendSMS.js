
const config = require('../config/common.config');
const twClient = require('twilio')(config.twilio.account_sid, config.twilio.auth_token);


const sendSMS = async function (msg, phone) {

    twClient.messages.create({
        to: phone,
        // from: config.twilio.from_number,
        messagingServiceSid: config.twilio.messagingServiceSid,
        body: msg
    }, async function (err, message) {
        if (err) {
            console.error("sendOTP twClient.messages.create failure - ", err);
            console.error('We are not able to send message to ' + checkAdmin.phone);
        } else {
            console.log("text message sent successfully.");
        }
    });
};
module.exports = sendSMS;
