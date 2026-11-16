const userController = require('../controller/UserController');
const conIntercept = require('../util/ControllerInterceptor');
const mockDao = require('../util/mocks/MockUserDAO');
const passUtil = require('../util/PasswordUtil');

// the user that exists in the mock DAO, as it looks once logged in
const philID = mockDao.existingID;
function loggedPhil()
{
    return {
        _id: philID,
        username: 'phil',
        email: 'phil@somewhere',
        password: null,
        admin: 0
    };
}

let adminUser = {
    _id: 'admin id',
    username: 'billy',
    email:'thekid@hotshot.net',
    password: null,
    admin:1
};

let otherUser = {
    _id: 'other id',
    username: 'jakob',
    email:'dusker@hotspot.net',
    password: null,
    admin:0
};

// set the DAO to the mock DAO
beforeAll(function()
{
    userController.setDAO(mockDao);
});

test('Create an account', async function()
{
    let req = conIntercept.mockRequest();
    let res = conIntercept.mockResponse();

    let testUser =
    {
        email: 'jacob@the_hills',
        username: 'immortal jakob',
        password: 'the unbreakable code',
    };

    req.body = testUser;
    await userController.saveUser(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith({id: 'def'});
    expect(res.end).toHaveBeenCalled();
});

test('Create an account stores a hashed password and never an admin', async function()
{
    let req = conIntercept.mockRequest();
    let res = conIntercept.mockResponse();

    let spyDao = Object.assign({}, mockDao, {create: jest.fn(mockDao.create)});
    userController.setDAO(spyDao);

    req.body = {
        email: 'jacob@the_hills',
        username: 'immortal jakob',
        password: 'the unbreakable code',
        admin: 1
    };
    await userController.saveUser(req, res);
    userController.setDAO(mockDao);

    let savedUser = spyDao.create.mock.calls[0][0];
    expect(savedUser.admin).toBe(0);
    expect(savedUser.password).not.toBe('the unbreakable code');
    expect(passUtil.checkPassword('the unbreakable code', savedUser.password)).toBe(true);
});

test('Create an account with an existing user email', async function()
{
    let req = conIntercept.mockRequest();
    let res = conIntercept.mockResponse();

    let testUser =
    {
        email: 'phil@somewhere',
        username: 'not phil',
        password: 'this is not phils password',
    };

    req.body = testUser;
    await userController.saveUser(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.send).toHaveBeenCalledWith( {msg: 'User with that email already exists'} );
    expect(res.end).toHaveBeenCalled();
});

test('Create an account with missing information', async function()
{
    let req = conIntercept.mockRequest();
    let res = conIntercept.mockResponse();

    req.body = { email: 'jacob@the_hills', password: 'the unbreakable code' };
    await userController.saveUser(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
});

test('Create an account with a password that is too short', async function()
{
    let req = conIntercept.mockRequest();
    let res = conIntercept.mockResponse();

    req.body = { email: 'jacob@the_hills', username: 'immortal jakob', password: 'short' };
    await userController.saveUser(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
});

test('Login with correct credentials', async function()
{
    let req = conIntercept.mockRequest();
    let res = conIntercept.mockResponse();

    req.body.email = 'phil@somewhere';
    req.body.password = 'phils pw';

    await userController.login(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith(loggedPhil());
    expect(req.session.user).toStrictEqual(loggedPhil());
});

test('Login with incorrect credentials', async function()
{
    let req = conIntercept.mockRequest();
    let res = conIntercept.mockResponse();

    req.body.email = 'phil@somewhere';
    req.body.password = 'not phils pw';

    await userController.login(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.send).toHaveBeenCalledWith( {msg:'Invalid credentials'} );
    expect(res.end).toHaveBeenCalled();
});

test('Login with an email that does not exist', async function()
{
    let req = conIntercept.mockRequest();
    let res = conIntercept.mockResponse();

    req.body.email = 'nobody@nowhere';
    req.body.password = 'phils pw';

    await userController.login(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.send).toHaveBeenCalledWith( {msg:'Invalid credentials'} );
});

test('Login with credentials that are not text', async function()
{
    let req = conIntercept.mockRequest();
    let res = conIntercept.mockResponse();

    // an object like this would match any email if it reached the database
    req.body = { email: {$ne: null}, password: {$ne: null} };

    await userController.login(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
});

test('Get the logged-in user while logged in', async function(){
    let req = conIntercept.mockRequest();
    let res = conIntercept.mockResponse();

    req.session.user = loggedPhil();

    await userController.getLoggedUser(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith(loggedPhil());
});

test('Get the logged-in user while not logged in', async function(){
    let req = conIntercept.mockRequest();
    let res = conIntercept.mockResponse();

    req.session.user = null;

    await userController.getLoggedUser(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.send).toHaveBeenCalledWith({msg: 'Unauthorized'});
});

test('Logout while logged in', async function(){
    let req = conIntercept.mockRequest();
    let res = conIntercept.mockResponse();

    req.session.user = loggedPhil();

    await userController.logout(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(req.session.user).toBe(null);
    expect(res.send).toHaveBeenCalledWith(null);
});

test('Logout while not logged in', async function(){
    let req = conIntercept.mockRequest();
    let res = conIntercept.mockResponse();

    req.session.user = null;

    await userController.logout(req, res);

    expect(res.status).toHaveBeenCalledWith(409);
    expect(req.session.user).toBe(null);
    expect(res.send).toHaveBeenCalledWith(null);
});

describe('Update User Account', function(){
    test('Update your own account', async function(){
        let req = conIntercept.mockRequest();
        let res = conIntercept.mockResponse();

        req.session.user = loggedPhil();
        req.body = {
            username: "johndoe2",
            email: "johndoe2@example.com",
            password: "mypassword2"
        };

        await userController.updateUser(req, res);

        expect(res.status).toHaveBeenCalledWith(202);
        expect(res.send).toHaveBeenCalledWith({
            _id: philID,
            username: "johndoe2",
            email: "johndoe2@example.com",
            password: null,
            admin: 0
        });
        // the session should have the new information as well
        expect(req.session.user.username).toBe("johndoe2");
    });

    test('Update hashes the new password', async function(){
        let req = conIntercept.mockRequest();
        let res = conIntercept.mockResponse();

        let spyDao = Object.assign({}, mockDao, {update: jest.fn(mockDao.update)});
        userController.setDAO(spyDao);

        req.session.user = loggedPhil();
        req.body = { password: "mypassword2" };

        await userController.updateUser(req, res);
        userController.setDAO(mockDao);

        let [id, updates] = spyDao.update.mock.calls[0];
        expect(id).toBe(philID);
        expect(updates.password).not.toBe("mypassword2");
        expect(passUtil.checkPassword("mypassword2", updates.password)).toBe(true);
    });

    test('Update ignores the ID and admin status in the request', async function(){
        let req = conIntercept.mockRequest();
        let res = conIntercept.mockResponse();

        let spyDao = Object.assign({}, mockDao, {update: jest.fn(mockDao.update)});
        userController.setDAO(spyDao);

        req.session.user = loggedPhil();
        req.body = { _id: 'someone else', admin: 1, username: 'sneaky phil' };

        await userController.updateUser(req, res);
        userController.setDAO(mockDao);

        let [id, updates] = spyDao.update.mock.calls[0];
        expect(id).toBe(philID);
        expect(updates).toStrictEqual({username: 'sneaky phil'});
    });

    test('Update with an email that belongs to someone else', async function(){
        let req = conIntercept.mockRequest();
        let res = conIntercept.mockResponse();

        req.session.user = otherUser;
        req.body = { email: 'phil@somewhere' };

        await userController.updateUser(req, res);

        expect(res.status).toHaveBeenCalledWith(409);
    });

    test('Update with a password that is too short', async function(){
        let req = conIntercept.mockRequest();
        let res = conIntercept.mockResponse();

        req.session.user = loggedPhil();
        req.body = { password: 'short' };

        await userController.updateUser(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
    });

    test('Update while not logged in', async function(){
        let req = conIntercept.mockRequest();
        let res = conIntercept.mockResponse();

        req.session.user = null;
        req.body = { _id: philID, username: "johndoe2" };

        await userController.updateUser(req, res);

        expect(res.status).toHaveBeenCalledWith(401);
    });

    test('Update an account that no longer exists', async function(){
        let req = conIntercept.mockRequest();
        let res = conIntercept.mockResponse();

        req.session.user = otherUser;
        req.body = { username: "johndoe2" };

        await userController.updateUser(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
    });
});

describe('Delete User Account', function(){
    test('Delete your own account', async function(){
        let req = conIntercept.mockRequest();
        let res = conIntercept.mockResponse();

        req.session.user = loggedPhil();
        req.params.id = philID;

        await userController.deleteUser(req, res);

        expect(res.status).toHaveBeenCalledWith(204);
        // deleting your own account logs you out
        expect(req.session.user).toBe(null);
    });

    test('Delete another account as an admin', async function(){
        let req = conIntercept.mockRequest();
        let res = conIntercept.mockResponse();

        req.session.user = adminUser;
        req.params.id = philID;

        await userController.deleteUser(req, res);

        expect(res.status).toHaveBeenCalledWith(204);
        expect(req.session.user).toBe(adminUser);
    });

    test('Delete another account as a normal user', async function(){
        let req = conIntercept.mockRequest();
        let res = conIntercept.mockResponse();

        req.session.user = otherUser;
        req.params.id = philID;
        // claiming to be an admin in the request must not work
        req.body = { admin: 1 };

        await userController.deleteUser(req, res);

        expect(res.status).toHaveBeenCalledWith(403);
    });

    test('Delete an account while not logged in', async function(){
        let req = conIntercept.mockRequest();
        let res = conIntercept.mockResponse();

        req.session.user = null;
        req.params.id = philID;

        await userController.deleteUser(req, res);

        expect(res.status).toHaveBeenCalledWith(401);
    });

    test('Delete an account that does not exist as an admin', async function(){
        let req = conIntercept.mockRequest();
        let res = conIntercept.mockResponse();

        req.session.user = adminUser;
        req.params.id = 'not a real id';

        await userController.deleteUser(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
    });
});
