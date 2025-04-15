const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const AppleUsers = new Schema({
  name: { type: String, required: [true, "Please enter Name"] },
  appleId: { type: String, required: [true, "Please enter Apple id"] },
  email: { type: String },
  createdAt: { type: Date, default: Date.now },
}, { collection: 'apple_users' });


AppleUsers.methods.toJSON = function () {
  var obj = this.toObject();
  let objKeys = Object.keys(obj);
  objKeys.forEach(function (key) {
    if (obj[key] == null) {
      obj[key] = "";
    }
  });

  delete obj.createdAt;
  return obj;
}

module.exports = mongoose.model('apple_users', AppleUsers);