const UserMaster = require('../models/UserMaster');
const AndroidTransactionMaster = require('../models/AndroidTransactionMaster');
const AppleTransactionMaster = require('../models/AppleTransactionMaster');
const UserTransactionMaster = require('../models/UserTransactionMaster');
const { verifySubscription } = require('../utils/verifySubscription');
const Q = require('q');

// Android subscription Purchase
const androidPlanPurchase = async function (req, res) {
    let deferred = Q.defer();
    let { product_id, purchase_token, order_id, type, amount } = req.body;
    try {
        let user_id = req.user._id;

        let checkUserPlanExist = await UserTransactionMaster.findOne({ order_id: order_id, user_id: user_id })
        if (checkUserPlanExist) {
            deferred.reject('plan_already_running');
            return deferred.promise;
        }
        let subscriptionData;
        try {
            subscriptionData = await verifySubscription(product_id, purchase_token);
            if (!subscriptionData || subscriptionData.isSuccessful == false || !(subscriptionData.payload.orderId).includes(order_id)) {
                console.log("purchaseController.purchasePlanWithGoogle=>", subscriptionData.errorMessage)
                deferred.reject('invalid_order_id');
                return deferred.promise;
            }
        } catch (error) {
            console.error("purchaseController.purchasePlanWithGoogle->verifySubscription - ", error);
            deferred.reject(error.errorMessage);
            return deferred.promise;
        }


        let planExpiry = new Date(Number(subscriptionData.payload.expiryTimeMillis));

        let checkTransaction = await AndroidTransactionMaster.findOne({ purchase_token, notification_type: 4, user_id: user_id });
        if (!checkTransaction) {
            let newTransaction = new AndroidTransactionMaster();
            newTransaction.user_id = user_id;
            newTransaction.product_id = product_id;
            newTransaction.order_id = order_id;
            newTransaction.purchase_token = purchase_token;
            newTransaction.notification_type = 4;
            newTransaction.purchase_date = new Date(Number(subscriptionData.payload.startTimeMillis));
            newTransaction.expire_date = planExpiry;
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
            await AndroidTransactionMaster.findByIdAndUpdate(checkTransaction._id, { purchase_token, notification_type: 4 })
        }
        if (type == "purchase") {
            let newTransaction = new UserTransactionMaster();
            newTransaction.user_id = user_id;
            newTransaction.product_id = product_id;
            newTransaction.order_id = order_id;
            newTransaction.purchase_token = purchase_token;
            newTransaction.amount = amount;
            newTransaction.purchase_date = new Date(Number(subscriptionData.payload.startTimeMillis));
            newTransaction.expire_date = planExpiry;
            await newTransaction.save();
        }
        await UserMaster.updateOne({ _id: user_id }, { is_subscription: '1', plan_expiry: planExpiry, last_purchase_token: purchase_token, product_id, is_free_trial_used: 1 }, { new: true });
        let userData = await UserMaster.findOne({ _id: user_id })

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

        await GoogleNoti.create({ message: JSON.stringify(request) })
        // console.log("notification from google")
        let data = JSON.parse(Buffer.from(request.data, 'base64').toString('binary'));
        console.log('android data-->>', data);

        let productId = data.subscriptionNotification.subscriptionId
        let purchaseToken = data.subscriptionNotification.purchaseToken
        let notificationType = data.subscriptionNotification.notificationType

        let subscriptionData = await verifySubscription(productId, purchaseToken);
        console.log('subscriptionData-->>', subscriptionData);

        let checkTransaction = await UserTransactionMaster.findOne({ purchase_token: purchaseToken, notification_type: 4 });

        let userProfileId = subscriptionData.payload.obfuscatedExternalProfileId;
        let userPlanId = subscriptionData.payload.obfuscatedExternalProfileId;
        let expireDate = new Date(Number(subscriptionData.payload.expiryTimeMillis));
        let purchaseDate = new Date(Number(subscriptionData.payload.startTimeMillis));
        let userId;
        if (!userProfileId) {
            if (checkTransaction.user_id) {
                userId = checkTransaction.user_id
            }
        } else {
            userId = userProfileId
        }

        let newTransaction = new UserTransactionMaster();
        newTransaction.user_id = userId;
        newTransaction.plan_id = userPlanId;
        newTransaction.product_id = productId;
        newTransaction.order_id = subscriptionData.payload.orderId;
        newTransaction.purchase_token = purchaseToken;
        newTransaction.notification_type = notificationType;
        newTransaction.purchase_date = purchaseDate
        newTransaction.expire_date = expireDate

        if (notificationType == 4) {
            if (checkTransaction) {
                await newTransaction.save();
                await UserMaster.findByIdAndUpdate(userId, { product_id: productId, plan_date: expireDate })
            }
        } else if (notificationType == 2) {
            await newTransaction.save();
            await UserMaster.findByIdAndUpdate(userId, { product_id: productId, plan_date: expireDate })

        } else if (notificationType == 13) {
            let checkNotiExist = await UserTransactionMaster.findOne({ purchase_token: purchaseToken, notification_type: 13, user_id: userId, order_id: subscriptionData.payload.orderId });
            console.log("checkNotiExist=>", checkNotiExist)
            if (!checkNotiExist) {

                await UserMaster.findByIdAndUpdate(userId, { plan_expiry: null, is_subscription: "0", product_id: null, last_purchase_token: null }, { new: true })
            }
        }

        return res.status(200).send({ data: subscriptionData });

    } catch (error) {
        console.error("purchaseController.purchasePlanWithGoogle - ", errorCode);
        return res.status(400).send("Error");
    }
}

// apple subscription Purchase
const applePlanPurchase = async (req, res) => {

    let deferred = Q.defer();
    let { apple_transaction_id, original_transaction_id, product_id, amount } = req.body;
    try {
        let user_id = req.user._id;
        let plan_expiry = new Date();
        plan_expiry.setMonth(plan_expiry.getMonth() + (product_id !== "com.opentailor.app.annual" ? 6 : 0));
        plan_expiry.setDate(plan_expiry.getDate() + (product_id === "com.opentailor.app.annual" ? 12 : 0));

        let user = await UserMaster.findOne({ user_id });
        if (!user) {
            deferred.reject('invalid_id');
            return deferred.promise;
        }

        let transactionDt = {
            notification_type: "",
            apple_transaction_id: apple_transaction_id || "",
            original_transaction_id: original_transaction_id || "",
            web_order_line_item_id: "",
            purchase_date: new Date(),
            expire_date: plan_expiry,
            environment: "",
            transaction_reason: "",
            product_id,
            user_id
        };

        let checkTransaction = await AppleTransactionMaster.findOne({ original_transaction_id });
        let planExpiry = plan_expiry;
        if (!checkTransaction) {
            await AppleTransactionMaster.create(transactionDt);
        } else {
            planExpiry = checkTransaction.expire_date;
            await AppleTransactionMaster.updateOne({ original_transaction_id }, { user_id });
        }
        await UserMaster.updateOne({ user_id }, { is_subscription: '1', plan_expiry: planExpiry, original_transaction_id, product_id, is_free_trial_used: 1 });

        let newTransaction = new UserTransactionMaster();
        newTransaction.user_id = user_id;
        newTransaction.product_id = product_id;
        newTransaction.original_transaction_id = original_transaction_id;
        newTransaction.apple_transaction_id = apple_transaction_id;
        newTransaction.amount = amount;
        newTransaction.purchase_date = new Date();
        newTransaction.expire_date = planExpiry;
        await newTransaction.save();

        let data = await UserMaster.findOne({ user_id });
        deferred.resolve(data)
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
        insert.notification_type = jsonData.notificationType;

        let [transactionInfo_header, transactionInfo_payload, transactionInfo_signature] = jsonData.data.split(".");
        let json_TInfo_payload = JSON.parse(Buffer.from(transactionInfo_payload, 'base64').toString('utf-8'));

        let checkTransaction = await UserTransactionMaster.findOne({ original_transaction_id: json_TInfo_payload.originalTransactionId });
        let getUser_id = await UserTransactionMaster.findOne({ original_transaction_id: json_TInfo_payload.originalTransactionId, user_id: { $ne: "0" } });

        insert.apple_transaction_id = json_TInfo_payload.transactionId;
        insert.original_transaction_id = json_TInfo_payload.originalTransactionId;
        insert.web_order_line_item_id = json_TInfo_payload.webOrderLineItemId;
        insert.purchase_date = new Date(json_TInfo_payload.purchaseDate).toISOString();
        insert.expire_date = new Date(json_TInfo_payload.expiresDate).toISOString();
        insert.environment = json_TInfo_payload.environment;
        insert.transaction_reason = json_TInfo_payload.transactionReason;

        if (!checkTransaction) {
            insert.user_id = "0";
            let data = await UserTransactionMaster.create(insert);
            res.json({ data });
        } else {
            await UserTransactionMaster.updateOne({ original_transaction_id: json_TInfo_payload.originalTransactionId }, insert);
            if (jsonData.notificationType == "EXPIRED") {
                await UserMaster.findByIdAndUpdate(userId, { plan_expiry: null, is_subscription: "0", product_id: null, last_purchase_token: null }, { new: true })
            }
        }

        res.json({ status: 1, message: 'Plan purchased successfully', success: true });
    } catch (error) {
        res.status(505).json("Error");
    }
}


// Plan Restore for Android
async function androidPlanRestore(req, res) {
    let deferred = Q.defer();
    const { purchase_token } = req.body;

    try {
        let user_id = req.user._id;
        const plan = await AndroidTransactionMaster.findOne({ purchase_token });
        if (!plan) {
            deferred.reject('invalid_plan');
            return deferred.promise;
        }
        let userData = await UserMaster.findOne({ _id: user_id })
        if (user_id.toString() == plan.user_id) {
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
    const { original_transaction_id, apple_transaction_id } = req.body;

    try {
        let user_id = req.user._id;
        const plan = await AppleTransactionMaster.findOne({ original_transaction_id });
        if (!plan) {
            deferred.reject('invalid_plan');
            return deferred.promise;
        }
        if (user_id.toString() == plan.user_id.toString()) {
            await UserMaster.updateOne({ _id: user_id }, { is_subscription: '1', plan_expiry: plan.plan_expiry, original_transaction_id, apple_transaction_id, product_id: plan.product_id }, { new: true });
            let userData = await UserMaster.findOne({ _id: user_id })
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
