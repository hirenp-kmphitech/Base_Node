const Joi = require('joi');
const stringSchema = Joi.string();

Joi.objectId = require('joi-objectid')(Joi)

module.exports = {
    androidPurchaseSchema: {
        body: Joi.object().keys({
            productId: stringSchema.required(),
            purchaseToken: stringSchema.required(),
            orderId: stringSchema.required(),
            type: stringSchema.required(),
            amount: stringSchema.required(),
        })
    },
    androidRestorePlanSchema: {
        body: Joi.object().keys({
            purchaseToken: stringSchema.required()
        })
    },
    ApplePurchaseSchema: {
        body: Joi.object().keys({
            amount: stringSchema.required(),
            productId: stringSchema.required(),
            appleTransactionId: stringSchema.required(),
            originalTransactionId: stringSchema.required(),
        })
    },
    appleRestorePlanSchema: {
        body: Joi.object().keys({
            appleTransactionId: stringSchema.required(),
            originalTransactionId: stringSchema.required()
        })
    },
};