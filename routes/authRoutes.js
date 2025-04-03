const authCtrl = require('../controllers/authController');
const config = require('../config/common.config');
const express = require('express');
const userValidation = require('../validations/userValidations');
const routeMiddlewares = require('../middleware/routeMiddleware');
const multer = require('multer');
const fs = require('fs');
const publicPath = basedir + "/public/";

//Configuration for Multer
const multerStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.fieldname == 'document') {
      if (!fs.existsSync('public/document')) {
        fs.mkdirSync('public/document');
      }

      cb(null, "public/document");
    }
    else {
      if (!fs.existsSync('public/profile')) {
        fs.mkdirSync('public/profile');
      }
      cb(null, "public/profile");
    }

  },
  filename: (req, file, cb) => {
    const ext = file.mimetype.split("/")[1];
    cb(null, `img_${Date.now()}.${ext}`);
  },
});

const upload = multer({ storage: multerStorage });

const router = express.Router();


// unauthorized route
router.post('/refreshToken', upload.none(), routeMiddlewares.validateRequest(userValidation.userIdSchema), authCtrl.refreshToken);
router.post('/sendOTP', upload.none(), routeMiddlewares.validateRequest(userValidation.sendOtpSchema), authCtrl.sendOTP);
router.post('/isRegister', upload.none(), routeMiddlewares.validateRequest(userValidation.isRegisterSchema), authCtrl.isRegister);
router.post('/signUp', upload.single('profile'), routeMiddlewares.validateRequest(userValidation.signupSchema), authCtrl.signUp);
router.post('/login', upload.none(), routeMiddlewares.validateRequest(userValidation.loginUserSchema), authCtrl.login);
router.post('/forgotPassword', upload.none(), routeMiddlewares.validateRequest(userValidation.forgotPassSchema), authCtrl.forgotPassword);
router.post('/verifyOTP', upload.none(), routeMiddlewares.validateRequest(userValidation.OTPSchema), authCtrl.verifyOTP);
router.post('/verifyForgotPassOTP', upload.none(), routeMiddlewares.validateRequest(userValidation.OTPSchema), authCtrl.verifyForgotPassOTP);
router.post('/updatePassword', upload.none(), routeMiddlewares.validateRequest(userValidation.updatePassSchema), authCtrl.updatePassword);


module.exports = router;