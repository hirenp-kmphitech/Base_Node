const express = require('express');
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

const router = express.Router();

router.post('/androidPlanPurchase', upload.none(), authMiddlewares.authorize, routeMiddlewares.validateRequest(inappPurchaseValidation.androidPurchaseSchema), inAppPurchaseController.androidPlanPurchase);
router.post('/androidPlanRestore', upload.none(), authMiddlewares.authorize, routeMiddlewares.validateRequest(inappPurchaseValidation.androidRestorePlanSchema), inAppPurchaseController.androidPlanRestore);
router.post('/androidWebhook', upload.none(), inAppPurchaseController.androidWebhook);
router.post('/applePlanPurchase', upload.none(), authMiddlewares.authorize, routeMiddlewares.validateRequest(inappPurchaseValidation.ApplePurchaseSchema), inAppPurchaseController.applePlanPurchase);
router.post('/applePlanRestore', upload.none(), authMiddlewares.authorize, routeMiddlewares.validateRequest(inappPurchaseValidation.appleRestorePlanSchema), inAppPurchaseController.applePlanRestore);
router.post('/getAppleNotification', upload.none(), inAppPurchaseController.getAppleNotification);

module.exports = router;