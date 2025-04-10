const mongoose = require('mongoose');

const Admins = new mongoose.Schema({
    name: { type: String, required: [true, "Please enter name"] },
    email: { type: String, required: [true, "Please enter Email"] },
    password: { type: String, required: [true, "Please enter Password"] },
    otp: { type: String, default: null },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: null },
}, { collection: 'admins' });


Admins.statics.seedData = async function () {
    try {
        let chkData = await this.findOne({ email: "admin@gmail.com" });

        if (!chkData) {
            const insertedData = await this.create({
                name: "admin",
                email: "admin@gmail.com",
                password: "12345678",
            });
            console.log("Data seeded successfully:", insertedData);
        }
    } catch (error) {
        console.error("Error seeding data:", error);
    }
};

Admins.methods.toJSON = function () {
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

module.exports = mongoose.model('admins', Admins);