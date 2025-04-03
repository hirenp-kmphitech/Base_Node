const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const AppleTransactions = new Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'users', index: 1 },
    appleTransactionId: { type: String, required: true },
    originalTransactionId: { type: String, required: true },
    webOrderLineItemId: { type: String, default: null },
    productId: { type: String, required: true },
    purchaseDate: { type: Date, required: true },
    environment: { type: Date, default: null },
    transactionReason: { type: Date, default: null },
    notificationType: { type: Date, default: null },
    expireDate: { type: Date, required: true }
});

module.exports = mongoose.model('apple_transactions', AppleTransactions);
