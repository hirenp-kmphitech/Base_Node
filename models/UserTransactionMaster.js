const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserTransactionMaster = new Schema({
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'user_master', index: 1 },
    product_id: { type: String, required: true },
    purchase_token: { type: String, default: null },
    notification_type: { type: String, default: null },
    order_id: { type: String, default: null },
    amount: { type: String, default: null },
    purchase_date: { type: Date, required: true },
    apple_transaction_id: { type: Date, default: null },
    original_transaction_id: { type: Date, default: null },
    expire_date: { type: Date, required: true },
    created_at: { type: Date, default: new Date() },
    updated_at: { type: Date, default: null }
});

module.exports = mongoose.model('user_transaction_master', UserTransactionMaster);
