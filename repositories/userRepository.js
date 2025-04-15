let userRepository = {};
const Users = require('../models/Users');

const findUserByEmail = async (email) => {
    return await Users.findOne({ email, deletedAt: null });
};

const findUserById = async (id) => {
    return await Users.findById(id);
};

const findUser = async (filter) => {
    return await Users.findOne({ ...filter, deletedAt: null });
};

const createUser = async (data) => {
    return await Users.create(data);
};
const findUserByEmailPassword = async (email, password) => {
    return await Users.findOne({ email, password, deletedAt: null });
};

const findUserAndUpdate = async (filter, data) => {
    return await Users.findOneAndUpdate(filter, data, { new: true });
};

userRepository = {
    findUserByEmail,
    findUserById,
    findUserByEmailPassword,
    findUserAndUpdate,
    findUser,
    createUser
};
module.exports = userRepository;
