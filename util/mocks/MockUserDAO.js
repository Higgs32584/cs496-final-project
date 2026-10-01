const passUtil = require('../PasswordUtil');

// the one user that 'exists' in this mock. a new copy is made for every call,
// so tests cannot change it for each other.
const existingID = '5c4e7f1d148f900b0d416aea';
const existingPassword = passUtil.hashPassword('phils pw');

function getExistingUser() {
    return {
        _id: existingID,
        username: 'phil',
        email: 'phil@somewhere',
        password: existingPassword,
        admin: 0
    };
}

exports.existingID = existingID;

exports.create = async function(user) {
    // if an existing user has the same email, return null
    if (user.email === getExistingUser().email) {
        return null;
    } else { // return the user with their new ID
        user._id = "def";
        return user;
    }
};

exports.readForLogin = async function(email) {
    let existingUser = getExistingUser();
    if (email === existingUser.email) {
        return existingUser;
    } else {
        return null;
    }
};

exports.readByEmail = async function(email) {
    let existingUser = getExistingUser();
    if (email === existingUser.email) {
        delete existingUser.password;
        return existingUser;
    } else {
        return undefined;
    }
};

exports.update = async function(id, updatedUser) {
    let existingUser = getExistingUser();
    if (String(id) === existingUser._id) {
        return Object.assign(existingUser, updatedUser);
    } else {
        return null;
    }
};

exports.readById = async function(id) {
    let existingUser = getExistingUser();
    if (String(id) === existingUser._id) {
        return existingUser;
    } else {
        return undefined;
    }
};

exports.delete = async function(id) {
    let existingUser = getExistingUser();
    if (String(id) === existingUser._id) {
        return existingUser;
    } else {
        return null;
    }
};
