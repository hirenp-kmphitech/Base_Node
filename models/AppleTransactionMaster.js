const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const AppleTransactionMaster = new Schema({
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'user_master', index: 1 },
    apple_transaction_id: { type: String, required: true },
    original_transaction_id: { type: String, required: true },
    web_order_line_item_id: { type: String, default: null },
    product_id: { type: String, required: true },
    purchase_date: { type: Date, required: true },
    environment: { type: Date, default: null },
    transaction_reason: { type: Date, default: null },
    notification_type: { type: Date, default: null },
    expire_date: { type: Date, required: true }
});

module.exports = mongoose.model('apple_transaction_master', AppleTransactionMaster);
