let androidTransactionsRepository = {};
const AndroidTransactions = require('../models/AndroidTransactions');


const findUserById = async (id) => {
    return AndroidTransactions.findById(id);
};

const findOne = async (filter) => {
    return AndroidTransactions.findOne(filter);
};

const create = async (data) => {
    return AndroidTransactions.create(data);
};

const findAndUpdate = async (filter, data) => {
    return AndroidTransactions.findOneAndUpdate(filter, data, { new: true });
};

androidTransactionsRepository = {
    findUserById,
    findAndUpdate,
    findOne,
    create
};
module.exports = androidTransactionsRepository;
