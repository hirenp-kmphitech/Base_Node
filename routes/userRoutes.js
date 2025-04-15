const userCtrl = require('../controllers/userController');
const config = require('../config/common.config');
const express = require('express');
const userValidation = require('../validations/userValidations');
const routeMiddlewares = require('../middleware/routeMiddleware');
const authMiddlewares = require('../middleware/authMiddleware');
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

// authorized route
router.use(authMiddlewares.authorize);
router.post('/updateProfile', upload.single('profile'), routeMiddlewares.validateRequest(userValidation.updateProfileSchema), userCtrl.updateProfile);
router.post('/changePassword', upload.none(), routeMiddlewares.validateRequest(userValidation.changePassSchema), userCtrl.changePassword);
router.post('/logOut', upload.none(), userCtrl.logOut);
router.post('/deleteAccount', upload.none(), routeMiddlewares.validateRequest(userValidation.deleteAccountSchema), userCtrl.deleteAccount);
router.post('/contactUs', upload.none(), routeMiddlewares.validateRequest(userValidation.contactUsSchema), userCtrl.contactUs);

module.exports = router;