const express = require('express');
const mainRouter = express.Router();


const users = require("./userRoutes");
const auth = require("./authRoutes");
const admin = require("./adminRoutes");
mainRouter.use('/user', users);
mainRouter.use('/auth', auth);
mainRouter.use('/admin', admin);
const inapppurchase = require("./inapppurchaseRoutes");
mainRouter.use('/inapppurchase', inapppurchase);

// var admin = require('./adminRoutes')
// mainRouter.use('/admin', admin)

module.exports = function (app) {
    app.use('/api/', mainRouter);
};
