let inAppPurchaseService = {};
const { verifySubscription } = require('../utils/services/verifySubscription');
const moment = require('moment');

const ApiResponse = require('../utils/services/ApiResponse');
const commonConfig = require('../config/common.config');
const logger = require('../utils/services/logger');
const androidTransactionsRepository = require('../repositories/androidTransactionsRepository');
const userTransactionsRepository = require('../repositories/userTransactionsRepository');
const userRepository = require('../repositories/userRepository');
const appleTransactionsRepository = require('../repositories/appleTransactionsRepository');
const mongoose = require('mongoose');

function isValidObjectId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}


inAppPurchaseService.androidPlanPurchase = async (req, userId) => {
  let response;
  const { orderId, productId, purchaseToken, type, amount } = req.body;
  try {
    if (!isValidObjectId(userId)) {
      response = ApiResponse.success({}, "Live data" + userId);
      return response;
    }
    let checkUserPlanExist = await userTransactionsRepository.findOne({ orderId: orderId, userId: userId })
    if (checkUserPlanExist) {
      response = ApiResponse.conflict(commonConfig.messages["plan_already_running"]);
      return response;
    }
    let subscriptionData;
    try {
      subscriptionData = await verifySubscription(productId, purchaseToken);
      logger.info("subscriptionData--->>>" + JSON.stringify(subscriptionData))
      if (!subscriptionData || subscriptionData.isSuccessful == false || !(subscriptionData.payload.orderId).includes(orderId)) {
        logger.info("purchaseController.androidPlanPurchase=>" + subscriptionData.errorMessage)
        response = ApiResponse.success({}, commonConfig.messages["invalid_orderId"]);
        return response;
      }
    } catch (error) {
      console.error("purchaseController.androidPlanPurchase->verifySubscription - " + error);
      response = ApiResponse.success({}, error.errorMessage);
      return response;
    }


    let planExpiry = new Date(Number(subscriptionData.payload.expiryTimeMillis));

    let checkTransaction = await androidTransactionsRepository.findOne({ purchaseToken, notificationType: 4, userId: userId });
    if (!checkTransaction) {

      let newTransaction = new Object();
      newTransaction.userId = userId;
      newTransaction.productId = productId;
      newTransaction.orderId = orderId;
      newTransaction.purchaseToken = purchaseToken;
      newTransaction.notificationType = 4;
      newTransaction.purchaseDate = new Date(Number(subscriptionData.payload.startTimeMillis));
      newTransaction.expireDate = planExpiry;
      await androidTransactionsRepository.create(newTransaction);


    }
    else {
      await androidTransactionsRepository.findAndUpdate({ _id: checkTransaction._id }, { purchaseToken, notificationType: 4 })
    }
    if (type == "purchase") {
      let newTransaction = new Object();
      newTransaction.userId = userId;
      newTransaction.productId = productId;
      newTransaction.orderId = orderId;
      newTransaction.purchaseToken = purchaseToken;
      newTransaction.amount = amount;
      newTransaction.purchaseDate = new Date(Number(subscriptionData.payload.startTimeMillis));
      newTransaction.expireDate = planExpiry;
      await userTransactionsRepository.create(newTransaction);
    }
    await userRepository.findUserAndUpdate({ _id: userId }, { isSubscription: '1', planExpiry: moment(planExpiry).format('YYYY-MM-DD HH:mm:ss'), lastPurchaseToken: purchaseToken, productId, isFreeTrialUsed: 1 });
    let userData = await userRepository.findUser({ _id: userId })

    response = ApiResponse.success(userData, commonConfig.messages['plan_purchased']);


  } catch (error) {
    throw error.message;
  }

  return response;
}

inAppPurchaseService.androidWebhook = async (req) => {
  let response;
  try {
    let request = req.body.message;
    logger.info("request=>" + JSON.stringify(request));
    if (request) {

      // await GoogleNoti.create({ message: JSON.stringify(request) })
      // logger.info("notification from google")
      let data = JSON.parse(Buffer.from(request.data, 'base64').toString('binary'));
      logger.info('android data-->>' + JSON.stringify(data));

      let productId = data.subscriptionNotification?.subscriptionId || "";
      let purchaseToken = data.subscriptionNotification?.purchaseToken || "";
      let notificationType = data.subscriptionNotification?.notificationType || "";
      let subscriptionData;
      try {
        subscriptionData = await verifySubscription(productId, purchaseToken);
        logger.info("subscriptionData--->>>" + JSON.stringify(subscriptionData))
        if (!subscriptionData || subscriptionData.isSuccessful == false) {
          logger.info("purchaseController.purchasePlanWithGoogle=>" + subscriptionData.errorMessage)
          response = ApiResponse.success({}, commonConfig.messages["invalid_orderId"]);
          return response;
        }
      } catch (error) {
        console.error("purchaseController.androidWebhook->verifySubscription - " + error);
        response = ApiResponse.success({}, error.errorMessage);
        return response;
      }



      let checkTransaction = await userTransactionsRepository.findOne({ purchaseToken: purchaseToken, notificationType: 4 });
      logger.info("checkTransaction==================>>>>>:" + checkTransaction)

      logger.info("obfuscatedExternalAccountId=========>>>>:" + subscriptionData.payload.obfuscatedExternalAccountId)
      logger.info("getObfuscatedExternalAccountId=========>>>>:" + subscriptionData.payload.getObfuscatedExternalAccountId)
      let userProfileId = subscriptionData.payload.obfuscatedExternalAccountId;
      logger.info("userProfileId==================>>>>>:" + userProfileId)
      let userPlanId = subscriptionData.payload.obfuscatedExternalProfileId;
      let expireDate = new Date(Number(subscriptionData.payload.expiryTimeMillis));
      let purchaseDate = new Date(Number(subscriptionData.payload.startTimeMillis));
      logger.info("purchaseDate===============>>>>>:" + purchaseDate)
      logger.info("expireDate===============>>>>>:" + expireDate)
      let userId;
      if (!userProfileId) {
        if (checkTransaction && checkTransaction.userId) {
          userId = checkTransaction.userId
        }
      } else {
        userId = userProfileId
      }

      if (!isValidObjectId(userId)) {
        response = ApiResponse.success({}, "Live data:" + userId);
        return response;
      }

      let newTransaction = new Object();
      newTransaction.userId = userId;
      newTransaction.plan_id = userPlanId;
      newTransaction.productId = productId;
      newTransaction.orderId = subscriptionData.payload.orderId;
      newTransaction.purchaseToken = purchaseToken;
      newTransaction.notificationType = notificationType;
      newTransaction.purchaseDate = purchaseDate
      newTransaction.expireDate = expireDate

      // logger.info("userId=========="+ userId)
      // logger.info("productId=========="+ productId)
      // logger.info("expireDate=========="+ expireDate)
      // logger.info("notificationType=================="+ notificationType)
      if (notificationType == 4) {
        // new purchase
        if (checkTransaction) {
          await userTransactionsRepository.create(newTransaction);
          await userRepository.findUserAndUpdate({ _id: userId }, { productId: productId, planExpiry: expireDate, isSubscription: "1", lastPurchaseToken: purchaseToken, isFreeTrialUsed: 1 })
        }
      } else if (notificationType == 2 || notificationType == 3) {
        // 2 = Renew purchase
        // 3 = recover purchase 
        await userTransactionsRepository.create(newTransaction);
        await userRepository.findUserAndUpdate({ _id: userId }, { productId: productId, planExpiry: expireDate, isSubscription: "1", lastPurchaseToken: purchaseToken, isFreeTrialUsed: 1 })

      } else if (notificationType == 13) {
        // expire purchase
        let checkNotiExist = await userTransactionsRepository.findOne({ purchaseToken: purchaseToken, notificationType: 13, userId: userId, orderId: subscriptionData.payload.orderId });
        logger.info("checkNotiExist=>" + checkNotiExist)
        if (!checkNotiExist || checkNotiExist == null) {
          let userData = await userRepository.findUser({ _id: userId });
          if (userData) {
            if (userData.lastPurchaseToken == purchaseToken) {
              await userTransactionsRepository.create(newTransaction);
              await userRepository.findUserAndUpdate({ _id: userId }, { planExpiry: null, isSubscription: "0", productId: null, lastPurchaseToken: null, isFreeTrialUsed: 0 })
            }
          }
        }
      }
    }

    response = ApiResponse.success({}, commonConfig.messages['webhook_success']);
  } catch (error) {
    response = ApiResponse.success({}, error.message);
    // throw error.message;
  }

  return response;
}

inAppPurchaseService.applePlanPurchase = async (req) => {
  let response;
  try {
    let { appleTransactionId, originalTransactionId, productId, amount } = req.body;

    let userId = req.user._id;
    let planExpiry = new Date();
    planExpiry.setMonth(planExpiry.getMonth() + (productId !== "com.opentailor.app.annual" ? 6 : 0));
    planExpiry.setDate(planExpiry.getDate() + (productId === "com.opentailor.app.annual" ? 12 : 0));

    let user = await userRepository.findUser({ _id: userId });
    if (!user) {
      response = ApiResponse.notFound(commonConfig.messages['invalid_id']);
      return response;
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

    let checkTransaction = await appleTransactionsRepository.findOne({ originalTransactionId, appleTransactionId });

    let planExpiryDt = planExpiry;
    if (!checkTransaction) {
      await appleTransactionsRepository.create(transactionDt);
    } else {
      planExpiryDt = checkTransaction.expireDate;
      await appleTransactionsRepository.updateOne({ originalTransactionId, appleTransactionId }, { userId });
    }
    await userRepository.findUserAndUpdate({ _id: userId }, { isSubscription: '1', planExpiry: moment(planExpiryDt).format('YYYY-MM-DD HH:mm:ss'), originalTransactionId, productId, isFreeTrialUsed: 1 });

    let newTransaction = new Object();
    newTransaction.userId = userId;
    newTransaction.productId = productId;
    newTransaction.originalTransactionId = originalTransactionId;
    newTransaction.appleTransactionId = appleTransactionId;
    newTransaction.amount = amount;
    newTransaction.purchaseDate = new Date();
    newTransaction.expireDate = planExpiry;
    await userTransactionsRepository.create(newTransaction);

    let userData = await userRepository.findUser({ _id: userId });

    response = ApiResponse.success(userData, commonConfig.messages['plan_purchased']);

  } catch (error) {
    throw error.message;
  }

  return response;
}
inAppPurchaseService.getAppleNotification = async (req) => {
  let response;
  try {
    let [header, payload, signature] = req.signedPayload.split(".");
    let jsonData = Buffer.from(payload, 'base64').toString('utf-8');
    jsonData = JSON.parse(jsonData);

    let insert = {};
    insert.notificationType = jsonData.notificationType;

    let [transactionInfo_header, transactionInfo_payload, transactionInfo_signature] = jsonData.data.split(".");
    let json_TInfo_payload = JSON.parse(Buffer.from(transactionInfo_payload, 'base64').toString('utf-8'));

    let checkTransaction = await userTransactionsRepository.findOne({ originalTransactionId: json_TInfo_payload.originalTransactionId });
    await userTransactionsRepository.findOne({ originalTransactionId: json_TInfo_payload.originalTransactionId, userId: { $ne: "0" } });

    insert.appleTransactionId = json_TInfo_payload.transactionId || "";
    insert.originalTransactionId = json_TInfo_payload.originalTransactionId || "";
    insert.webOrderLineItemId = json_TInfo_payload.webOrderLineItemId || "";
    const purchaseDate = json_TInfo_payload.expiresDate || "";
    insert.purchaseDate = (purchaseDate != "") ? new Date(purchaseDate).toISOString() : "";
    const expireDate = json_TInfo_payload.expiresDate || "";
    insert.expireDate = (expireDate != "") ? new Date(expireDate).toISOString() : "";
    insert.environment = json_TInfo_payload.environment || "";
    insert.transactionReason = json_TInfo_payload.transactionReason || "";

    if (!checkTransaction) {
      insert.userId = "0";
      let data = await userTransactionsRepository.create(insert);
    } else {
      await userTransactionsRepository.updateOne({ originalTransactionId: json_TInfo_payload.originalTransactionId }, insert);
      if (jsonData.notificationType == "EXPIRED") {
        await userRepository.findUserAndUpdate({ _id: userId }, { planExpiry: null, isSubscription: "0", productId: null, lastPurchaseToken: null })
      }
    }
    response = ApiResponse.success({}, commonConfig.messages['plan_purchased']);
  } catch (error) {
    response = ApiResponse.success({}, error.message);
    // throw error.message;
  }

  return response;
}


inAppPurchaseService.androidPlanRestore = async (req) => {
  let response;
  const { purchaseToken } = req.body;
  try {
    let userId = req.user._id;
    const plan = await androidTransactionsRepository.findOne({ purchaseToken });
    if (!plan) {
      response = ApiResponse.notFound(commonConfig.messages['plan_not_found']);
      return response;
    }
    let userData = await userRepository.findUser({ _id: userId })

    if (userId.toString() == plan.userId) {
      userData._doc.is_social_type = (userData.isApple == "1" || userData.isGoogle == "1") ? "1" : "0";
      response = ApiResponse.success(userData, commonConfig.messages['restore_success']);
    } else {
      response = ApiResponse.conflict(commonConfig.messages['already_activate_plan']);
    }
  } catch (error) {
    throw error.message;
  }

  return response;
}


inAppPurchaseService.applePlanRestore = async (req) => {
  let response;
  const { originalTransactionId, appleTransactionId } = req.body;
  try {

    let userId = req.user._id;
    const plan = await appleTransactionsRepository.findOne({ originalTransactionId });
    if (!plan) {
      response = ApiResponse.notFound(commonConfig.messages["plan_not_found"]);
      return response;
    }
    let todayDate = new Date()
    if (plan.expireDate <= todayDate) {
      response = ApiResponse.conflict(commonConfig.messages["plan_expired"]);
      return response;
    }
    if (userId.toString() == plan.userId.toString()) {
      await userRepository.findUserAndUpdate({ _id: userId }, { isSubscription: '1', planExpiry: moment(plan.planExpiry).format('YYYY-MM-DD HH:mm:ss'), originalTransactionId, appleTransactionId, productId: plan.productId });
      let userData = await userRepository.findUser({ _id: userId })
      userData._doc.is_social_type = (userData.isApple == "1" || userData.isGoogle == "1") ? "1" : "0";

      response = ApiResponse.success(userData, commonConfig.messages["restore_success"]);
    } else {
      response = ApiResponse.conflict(commonConfig.messages["already_activate_plan"]);
    }

  } catch (error) {
    throw error.message;
  }

  return response;
}

module.exports = inAppPurchaseService;