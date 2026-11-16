/*
Schema for storing all user accounts
*/

const mongoose = require('mongoose');

/*
Important data fields are:
    Username
    Email
    Password
    Admin
*/
const userSchema = new mongoose.Schema(
{
    username: String,
    email: String,
    password: String,
    admin: {
        type: Number,
        immutable: true, // this makes the admin field immutable
        required: true,
      },
});
const userModel = mongoose.model('User',userSchema);

/*
function to add a user to the database
will check for an existing user with the same username and email and,
if they exist, will return null. else will return the user saved
in the database
    assumes the 'newUser' JSON object has:
    username
    email
    password
    admin (set in the controller)
*/
exports.create = async function(newUser)
{
    // search for potential duplicates first
    let dupeEmail = await userModel.find( {email: newUser.email} ).lean();
    // if we find a user who already has the same email, return null
    if(dupeEmail.length > 0)
    {
        return null;
    }
    else // if there are no duplicates, create the user in the DB
    {
        const mongoUser = new userModel(newUser);
        await mongoUser.save();
        let dbUser = await userModel.findById( mongoUser._id ).lean();
        return dbUser;
    }
}

/*
read a user by their email
*/
exports.readByEmail = async function(userEmail)
{
    let user = await userModel.find( {email: String(userEmail)}, {password:false} ).lean();
    return user[0];
}

/*
read a user by their email, including the hashed password.
only meant for checking a login. returns null if there is no such user.
*/
exports.readForLogin = async function(userEmail)
{
    let user = await userModel.findOne( {email: String(userEmail)} ).lean();
    return user;
}

exports.readById = async function(userId)
{
    if(!mongoose.isValidObjectId(userId))
    {
        return undefined;
    }
    let user = await userModel.find({_id: userId}).lean();
    return user[0];
}

/*
read users by their names
*/
exports.readByName = async function(userName)
{
    let users = await userModel.find({username: String(userName)}, {password:false}).lean();
    return users;
}

exports.update = async function(id, updatedUser) {
    if(!mongoose.isValidObjectId(id))
    {
        return null;
    }
    let updated = await userModel.findByIdAndUpdate(id, updatedUser, { new: true }).lean();
    return updated;
};

exports.delete = async function(id) {
    if(mongoose.isValidObjectId(id)){
        let deletedUser = await userModel.findByIdAndDelete(id).lean();
        return deletedUser;
    }
    else{
        return null;
    }
};

/*
SUPER DANGEROUS FUNCTION
ONLY FOR TESTING
*/
exports.deleteAll = async function()
{
    await userModel.deleteMany();
}
