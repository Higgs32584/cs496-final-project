let dao = require('../model/UserDAO');
const passUtil = require('../util/PasswordUtil');
const auth = require('../util/Auth');

const MIN_PASSWORD_LENGTH = 6;

/*
setting the DAO, for testing purposes
*/
exports.setDAO = function(otherDAO)
{
    dao = otherDAO;
}

// checks that a value from the request body is usable text
function isFilledString(value)
{
    return typeof value === 'string' && value.trim() !== '';
}

function isValidPassword(value)
{
    return typeof value === 'string' && value.length >= MIN_PASSWORD_LENGTH;
}


/*
save a user in the database
*/
exports.saveUser = async function(request, response) {
    if (!isFilledString(request.body.username) || !isFilledString(request.body.email)) {
        response.status(400);
        response.send({ msg: 'A username and email are required' });
        return;
    }
    if (!isValidPassword(request.body.password)) {
        response.status(400);
        response.send({ msg: `Password must be at least ${MIN_PASSWORD_LENGTH} characters` });
        return;
    }

    let newUser = {
        username: request.body.username,
        password: passUtil.hashPassword(request.body.password),
        email: request.body.email,
        admin: 0
    };

    // save the user in the DAO
    let savedUser = await dao.create(newUser);

    // if the return is not null, the user is created
    if (savedUser !== null) {
        response.status(200);
        response.send({ id: savedUser._id });
        response.end();
    } else { // if the return is null, there is a user with the existing email
        response.status(401);
        response.send({ msg: 'User with that email already exists' });
        response.end();
    }
};


/*
login as a user
*/
exports.login = async function(request, response)
{
    let email = request.body.email;
    let pw = request.body.password;

    let user = null;
    // only look up the user if the credentials are plain text
    if(isFilledString(email) && typeof pw === 'string')
    {
        user = await dao.readForLogin(email);
    }

    if(user && passUtil.checkPassword(pw, user.password)) // successful login
    {
        user.password = null;
        response.status(200);
        request.session.user = user;
        response.send(request.session.user);
    }
    else // incorrect login
    {
        response.status(401);
        response.send( {msg: 'Invalid credentials'} );
        response.end();
    }
}

/*
get the logged-in user
*/
exports.getLoggedUser = async function(request, response)
{
    if(request.session.user)
    {
        response.status(200);
        response.send(request.session.user);
    }
    else
    {
        response.status(401);
        response.send( {msg:'Unauthorized'});
    }
}

/*
log the user out of the session
*/
exports.logout = async function(request, response)
{
    if(request.session.user)
    {
        request.session.user = null;
        response.status(200);
    }
    else
    {
        response.status(409);
    }

    response.send(null);
}
/*
update the logged-in user's information.
users can only update their own account, and can never change their admin status.
fields that are left out (or empty) are not changed.
*/
exports.updateUser = async function(request, response)
{
    let loggedUser = auth.getUser(request);
    if(loggedUser === null)
    {
        response.status(401);
        response.send( {msg:'Unauthorized'} );
        return;
    }

    let updatedUser = {};
    if(isFilledString(request.body.username))
    {
        updatedUser.username = request.body.username;
    }
    if(isFilledString(request.body.email))
    {
        // make sure the new email does not belong to someone else
        let emailOwner = await dao.readByEmail(request.body.email);
        if(emailOwner && String(emailOwner._id) !== String(loggedUser._id))
        {
            response.status(409);
            response.send( {msg: 'User with that email already exists'} );
            return;
        }
        updatedUser.email = request.body.email;
    }
    // a new password is optional
    if(request.body.password)
    {
        if(!isValidPassword(request.body.password))
        {
            response.status(400);
            response.send( {msg: `Password must be at least ${MIN_PASSWORD_LENGTH} characters`} );
            return;
        }
        updatedUser.password = passUtil.hashPassword(request.body.password);
    }

    let returnedUser = await dao.update(loggedUser._id, updatedUser);
    if(returnedUser)
    {
        returnedUser.password = null;
        // keep the session in sync with the new information
        request.session.user = returnedUser;
        response.status(202);
        response.send(returnedUser);
    }
    else
    {
        response.status(404);
        response.send(null);
    }
}

/*
delete a user by their ID.
users can delete their own account, and admins can delete any account.
*/
exports.deleteUser = async function(request, response) {
    let loggedUser = auth.getUser(request);
    if (loggedUser === null) {
        response.status(401);
        response.send({msg: 'Unauthorized'});
        return;
    }

    let targetId = request.params.id;
    let deletingSelf = String(loggedUser._id) === String(targetId);

    if (auth.isAdmin(request) || deletingSelf) {
        let result = await dao.delete(targetId);

        if (result) {
            // deleting your own account also logs you out
            if (deletingSelf) {
                request.session.user = null;
            }
            response.status(204);
            response.send({msg: 'User deleted successfully'});
        } else {
            response.status(404);
            response.send({msg: 'User not found'});
        }
    } else {
        response.status(403);
        response.send({msg: 'Unauthorized to delete user'});
    }
}
