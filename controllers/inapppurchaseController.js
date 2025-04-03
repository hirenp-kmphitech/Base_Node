const Users = require('../models/Users');
const AndroidTransactions = require('../models/AndroidTransactions');
const AppleTransactions = require('../models/AppleTransactions');
const UserTransactions = require('../models/UserTransactions');
const { verifySubscription } = require('../utils/services/verifySubscription');
const Q = require('q');
const moment = require('moment');

// Android subscription Purchase
const androidPlanPurchase = async function (req, res) {
    let deferred = Q.defer();
    let { productId, purchaseToken, orderId, type, amount } = req.body;
    try {
        let userId = req.user._id;

        let checkUserPlanExist = await UserTransactions.findOne({ orderId: orderId, userId: userId })
        if (checkUserPlanExist) {
            deferred.reject('plan_already_running');
            return deferred.promise;
        }
        let subscriptionData;
        try {
            subscriptionData = await verifySubscription(productId, purchaseToken);
            if (!subscriptionData || subscriptionData.isSuccessful == false || !(subscriptionData.payload.orderId).includes(orderId)) {
                console.log("purchaseController.purchasePlanWithGoogle=>", subscriptionData.errorMessage)
                deferred.reject('invalid_orderId');
                return deferred.promise;
            }
        } catch (error) {
            console.error("purchaseController.purchasePlanWithGoogle->verifySubscription - ", error);
            deferred.reject(error.errorMessage);
            return deferred.promise;
        }


        let planExpiry = new Date(Number(subscriptionData.payload.expiryTimeMillis));

        let checkTransaction = await AndroidTransactions.findOne({ purchaseToken, notificationType: 4, userId: userId });
        if (!checkTransaction) {
            let newTransaction = new AndroidTransactions();
            newTransaction.userId = userId;
            newTransaction.productId = productId;
            newTransaction.orderId = orderId;
            newTransaction.purchaseToken = purchaseToken;
            newTransaction.notificationType = 4;
            newTransaction.purchaseDate = new Date(Number(subscriptionData.payload.startTimeMillis));
            newTransaction.expireDate = planExpiry;
            newTransaction.save(async function (error, document) {
                if (error) {
                    let errorKeys = Object.keys(error.errors);

                    errorKeys.forEach(key => {
                        deferred.reject(error.errors[key].properties.message);
                        return deferred.promise;
                    });
                }
            });


        }
        else {
            await AndroidTransactions.findByIdAndUpdate(checkTransaction._id, { purchaseToken, notificationType: 4 })
        }
        if (type == "purchase") {
            let newTransaction = new UserTransactions();
            newTransaction.userId = userId;
            newTransaction.productId = productId;
            newTransaction.orderId = orderId;
            newTransaction.purchaseToken = purchaseToken;
            newTransaction.amount = amount;
            newTransaction.purchaseDate = new Date(Number(subscriptionData.payload.startTimeMillis));
            newTransaction.expireDate = planExpiry;
            await newTransaction.save();
        }
        await Users.updateOne({ _id: userId }, { isSubscription: '1', planExpiry: moment(planExpiry).format('YYYY-MM-DD HH:mm:ss'), lastPurchaseToken: purchaseToken, productId, isFreeTrialUsed: 1 }, { new: true });
        let userData = await Users.findOne({ _id: userId })

        deferred.resolve(userData);

    } catch (error) {
        console.log(" error:", error)
        deferred.reject(error.message);
    }
    return deferred.promise;
}
// Android subscription Webhook Notification
const webhookFromGoogle = async function (req, res) {
    try {
        let request = req.body.message
        console.log("request=>", request);

        // await GoogleNoti.create({ message: JSON.stringify(request) })
        // console.log("notification from google")
        let data = JSON.parse(Buffer.from(request.data, 'base64').toString('binary'));
        // console.log('android data-->>', data);

        let productId = data.subscriptionNotification.subscriptionId
        let purchaseToken = data.subscriptionNotification.purchaseToken
        let notificationType = data.subscriptionNotification.notificationType

        let subscriptionData = await verifySubscription(productId, purchaseToken);
        console.log('subscriptionData-->>', subscriptionData);

        let checkTransaction = await UserTransactions.findOne({ purchaseToken: purchaseToken, notificationType: 4 });
        console.log("checkTransaction==================>>>>>:", checkTransaction)

        console.log("obfuscatedExternalAccountId=========>>>>:", subscriptionData.payload.obfuscatedExternalAccountId)
        console.log("getObfuscatedExternalAccountId=========>>>>:", subscriptionData.payload.getObfuscatedExternalAccountId)
        let userProfileId = subscriptionData.payload.obfuscatedExternalAccountId;
        console.log("userProfileId==================>>>>>:", userProfileId)
        let userPlanId = subscriptionData.payload.obfuscatedExternalProfileId;
        let expireDate = new Date(Number(subscriptionData.payload.expiryTimeMillis));
        let purchaseDate = new Date(Number(subscriptionData.payload.startTimeMillis));
        console.log("purchaseDate===============>>>>>:", purchaseDate)
        console.log("expireDate===============>>>>>:", expireDate)
        let userId;
        if (!userProfileId) {
            if (checkTransaction && checkTransaction.userId) {
                userId = checkTransaction.userId
            }
        } else {
            userId = userProfileId
        }

        let newTransaction = new UserTransactions();
        newTransaction.userId = userId;
        newTransaction.plan_id = userPlanId;
        newTransaction.productId = productId;
        newTransaction.orderId = subscriptionData.payload.orderId;
        newTransaction.purchaseToken = purchaseToken;
        newTransaction.notificationType = notificationType;
        newTransaction.purchaseDate = purchaseDate
        newTransaction.expireDate = expireDate

        // console.log("userId==========", userId)
        // console.log("productId==========", productId)
        // console.log("expireDate==========", expireDate)
        // console.log("notificationType==================", notificationType)
        if (notificationType == 4) {
            if (checkTransaction) {
                await newTransaction.save();
                await Users.findByIdAndUpdate(userId, { productId: productId, planExpiry: expireDate, isSubscription: "1" })
            }
        } else if (notificationType == 2) {
            await newTransaction.save();
            await Users.findByIdAndUpdate(userId, { productId: productId, planExpiry: expireDate, isSubscription: "1" })

        } else if (notificationType == 13) {
            let checkNotiExist = await UserTransactions.findOne({ purchaseToken: purchaseToken, notificationType: 13, userId: userId, orderId: subscriptionData.payload.orderId });
            console.log("checkNotiExist=>", checkNotiExist)
            if (!checkNotiExist || checkNotiExist == null) {
                let userData = await Users.findOne({ _id: userId });
                if (userData) {
                    if (userData.lastPurchaseToken == purchaseToken) {
                        await newTransaction.save();
                        await Users.findByIdAndUpdate(userId, { planExpiry: null, isSubscription: "0", productId: null, lastPurchaseToken: null, isFreeTrialUsed: 0 }, { new: true })
                    }
                }
            }
        }

        return res.send(200);

    } catch (error) {
        console.error("purchaseController.purchasePlanWithGoogle - ", error);
        return res.send(500);
    }
}

// apple subscription Purchase
const applePlanPurchase = async (req, res) => {

    let deferred = Q.defer();
    let { appleTransactionId, originalTransactionId, productId, amount } = req.body;
    try {
        let userId = req.user._id;
        let planExpiry = new Date();
        planExpiry.setMonth(planExpiry.getMonth() + (productId !== "com.opentailor.app.annual" ? 6 : 0));
        planExpiry.setDate(planExpiry.getDate() + (productId === "com.opentailor.app.annual" ? 12 : 0));

        let user = await Users.findOne({ _id: userId });
        if (!user) {
            deferred.reject('invalid_id');
            return deferred.promise;
        }

        let transactionDt = {
            notificationType: "",
            appleTransactionId: appleTransactionId || "",
            originalTransactionId: originalTransactionId || "",
            webOrderLineItemId: "",
            purchaseDate: new Date(),
            expireDate: new Date(planExpiry),
            environment: "",
            transactionReason: "",
            productId,
            userId
        };

        let checkTransaction = await AppleTransactions.findOne({ originalTransactionId, appleTransactionId });

        let planExpiryDt = planExpiry;
        if (!checkTransaction) {
            await AppleTransactions.create(transactionDt);
        } else {
            planExpiryDt = checkTransaction.expireDate;
            await AppleTransactions.updateOne({ originalTransactionId, appleTransactionId }, { userId });
        }
        await Users.updateOne({ userId }, { isSubscription: '1', planExpiry: moment(planExpiryDt).format('YYYY-MM-DD HH:mm:ss'), originalTransactionId, productId, isFreeTrialUsed: 1 });

        let newTransaction = new UserTransactions();
        newTransaction.userId = userId;
        newTransaction.productId = productId;
        newTransaction.originalTransactionId = originalTransactionId;
        newTransaction.appleTransactionId = appleTransactionId;
        newTransaction.amount = amount;
        newTransaction.purchaseDate = new Date();
        newTransaction.expireDate = planExpiry;
        await newTransaction.save();

        let userData = await Users.findOne({ _id: userId });

        deferred.resolve(userData);
    } catch (error) {
        console.log(" error:", error)
        deferred.reject(error.message);
    }
    return deferred.promise;
}

// apple subscription Webhook Notification
async function getAppleNotification(req, res) {
    try {
        let [header, payload, signature] = req.signedPayload.split(".");
        let jsonData = Buffer.from(payload, 'base64').toString('utf-8');
        jsonData = JSON.parse(jsonData);

        let insert = {};
        insert.notificationType = jsonData.notificationType;

        let [transactionInfo_header, transactionInfo_payload, transactionInfo_signature] = jsonData.data.split(".");
        let json_TInfo_payload = JSON.parse(Buffer.from(transactionInfo_payload, 'base64').toString('utf-8'));

        let checkTransaction = await UserTransactions.findOne({ originalTransactionId: json_TInfo_payload.originalTransactionId });
        let getuserId = await UserTransactions.findOne({ originalTransactionId: json_TInfo_payload.originalTransactionId, userId: { $ne: "0" } });

        insert.appleTransactionId = json_TInfo_payload.transactionId;
        insert.originalTransactionId = json_TInfo_payload.originalTransactionId;
        insert.webOrderLineItemId = json_TInfo_payload.webOrderLineItemId;
        insert.purchaseDate = new Date(json_TInfo_payload.purchaseDate).toISOString();
        insert.expireDate = new Date(json_TInfo_payload.expiresDate).toISOString();
        insert.environment = json_TInfo_payload.environment;
        insert.transactionReason = json_TInfo_payload.transactionReason;

        if (!checkTransaction) {
            insert.userId = "0";
            let data = await UserTransactions.create(insert);
            res.json({ data });
        } else {
            await UserTransactions.updateOne({ originalTransactionId: json_TInfo_payload.originalTransactionId }, insert);
            if (jsonData.notificationType == "EXPIRED") {
                await Users.findByIdAndUpdate(userId, { planExpiry: null, isSubscription: "0", productId: null, lastPurchaseToken: null }, { new: true })
            }
        }
        return res.send(200);
        // res.json({ status: 1, message: 'Plan purchased successfully', success: true });
    } catch (error) {
        console.log(" catch error==========================>>>>>", error)
        return res.send(500);
        // res.status(505).json("Error");
    }
}


// Plan Restore for Android
async function androidPlanRestore(req, res) {
    let deferred = Q.defer();
    const { purchaseToken } = req.body;

    try {
        let userId = req.user._id;
        const plan = await AndroidTransactions.findOne({ purchaseToken });
        if (!plan) {
            deferred.reject('invalid_plan');
            return deferred.promise;
        }
        let userData = await Users.findOne({ _id: userId })


        if (userId.toString() == plan.userId) {
            userData._doc.is_social_type = (userData.isApple == "1" || userData.isGoogle == "1") ? "1" : "0";
            deferred.resolve(userData);
        } else {
            deferred.reject('already_activate_plan');
        }

    } catch (error) {
        deferred.reject(error.message);
    }
    return deferred.promise;
}

// Plan Restore for Apple
async function applePlanRestore(req, res) {
    let deferred = Q.defer();
    const { originalTransactionId, appleTransactionId } = req.body;

    try {
        let userId = req.user._id;
        const plan = await AppleTransactions.findOne({ originalTransactionId });
        if (!plan) {
            deferred.reject('invalid_plan');
            return deferred.promise;
        }
        let todayDate = new Date()
        if (plan.expireDate <= todayDate) {
            deferred.reject('plan_expired');
            return deferred.promise;
        }
        if (userId.toString() == plan.userId.toString()) {
            await Users.updateOne({ _id: userId }, { isSubscription: '1', planExpiry: moment(plan.planExpiry).format('YYYY-MM-DD HH:mm:ss'), originalTransactionId, appleTransactionId, productId: plan.productId }, { new: true });
            let userData = await Users.findOne({ _id: userId })
            userData._doc.is_social_type = (userData.isApple == "1" || userData.isGoogle == "1") ? "1" : "0";

            deferred.resolve(userData);
        } else {
            deferred.reject('already_activate_plan');
        }

    } catch (error) {
        deferred.reject(error.message);
    }
    return deferred.promise;
}

module.exports = {

    androidPlanPurchase,
    webhookFromGoogle,
    applePlanPurchase,
    getAppleNotification,
    androidPlanRestore,
    applePlanRestore

};
