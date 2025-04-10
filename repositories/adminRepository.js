let adminRepository = {};
const Admins = require('../models/Admins');

const findUserByEmail = async (email) => {
    return Admins.findOne({ email });
};

const findUserById = async (id) => {
    return Admins.findById(id);
};

const findOne = async (filter) => {
    return Admins.findOne(filter);
};

const createUser = async (data) => {
    return Admins.create(data);
};
const findUserByEmailPassword = async (email, password) => {
    return Admins.findOne({ email, password });
};

const findUserAndUpdate = async (filter, data) => {
    return Admins.findOneAndUpdate(filter, data, { new: true });
};

adminRepository = {
    findUserByEmail,
    findUserById,
    findUserByEmailPassword,
    findUserAndUpdate,
    findOne,
    createUser
};
module.exports = adminRepository;
