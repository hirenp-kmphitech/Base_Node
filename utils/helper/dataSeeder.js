const Admins = require("../../models/Admins");
const AppVersion = require("../../models/AppVersion");


module.exports.dataSeeder = async function () {
    try {
        await Admins.seedData();
        await AppVersion.seedData();
        return;
    } catch (error) {
        return error;
    }
}