const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const MessageMaster = new Schema({
  sender_id: { type: mongoose.Schema.Types.ObjectId, ref: 'user_master', index: true },
  receiver_id: { type: mongoose.Schema.Types.ObjectId, ref: 'user_master', index: true },
  msg: { type: String, required: [true, "Please enter question"] },
  msg_type: { type: String, enum: ['text', 'image', 'video'], default: 'text' },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: null },
}, { collection: 'message_master' });

MessageMaster.pre('find', function () {
  this.where({ deleted_at: null });
});
MessageMaster.pre('findOne', function () {
  this.where({ deleted_at: null });
});
MessageMaster.pre('countDocuments', function () {
  this.where({ deleted_at: null });
});

MessageMaster.statics = {
  /**
   * Single data
   * @param {*} filter 
   * @returns 
   */
  async get(id, fields = "", sort = "") {
    return this.findById(id).populate("sender_id", "fname lname profile tag_id is_verified device_token user_type").populate("receiver_id", "fname lname profile tag_id is_verified device_token user_type").select(fields).sort(sort).exec();
  },
  /**
   * List data
   * @param {*} filter 
   * @returns 
   */
  async list(filter, fields = "", sort = "") {
    return this.find(filter).populate("sender_id", "fname lname profile tag_id is_verified device_token user_type").populate("receiver_id", "fname lname profile tag_id is_verified device_token user_type").select(fields).sort(sort).exec();
  }
}




MessageMaster.methods.toJSON = function () {
  var obj = this.toObject();
  let objKeys = Object.keys(obj);
  objKeys.forEach(function (key) {
    if (obj[key] == null) {
      obj[key] = "";
    }
  });
  const profilePath = global.APP_URL + "/public/profile/";

  obj.sender = obj.sender_id;
  if (obj.sender && obj.sender.profile && obj.sender.profile != "") {
    obj.sender.profile = profilePath + obj.sender.profile;
  }
  delete obj.sender_id;

  obj.receiver = obj.receiver_id;
  if (obj.receiver && obj.receiver.profile && obj.receiver.profile != "") {
    obj.receiver.profile = profilePath + obj.receiver.profile;
  }
  delete obj.receiver_id;

  // delete obj.created_at;
  delete obj.__v;
  return obj;
}

module.exports = mongoose.model('message_master', MessageMaster);