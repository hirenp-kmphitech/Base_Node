const config = require('../config/common.config');
const express = require('express');
const fs = require('fs');
const multer = require('multer');
const adminValidation = require('../validations/adminValidation');
const routeMiddlewares = require('../middleware/routeMiddleware');
const authMiddlewares = require('../middleware/authMiddleware');
const route = express.Router();
const publicPath = basedir + "/public/";
const adminController = require('../controllers/adminController');

const multerStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        if (file.fieldname == 'skill_image') {
            if (!fs.existsSync('public/skill')) {
                fs.mkdirSync('public/skill');
            }

            cb(null, "public/skill");
        }
    },
    filename: (req, file, cb) => {
        const ext = file.mimetype.split("/")[1];
        cb(null, `img_${Date.now()}.${ext}`);
    },
});

const upload = multer({ storage: multerStorage });

route.post('/login', upload.none(), routeMiddlewares.validateRequest(adminValidation.loginSchema), adminController.login);
route.post('/forgotPassword', upload.none(), routeMiddlewares.validateRequest(adminValidation.forgotPasswordSchema), adminController.forgotPassword);
route.post('/verifyOTP', upload.none(), routeMiddlewares.validateRequest(adminValidation.verifyOTPSchema), adminController.verifyOTP);
route.post('/resetPassword', upload.none(), routeMiddlewares.validateRequest(adminValidation.resetPasswordSchema), adminController.resetPassword);

route.use(authMiddlewares.authorizeAdmin);
route.post('/userList', upload.none(), routeMiddlewares.validateRequest(adminValidation.userlistSchema), adminController.userList)
route.post('/deleteUser', upload.none(), routeMiddlewares.validateRequest(adminValidation.deleteUserSchema), adminController.deleteUser)
module.exports = route;