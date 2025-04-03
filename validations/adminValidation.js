const Joi = require('joi');
const stringSchema = Joi.string();
const emailSchema = Joi.string();

Joi.objectId = require('joi-objectid')(Joi)

module.exports = {
    loginSchema: {
        body: Joi.object().keys({
            email: emailSchema.required(),
            password: stringSchema.required()
        })
    },
    forgotPasswordSchema: {
        body: Joi.object().keys({
            email: emailSchema.required()
        })
    },
    verifyOTPSchema: {
        body: Joi.object().keys({
            email: emailSchema.required(),
            otp: Joi.string().length(4).required()
        })
    },
    resetPasswordSchema: {
        body: Joi.object().keys({
            email: emailSchema.required(),
            new_password: stringSchema.required(),
        })
    },
    userlistSchema: {
        body: Joi.object().keys({
            page: Joi.number().allow(""),
            limit: Joi.number().allow(""),
            search: stringSchema.allow(''),
            status: stringSchema.allow("Pending", "Approved").required(),
        })
    },
    UserDetailSchema: {
        body: Joi.object().keys({
            userId: Joi.objectId().required(),
        })
    },
    updateStatusSchema: {
        body: Joi.object().keys({
            userId: Joi.objectId().required(),
            profile_status: stringSchema.valid('Approved', 'Rejected'),
        })
    },
    deleteUserSchema: {
        body: Joi.object().keys({
            userId: Joi.objectId().required(),
            deleteReason: stringSchema.required()
        })
    },
}