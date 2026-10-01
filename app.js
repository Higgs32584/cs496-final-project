/*
    builds the express application: middleware, sessions, and the route table.
    this file does not connect to the database or start listening, so that
    the tests can create the app on their own. `ProjectServer.js` does both.
*/
require('dotenv').config(); // for the values from the .env file
const crypto = require('crypto');

// necessary imports
const express = require('express'); // main server application
const morgan = require('morgan'); //import morgan for logging
const session = require('express-session'); // for session management
const cors = require('cors'); // lets the frontend, which runs on a different origin, call the server
const multer = require('multer'); // for image/file uploads

// importing controllers
const userController = require('./controller/UserController'); // controller for user information
const meetingController = require('./controller/MeetingController'); // controller for meeting/event information
const speakerController = require('./controller/SpeakerController'); // controller for speaker information
const newsController = require('./controller/NewsController'); // controller for news updates and information

const MAX_FILE_SIZE = 8 * 1024 * 1024; // max file size in bytes. should be 8MB
const COOKIE_AGE = 1000 * 60 * 60 * 24; // 24 hours

/*
    express 4 does not catch errors from async functions, so a rejected promise
    in a controller would leave the request hanging and crash the server.
    wrapping each controller function passes those errors to the error handler.
*/
function wrap(controllerFunction)
{
    return function(request, response, next)
    {
        Promise.resolve(controllerFunction(request, response, next)).catch(next);
    };
}

/*
    the secret used to sign session cookies. it should come from the .env file.
    without one, a random secret is made, which logs everyone out on each restart.
*/
function getSessionSecret()
{
    if(process.env.SESSION_SECRET)
    {
        return process.env.SESSION_SECRET;
    }
    if(process.env.NODE_ENV !== 'test')
    {
        console.warn('SESSION_SECRET is not set. Using a temporary secret; sessions will not survive a restart.');
    }
    return crypto.randomBytes(32).toString('hex');
}

/*
    options:
        sessionStore - where sessions are saved. defaults to memory, which is only suitable for tests.
        logging - set to false to turn off request logging.
*/
exports.createApp = function(options = {})
{
    const app = express();

    // cors options
    app.use( cors({
        origin: process.env.CLIENT_ORIGIN || 'http://localhost:3000',
        methods: 'GET,POST,DELETE',
        credentials: true
    }));

    // Store file data in memory directly. dangerous with very large files.
    const storage = multer.memoryStorage();

    /*
        creating the actual instance of multer that the server will use,
        which i have called 'upload.'

        it is REALLY IMPORTANT that we do NOT use 'app.use(upload)' or 'app.use(multer),'
        as that will attach multer to every request which is really dangerous since it allows
        malicious users to send files through routes the server does not anticipate which
        is bad for a lot of reasons.

        the file size limit is there because MongoDB documents cannot be larger
        than 16mb without GridFS. the filter rejects anything that is not an image.
    */
    const upload = multer({
        storage: storage,
        limits: {fileSize: MAX_FILE_SIZE},
        fileFilter: function(request, file, cb)
        {
            if(file.mimetype && file.mimetype.startsWith('image/'))
            {
                cb(null, true);
            }
            else
            {
                let error = new Error('Only image files can be uploaded');
                error.status = 415;
                cb(error);
            }
        }
    });

    // setting up the server with important modules
    if(options.logging !== false)
    {
        app.use( morgan('dev') );
    }
    app.use( express.urlencoded({extended:true}) );
    app.use( express.json() );

    // session settings
    app.use(session({
        secret: getSessionSecret(),
        name: 'session-id', // name of the cookie, how it will be read from the client
        cookie: {
            maxAge: COOKIE_AGE,
            httpOnly: true,
            secure:false,
            sameSite: 'lax'},
        store: options.sessionStore,
        resave: true,
        saveUninitialized: false
    }));


    //operations to interact with the database. functions defined in the controller
    // UserController operations
    app.post('/saveuser', wrap(userController.saveUser));
    app.post('/updateuser', wrap(userController.updateUser));
    app.delete('/user/:id', wrap(userController.deleteUser));
    app.post('/dologin', wrap(userController.login));
    app.get('/getlogged', wrap(userController.getLoggedUser));
    app.get('/logout', wrap(userController.logout));


    // MeetingController operations
    /*
        these functions upload an image to the DAO via the controller
        note the second parameter is the `upload.single`, which is telling the server
        to attach the instance of Multer created earlier to this route.

        also note `meetingImage` is the exact same as the fieldname from the frontend. check
        `CreateMeeting.js,` specifically the line that says `newMeeting.append('meetingImage', image);`
        it is VERY important that these are both the same or else multer will throw a vague error
        and it will be very hard to debug.
    */
    app.post('/savemeeting', upload.single('meetingImage'), wrap(meetingController.saveMeeting));
    app.post('/updatemeeting', upload.single('meetingImage'), wrap(meetingController.updateMeeting));
    app.delete('/meeting/:id', wrap(meetingController.deleteMeeting));
    app.get('/allmeetings', wrap(meetingController.readAllMeetings));
    app.get('/upcomingmeetings', wrap(meetingController.readFutureMeetings));
    app.get('/meeting/:id', wrap(meetingController.readMeetingByID));
    app.get('/pastmeetings', wrap(meetingController.readPastMeetings));
    app.post('/searchmeetings', wrap(meetingController.searchForMeetings));


    // SpeakerController operations
    app.post('/savespeaker', wrap(speakerController.saveSpeaker));
    app.get('/allspeakers', wrap(speakerController.readAllSpeakers));
    app.post('/editspeaker', wrap(speakerController.updateSpeaker));
    app.get('/speaker/:id', wrap(speakerController.readSpeakerByID));
    app.delete('/speaker/:id', wrap(speakerController.deleteSpeaker));

    // NewsController operations
    app.post('/savenewspost', upload.array('newsImages', 10), wrap(newsController.saveNewsPost));
    app.get('/getnews', wrap(newsController.readAllNews));
    app.post('/updatenewspost', upload.array('newsImages', 10), wrap(newsController.updateNewsPost));
    app.delete('/news/:id', wrap(newsController.deleteNewsPost));
    app.get('/news/:id', wrap(newsController.findNewsPostByID));


    /*
        error handler. anything thrown by multer or by a controller ends up here.
        it must be the last thing added to the app, and must have four parameters.
    */
    app.use(function(error, request, response, next)
    {
        if(error instanceof multer.MulterError)
        {
            // LIMIT_FILE_SIZE is the only one a normal user can run into
            let status = error.code === 'LIMIT_FILE_SIZE' ? 413 : 400;
            response.status(status);
            response.send({msg: error.message});
        }
        else if(error.status && error.status < 500)
        {
            response.status(error.status);
            response.send({msg: error.message});
        }
        else if(error.name === 'ValidationError' || error.name === 'CastError')
        {
            // mongoose refused the data, for example a meeting without a topic or with a date that is not a date
            response.status(400);
            response.send({msg: error.message});
        }
        else
        {
            console.error(error);
            response.status(500);
            response.send({msg: 'Internal server error'});
        }
    });

    return app;
}
