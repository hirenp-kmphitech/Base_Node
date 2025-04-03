let userRepository = {};
const Users = require('../models/Users');

const findUserByEmail = async (email) => {
    return Users.findOne({ email });
};

const findUserById = async (id) => {
    return Users.findById(id);
};

const findUser = async (filter) => {
    return Users.findOne(filter);
};

const createUser = async (data) => {
    return Users.create(data);
};
const findUserByEmailPassword = async (email, password) => {
    return Users.findOne({ email, password });
};

const findUserAndUpdate = async (filter, data) => {
    return Users.findOneAndUpdate(filter, data, { new: true });
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
