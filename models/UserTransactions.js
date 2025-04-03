const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserTransactions = new Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'users', index: 1 },
    productId: { type: String, required: true },
    purchaseToken: { type: String, default: null },
    notificationType: { type: String, default: null },
    orderId: { type: String, default: null },
    amount: { type: String, default: null },
    purchaseDate: { type: Date, required: true },
    appleTransactionId: { type: Date, default: null },
    originalTransactionId: { type: Date, default: null },
    expireDate: { type: Date, required: true },
    createdAt: { type: Date, default: new Date() },
    updatedAt: { type: Date, default: null }
});

module.exports = mongoose.model('user_transactions', UserTransactions);
