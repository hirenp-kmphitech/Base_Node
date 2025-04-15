const mongoose = require('mongoose');
const commonConfig = require('../config/common.config');
const Schema = mongoose.Schema;

const AppVersion = new Schema({
  versionCode: { type: String },
  deviceType: { type: String },
  createdAt: { type: Date, default: Date.now },
  deletedAt: { type: Date, default: null },
}, { collection: 'AppVersion' });

AppVersion.statics.seedData = async function () {
  const sampleData = commonConfig.VERSION_DATA;
  try {
    let chkData = await this.find();
    if (chkData.length == 0) {
      const insertedData = await this.insertMany(sampleData);
      console.log("Data seeded successfully:", insertedData);
    }
  } catch (error) {
    console.error("Error seeding data:", error);
  }
};

AppVersion.methods.toJSON = function () {
  delete obj.createdAt;
  delete obj.__v;
  return obj;
}

module.exports = mongoose.model('AppVersion', AppVersion);