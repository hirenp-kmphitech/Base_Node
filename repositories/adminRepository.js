let adminRepository = {};
const AdminMaster = require('../models/AdminMaster');

const findUserByEmail = async (email) => {
    return AdminMaster.findOne({ email });
};

const findUserById = async (id) => {
    return AdminMaster.findById(id);
};

const findOne = async (filter) => {
    return AdminMaster.findOne(filter);
};

const createUser = async (data) => {
    return AdminMaster.create(data);
};
const findUserByEmailPassword = async (email, password) => {
    return AdminMaster.findOne({ email, password });
};

const findUserAndUpdate = async (filter, data) => {
    return AdminMaster.findOneAndUpdate(filter, data, { new: true });
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
