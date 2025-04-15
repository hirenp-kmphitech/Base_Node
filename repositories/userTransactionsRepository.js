let userTransactionsRepository = {};
const UserTransactions = require('../models/UserTransactions');


const findUserById = async (id) => {
    return UserTransactions.findById(id);
};

const findOne = async (filter) => {
    return UserTransactions.findOne(filter);
};

const updateOne = async (filter, data) => {
    return UserTransactions.findOneAndUpdate(filter, data);
};

const create = async (data) => {
    return UserTransactions.create(data);
};

const findAndUpdate = async (filter, data) => {
    return UserTransactions.findOneAndUpdate(filter, data, { new: true });
};

userTransactionsRepository = {
    updateOne,
    findUserById,
    findAndUpdate,
    findOne,
    create
};
module.exports = userTransactionsRepository;
