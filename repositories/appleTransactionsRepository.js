let appleTransactionsRepository = {};
const AppleTransactions = require('../models/AppleTransactions');


const findUserById = async (id) => {
    return AppleTransactions.findById(id);
};

const findOne = async (filter) => {
    return AppleTransactions.findOne(filter);
};

const updateOne = async (filter, data) => {
    return AppleTransactions.findOneAndUpdate(filter, data);
};

const create = async (data) => {
    return AppleTransactions.create(data);
};

const findAndUpdate = async (filter, data) => {
    return AppleTransactions.findOneAndUpdate(filter, data, { new: true });
};

appleTransactionsRepository = {
    updateOne,
    findUserById,
    findAndUpdate,
    findOne,
    create
};
module.exports = appleTransactionsRepository;
