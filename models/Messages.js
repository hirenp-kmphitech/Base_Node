const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Messages = new Schema({
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'users', index: true },
  receiverId: { type: mongoose.Schema.Types.ObjectId, ref: 'users', index: true },
  msg: { type: String, required: [true, "Please enter question"] },
  msgType: { type: String, enum: ['text', 'image', 'video'], default: 'text' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: null },
}, { collection: 'messages' });

Messages.pre('find', function () {
  this.where({ deletedAt: null });
});
Messages.pre('findOne', function () {
  this.where({ deletedAt: null });
});
Messages.pre('countDocuments', function () {
  this.where({ deletedAt: null });
});

Messages.statics = {
  /**
   * Single data
   * @param {*} filter 
   * @returns 
   */
  async get(id, fields = "", sort = "") {
    return this.findById(id).populate("senderId", "fname lname profile tag_id is_verified deviceToken user_type").populate("receiverId", "fname lname profile tag_id is_verified deviceToken user_type").select(fields).sort(sort).exec();
  },
  /**
   * List data
   * @param {*} filter 
   * @returns 
   */
  async list(filter, fields = "", sort = "") {
    return this.find(filter).populate("senderId", "fname lname profile tag_id is_verified deviceToken user_type").populate("receiverId", "fname lname profile tag_id is_verified deviceToken user_type").select(fields).sort(sort).exec();
  }
}




Messages.methods.toJSON = function () {
  var obj = this.toObject();
  let objKeys = Object.keys(obj);
  objKeys.forEach(function (key) {
    if (obj[key] == null) {
      obj[key] = "";
    }
  });
  const profilePath = global.APP_URL + "/public/profile/";

  obj.sender = obj.senderId;
  if (obj.sender && obj.sender.profile && obj.sender.profile != "") {
    obj.sender.profile = profilePath + obj.sender.profile;
  }
  delete obj.senderId;

  obj.receiver = obj.receiverId;
  if (obj.receiver && obj.receiver.profile && obj.receiver.profile != "") {
    obj.receiver.profile = profilePath + obj.receiver.profile;
  }
  delete obj.receiverId;

  // delete obj.createdAt;
  delete obj.__v;
  return obj;
}

module.exports = mongoose.model('messages', Messages);