const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const VersionMaster = new Schema({
  versionCode: { type: String },
  deviceType: { type: String },
  createdAt: { type: Date, default: Date.now },
  deletedAt: { type: Date, default: null },
}, { collection: 'version_master' });

VersionMaster.methods.toJSON = function () {
  delete obj.createdAt;
  delete obj.__v;
  return obj;
}

module.exports = mongoose.model('version_master', VersionMaster);