const inapppurchaseController = {};
const inAppPurchaseService = require('../services/inAppPurchaseService');
const ApiResponse = require('../utils/services/ApiResponse');

// Android subscription Purchase
inapppurchaseController.androidPlanPurchase = async function (req, res, next) {
    let response;
    try {
        let userId = req.user._id;
        response = await inAppPurchaseService.androidPlanPurchase(req, userId);
    } catch (errorCode) {
        console.error("inapppurchaseController.androidPlanPurchase - ", errorCode);
        return next(ApiResponse.badRequest(errorCode));
    }
    return res.status(response.statusCode).send(response);
}

// Android subscription Webhook Notification
inapppurchaseController.androidWebhook = async function (req, res, next) {
    try {
        response = await inAppPurchaseService.androidWebhook(req);
    } catch (errorCode) {
        console.error("inapppurchaseController.webhookFromGoogle - ", errorCode);
        return next(ApiResponse.badRequest(errorCode));
    }
    return res.status(response.statusCode).send(response);
}

// apple subscription Purchase
inapppurchaseController.applePlanPurchase = async function (req, res, next) {
    try {
        response = await inAppPurchaseService.applePlanPurchase(req);
    } catch (errorCode) {
        console.error("inapppurchaseController.applePlanPurchase - ", errorCode);
        return next(ApiResponse.badRequest(errorCode));
    }
    return res.status(response.statusCode).send(response);
}


inapppurchaseController.getAppleNotification = async function (req, res, next) {
    try {
        response = await inAppPurchaseService.getAppleNotification(req);
    } catch (errorCode) {
        console.error("inapppurchaseController.getAppleNotification - ", errorCode);
        return next(ApiResponse.badRequest(errorCode));
    }
    return res.status(response.statusCode).send(response);
}

// Plan Restore for Android
inapppurchaseController.androidPlanRestore = async function (req, res, next) {
    try {
        response = await inAppPurchaseService.androidPlanRestore(req);
    } catch (errorCode) {
        console.error("inapppurchaseController.androidPlanRestore - ", errorCode);
        return next(ApiResponse.badRequest(errorCode));
    }
    return res.status(response.statusCode).send(response);
}

// Plan Restore for Apple
inapppurchaseController.applePlanRestore = async function (req, res, next) {
    try {
        response = await inAppPurchaseService.applePlanRestore(req);
    } catch (errorCode) {
        console.error("inapppurchaseController.applePlanRestore - ", errorCode);
        return next(ApiResponse.badRequest(errorCode));
    }
    return res.status(response.statusCode).send(response);
}

module.exports = inapppurchaseController;
