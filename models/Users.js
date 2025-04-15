const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Users = new Schema({
  name: { type: String, required: [true, "Please enter Name"] },
  email: { type: String, required: [true, "Please enter Email"] },
  password: { type: String, required: [true, "Please enter Password"] },
  profile: { type: String, default: null },
  ucode: { type: String, default: null },
  deviceType: { type: String, enum: ['iOS', 'android'] },
  token: { type: String, default: '' },
  deviceToken: { type: String, default: null },
  isFb: { type: String, default: 0 },
  fbId: { type: String, default: "" },
  isGoogle: { type: String, default: 0 },
  googleId: { type: String, default: "" },
  isApple: { type: String, default: 0 },
  appleId: { type: String, default: "" },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: null },
  deletedAt: { type: Date, default: null },
  deleteReason: { type: String, default: null },
  isSubscription: { type: String, default: "0" },
  planExpiry: { type: String, default: null },
  lastPurchaseToken: { type: String, default: null },
  originalTransactionId: { type: String, default: null },
  appleTransactionId: { type: String, default: null },
  productId: { type: String, default: null },
  isFreeTrialUsed: { type: Number, default: 0 }
}, { collection: 'users' });

Users.pre('find', function () {
  const { isAll } = this.getQuery();
  if (isAll === null) {
    this.where({ deletedAt: null });
  }
});
Users.pre('findOne', function () {
  const { isAll } = this.getQuery();
  if (isAll === null) {
    this.where({ deletedAt: null });
  }
});
Users.pre('findOneAndUpdate', function () {
  const { isAll } = this.getQuery();
  if (isAll === null) {
    this.where({ deletedAt: null });
  }
});
Users.pre('countDocuments', function () {
  const { isAll } = this.getQuery();
  if (isAll === null) {
    this.where({ deletedAt: null });
  }
});

Users.statics = {
  /**
  * Single data
  * @param {*} filter 
  * @returns 
  */
  async get(id) {
    return this.findById(id).exec();
  },

  /**
  * list data
  * @param {*} filter 
  * @returns 
  */
  async list(filter = {}) {
    return this.find(filter).exec();
  },

}

const publicPath = APP_URL + "/public/";

Users.methods.toJSON = function () {
  var obj = this.toObject();
  let objKeys = Object.keys(obj);
  objKeys.forEach(function (key) {
    if (obj[key] == null) {
      obj[key] = "";
    }
  });

  delete obj.createdAt;
  delete obj.updatedAt;
  delete obj.deletedAt;
  delete obj.__v;
  if (obj.profile && obj.profile != "") {
    obj.profile = publicPath + 'profile/' + obj.profile;
  }

  return obj;
}

module.exports = mongoose.model('users', Users);