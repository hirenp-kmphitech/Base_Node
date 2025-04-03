const config = require('../config/common.config');
const express = require('express');
const ResponseFormatter = require('../utils/helper/response-formatter');
const inappPurchaseValidation = require('../validations/inappPurchaseValidations');
const routeMiddlewares = require('../middleware/routeMiddleware');
const authMiddlewares = require('../middleware/authMiddleware');
const multer = require('multer');
const fs = require('fs');

const inAppPurchaseController = require('../controllers/inapppurchaseController');

//Configuration for Multer
const multerStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (!fs.existsSync('public/profile')) {
      fs.mkdirSync('public/profile');
    }
    cb(null, "public/profile");
  },
  filename: (req, file, cb) => {
    const ext = file.mimetype.split("/")[1];
    const unique = Math.floor(Math.random() * (9999 - 1000 + 1)) + 1000
    cb(null, `img_${Date.now()}${unique}.${ext}`);
  },
});

const upload = multer({ storage: multerStorage });

const formatter = new ResponseFormatter();
const router = express.Router();


router.post('/androidPlanPurchase', upload.none(), authMiddlewares.authorize, routeMiddlewares.validateRequest(inappPurchaseValidation.androidPurchaseSchema), async (req, res) => {
  inAppPurchaseController.androidPlanPurchase(req)
    .then((result) => {
      res.send(formatter.formatResponse(result, 1, config.messages[global.lang]['plan_purchased'], true))
    })
    .catch((err) => {
      res.send(formatter.formatResponse({}, 0, err, false))
    })
})

router.post('/androidPlanRestore', upload.none(), authMiddlewares.authorize, routeMiddlewares.validateRequest(inappPurchaseValidation.androidRestorePlanSchema), async (req, res) => {
  inAppPurchaseController.androidPlanRestore(req)
    .then((result) => {
      res.send(formatter.formatResponse(result, 1, config.messages[global.lang]['restore_success'], true))
    })
    .catch((err) => {
      res.send(formatter.formatResponse({}, 0, err, false))
    })
})

router.post('/androidWebhook', async (req, res) => {
  inAppPurchaseController.webhookFromGoogle(req)
    .then((result) => {
      res.send(formatter.formatResponse(result, 1, config.messages[global.lang]['webhook_success'], true))
    })
    .catch((err) => {
      res.send(formatter.formatResponse({}, 0, err, false))
    })
})

router.post('/applePlanPurchase', upload.none(), authMiddlewares.authorize, routeMiddlewares.validateRequest(inappPurchaseValidation.ApplePurchaseSchema), async (req, res) => {
  inAppPurchaseController.applePlanPurchase(req)
    .then((result) => {
      res.send(formatter.formatResponse(result, 1, config.messages[global.lang]['plan_purchased'], true))
    })
    .catch((err) => {
      res.send(formatter.formatResponse({}, 0, err, false))
    })
})

router.post('/getAppleNotification', async (req, res) => {
  inAppPurchaseController.getAppleNotification(req)
    .then((result) => {
      res.send(formatter.formatResponse(result, 1, config.messages[global.lang]['webhook_success'], true))
    })
    .catch((err) => {
      res.send(formatter.formatResponse({}, 0, err, false))
    })
})

router.post('/applePlanRestore', upload.none(), authMiddlewares.authorize, routeMiddlewares.validateRequest(inappPurchaseValidation.appleRestorePlanSchema), async (req, res) => {
  inAppPurchaseController.applePlanRestore(req)
    .then((result) => {
      res.send(formatter.formatResponse(result, 1, config.messages[global.lang]['restore_success'], true))
    })
    .catch((err) => {
      res.send(formatter.formatResponse({}, 0, err, false))
    })
})


module.exports = router;