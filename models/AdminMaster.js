const mongoose = require('mongoose');

const AdminMaster = new mongoose.Schema({
    name: { type: String, required: [true, "Please enter name"] },
    email: { type: String, required: [true, "Please enter Email"] },
    password: { type: String, required: [true, "Please enter Password"] },
    otp: { type: String, default: null },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: null },
}, { collection: 'admin_master' });


AdminMaster.methods.toJSON = function () {
    var obj = this.toObject();
    let objKeys = Object.keys(obj);
    objKeys.forEach(function (key) {
        if (obj[key] == null) {
            obj[key] = "";
        }
    });

    delete obj.password;
    delete obj.otp;
    delete obj.createdAt;
    delete obj.updatedAt;
    delete obj.__v;

    return obj;
}

module.exports = mongoose.model('admin_master', AdminMaster);