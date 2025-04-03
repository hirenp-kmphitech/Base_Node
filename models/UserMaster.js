const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserMaster = new Schema({
  name: { type: String, required: [true, "Please enter Name"] },
  email: { type: String, required: [true, "Please enter Email"] },
  password: { type: String, required: [true, "Please enter Password"] },
  isConfirm: { type: String, default: 0 },
  profile: { type: String, default: null },
  ucode: { type: String, default: null },
  device_type: { type: String, enum: ['iOS', 'android'] },
  token: { type: String, default: '' },
  device_token: { type: String, default: null },
  is_fb: { type: String, default: 0 },
  fb_id: { type: String, default: "" },
  is_google: { type: String, default: 0 },
  google_id: { type: String, default: "" },
  is_apple: { type: String, default: 0 },
  apple_id: { type: String, default: "" },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: null },
  deleted_at: { type: Date, default: null },
  delete_reason: { type: String, default: null },
  is_subscription: { type: String, default: "0" },
  plan_expiry: { type: String, default: null },
  last_purchase_token: { type: String, default: null },
  original_transaction_id: { type: String, default: null },
  apple_transaction_id: { type: String, default: null },
  product_id: { type: String, default: null },
  is_free_trial_used: { type: Number, default: 0 }
}, { collection: 'user_master' });

UserMaster.pre('find', function () {
  const { isAll } = this.getQuery();
  if (isAll === null) {
    this.where({ deleted_at: null });
  }
});
UserMaster.pre('findOne', function () {
  const { isAll } = this.getQuery();
  if (isAll === null) {
    this.where({ deleted_at: null });
  }
});
UserMaster.pre('findOneAndUpdate', function () {
  const { isAll } = this.getQuery();
  if (isAll === null) {
    this.where({ deleted_at: null });
  }
});
UserMaster.pre('countDocuments', function () {
  const { isAll } = this.getQuery();
  if (isAll === null) {
    this.where({ deleted_at: null });
  }
});

UserMaster.statics = {
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

UserMaster.methods.toJSON = function () {
  var obj = this.toObject();
  let objKeys = Object.keys(obj);
  objKeys.forEach(function (key) {
    if (obj[key] == null) {
      obj[key] = "";
    }
  });

  delete obj.created_at;
  delete obj.updated_at;
  delete obj.deleted_at;
  delete obj.__v;
  if (obj.profile && obj.profile != "") {
    obj.profile = publicPath + 'profile/' + obj.profile;
  }

  return obj;
}

module.exports = mongoose.model('user_master', UserMaster);