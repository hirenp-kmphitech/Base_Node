const paypal = require('paypal-rest-sdk');
const commonConfig = require('../config/common.config');

paypal.configure({
    'mode': commonConfig.PAYPAL.MODE, // or 'live' for production
    'client_id': commonConfig.PAYPAL.CLIENT_ID,
    'client_secret': commonConfig.PAYPAL.CLIENT_SECRET
});

module.exports = paypal;
