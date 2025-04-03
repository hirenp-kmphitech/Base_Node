const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const AndroidTransactionMaster = new Schema({
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'user_master', index: 1 },
    product_id: { type: String, required: true },
    order_id: { type: String, required: true },
    purchase_date: { type: Date, required: true },
    expire_date: { type: Date, required: true },
    purchase_token: { type: String, required: true },
    notification_type: { type: String, required: true }
});

module.exports = mongoose.model('android_transaction_master', AndroidTransactionMaster);
