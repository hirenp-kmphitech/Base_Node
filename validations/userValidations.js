const Joi = require('joi');
const emailSchema = Joi.string();
const stringSchema = Joi.string();

Joi.objectId = require('joi-objectid')(Joi)

module.exports = {
    signupSchema: {
        body: Joi.object().keys({
            name: stringSchema.required(),
            email: emailSchema.required(),
            pass: stringSchema.required(),
            profile: Joi.any(),
            deviceType: stringSchema,
            deviceToken: stringSchema,
            isGoogle: stringSchema.default(0),
            googleId: stringSchema.default("").allow(""),
            isFb: stringSchema.default(0),
            fbId: stringSchema.default("").allow(""),
            isApple: stringSchema.default(0),
            appleId: stringSchema.default("").allow(""),
        })
    },
    isRegisterSchema: {
        body: Joi.object().keys({
            deviceToken: stringSchema.allow(""),
            deviceType: stringSchema.allow(""),
            email: stringSchema.allow(""),
            name: stringSchema.allow(""),
            is_social_type: stringSchema.required().allow("isGoogle", "isFb", "isApple"),
            isGoogle: stringSchema.default(0),
            googleId: Joi.alternatives().conditional('isGoogle', { is: 1, then: stringSchema.required(), otherwise: stringSchema.default("").allow("") }),
            isFb: stringSchema.default(0),
            fbId: Joi.alternatives().conditional('isFb', { is: 1, then: stringSchema.required(), otherwise: stringSchema.default("").allow("") }),
            isApple: stringSchema.default(0),
            appleId: Joi.alternatives().conditional('isApple', { is: 1, then: stringSchema.required(), otherwise: stringSchema.default("").allow("") }),
        })
    },
    loginUserSchema: {
        body: Joi.object().keys({
            email: emailSchema.required(),
            pass: stringSchema.required(),
            deviceType: stringSchema,
            deviceToken: stringSchema,
        })
    },
    updateProfileSchema: {
        body: Joi.object().keys({
            name: stringSchema.required(),
            email: emailSchema.required(),
            profile: Joi.any()
        })
    },
    forgotPassSchema: {
        body: Joi.object().keys({
            email: emailSchema.required()
        })
    },
    sendOtpSchema: {
        body: Joi.object().keys({
            email: emailSchema.required()
        })
    },
    userIdSchema: {
        body: Joi.object().keys({
            userId: Joi.objectId().required()
        })
    },
    changePassSchema: {
        body: Joi.object().keys({
            old_password: stringSchema.required(),
            new_password: stringSchema.required(),
        })
    },
    OTPSchema: {
        body: Joi.object().keys({
            email: stringSchema.required(),
            otp: stringSchema.required(),
        })
    },
    updatePassSchema: {
        body: Joi.object().keys({
            new_password: stringSchema.required(),
            userId: Joi.objectId().required(),
        })
    },
    contactUsSchema: {
        body: Joi.object().keys({
            name: stringSchema.required(),
            email: emailSchema.required(),
            subject: stringSchema.required(),
            message: stringSchema.required(),
        })
    },
    deleteAccountSchema: {
        body: Joi.object().keys({
            deleteReason: stringSchema.required(),
        })
    },
};