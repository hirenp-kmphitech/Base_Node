const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const AndroidTransactions = new Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'users', index: 1 },
    productId: { type: String, required: true },
    orderId: { type: String, required: true },
    purchaseDate: { type: Date, required: true },
    expireDate: { type: Date, required: true },
    purchaseToken: { type: String, required: true },
    notificationType: { type: String, required: true }
});

module.exports = mongoose.model('android_transactions', AndroidTransactions);
