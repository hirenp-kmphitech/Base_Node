let appleUserRepository = {};
const AppleUsers = require('../models/AppleUsers');


const findUserById = async (id) => {
    return AppleUsers.findById(id);
};

const findUser = async (filter) => {
    return AppleUsers.findOne(filter);
};

const insert = async (data) => {
    return AppleUsers.create(data);
};

const findUserAndUpdate = async (filter, data) => {
    return AppleUsers.findOneAndUpdate(filter, data, { new: true });
};

appleUserRepository = {
    findUserById,
    findUserAndUpdate,
    findUser,
    insert
};
module.exports = appleUserRepository;
