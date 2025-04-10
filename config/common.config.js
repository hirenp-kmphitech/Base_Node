const messages = require('./messages');

module.exports = {
    loggerDateFormat: "YYYY-MM-DD HH:mm:ss",
    VERSION_DATA: [{
        versionCode: "1",
        deviceType: "android"
    }, {
        versionCode: "1",
        deviceType: "iOS"
    }],
    version: "1.0.0",
    jwt: {
        secret: "WG00SXN1UUAXF6Nu5ujIDp7pOr752wAgj9cOOqsG4xAnni+TG6rLU0eP/wjwGU6YYW0=",
        token_expiry: 60 * 60 * 12
    },
    errorCodes: {
        SUCCESS_CODE: "1",
        ERROR_CODE: "0",
        REQUEST_VALIDATION_FAILURE: "0",
        UNKNOWN_ERROR: "0"
    },
    messages,
    PAYPAL: {
        CLIENT_ID: process.env.PAYPAL_CLIENT_ID || "",
        CLIENT_SECRET: process.env.PAYPAL_CLIENT_SECRET || "",
        BUSINESS_EMAIL: process.env.PAYPAL_BUSINESS_EMAIL || "",
        MODE: process.env.PAYPAL_MODE || "sandbox" // sandbox //live
    },
    TWILIO: {
        ACCOUNT_SID: process.env.TWILIO_ACCOUNT_SID || "",
        AUTH_TOKEN: process.env.TWILIO_AUTH_TOKEN || "",
        VERIFY_SERVICE_SID: process.env.TWILIO_VERIFY_SERVICE_SID || ""
    },
    IS_TESTING: process.env.IS_TEST_OTP || "true",
    TESTING_OTP: process.env.TESTING_OTP || "1313",
    // Cohexia AWS creds
    AWS: {
        ACCESS_KEY: "",
        SECRET_KEY: "",
        REGION: "",
    },
    // KMphasisinfotech account key
    STRIPE_PUBLIC_KEY: "",
    STRIPE_SECRET_KEY: ""
};